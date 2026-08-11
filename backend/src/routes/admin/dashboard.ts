import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../../db/client.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireAdmin } from '../../middleware/requireAdmin.js';
import { sendSuccess } from '../../utils/response.js';

const router = Router();

router.use(authenticate, requireAdmin);

/**
 * GET /api/admin/dashboard/stats
 * Real server-calculated dashboard statistics, revenue, and inventory metrics
 */
router.get(
  '/admin/dashboard/stats',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const [
        totalProducts,
        publishedProducts,
        totalCategories,
        totalOrders,
        pendingOrders,
        confirmedOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        paidOrdersAggregate,
        codPendingAggregate,
        productsList,
      ] = await Promise.all([
        prisma.product.count(),
        prisma.product.count({ where: { published: true } }),
        prisma.category.count(),
        prisma.order.count(),
        prisma.order.count({ where: { status: 'PENDING' } }),
        prisma.order.count({ where: { status: 'CONFIRMED' } }),
        prisma.order.count({ where: { status: 'PROCESSING' } }),
        prisma.order.count({ where: { status: 'SHIPPED' } }),
        prisma.order.count({ where: { status: 'DELIVERED' } }),
        prisma.order.count({ where: { status: 'CANCELLED' } }),
        prisma.order.aggregate({
          _sum: { total: true },
          where: { paymentStatus: 'PAID' },
        }),
        prisma.order.aggregate({
          _sum: { total: true },
          where: { paymentMethod: 'COD', paymentStatus: 'PENDING' },
        }),
        prisma.product.findMany({
          select: { stockQuantity: true, lowStockThreshold: true },
        }),
      ]);

      let lowStockProducts = 0;
      let outOfStockProducts = 0;
      let totalUnits = 0;

      for (const p of productsList) {
        totalUnits += p.stockQuantity;
        if (p.stockQuantity === 0) {
          outOfStockProducts++;
        } else if (p.stockQuantity <= p.lowStockThreshold) {
          lowStockProducts++;
        }
      }

      sendSuccess(res, {
        totalProducts,
        publishedProducts,
        lowStockProducts,
        outOfStockProducts,
        totalCategories,
        totalUnits,
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          confirmed: confirmedOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },
        revenue: {
          paidRevenue: paidOrdersAggregate._sum.total || 0,
          codPendingAmount: codPendingAggregate._sum.total || 0,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
