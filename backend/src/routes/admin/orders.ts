import { Router, Request, Response, NextFunction } from 'express';
import { AdminOrderService } from '../../services/adminOrderService.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireAdmin } from '../../middleware/requireAdmin.js';
import { validate } from '../../middleware/validate.js';
import {
  listAdminOrdersSchema,
  updateOrderStatusSchema,
  updateInternalNotesSchema,
} from '../../schemas/adminOrder.js';
import { sendSuccess } from '../../utils/response.js';

const router = Router();

// Apply Admin Auth & RBAC to all routes
router.use(authenticate, requireAdmin);

/**
 * GET /api/admin/orders
 * Paginated admin orders list with search and filters
 */
router.get(
  '/admin/orders',
  validate(listAdminOrdersSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await AdminOrderService.listOrders(req.query as any);
      sendSuccess(res, result, 'Admin orders retrieved');
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/admin/orders/:orderNumber
 * Detailed single order view for admin
 */
router.get(
  '/admin/orders/:orderNumber',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orderNumber = req.params.orderNumber as string;
      const data = await AdminOrderService.getOrder(orderNumber);
      sendSuccess(res, data, 'Order detail retrieved');
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PATCH /api/admin/orders/:orderNumber/status
 * Controlled order status update
 */
router.patch(
  '/admin/orders/:orderNumber/status',
  validate(updateOrderStatusSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = req.user!.id;
      const orderNumber = req.params.orderNumber as string;
      const { status, note, internalNotes } = req.body;
      const ipAddress = req.ip;

      const data = await AdminOrderService.updateOrderStatus(
        adminId,
        orderNumber,
        status,
        note,
        internalNotes,
        ipAddress
      );
      sendSuccess(res, data, 'Order status updated successfully');
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/admin/orders/:orderNumber/cod/collect
 * Controlled COD cash collection
 */
router.post(
  '/admin/orders/:orderNumber/cod/collect',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = req.user!.id;
      const orderNumber = req.params.orderNumber as string;
      const ipAddress = req.ip;

      const data = await AdminOrderService.collectCodPayment(adminId, orderNumber, ipAddress);
      sendSuccess(res, data, 'COD payment collected successfully');
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/admin/orders/:orderNumber/history
 * Order timeline history
 */
router.get(
  '/admin/orders/:orderNumber/history',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orderNumber = req.params.orderNumber as string;
      const data = await AdminOrderService.getOrder(orderNumber);
      sendSuccess(res, data.statusHistory, 'Order status history retrieved');
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PATCH /api/admin/orders/:orderNumber/notes
 * Update internal admin notes
 */
router.patch(
  '/admin/orders/:orderNumber/notes',
  validate(updateInternalNotesSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = req.user!.id;
      const orderNumber = req.params.orderNumber as string;
      const { internalNotes } = req.body;

      const data = await AdminOrderService.updateInternalNotes(
        adminId,
        orderNumber,
        internalNotes,
        req.ip
      );
      sendSuccess(res, data, 'Internal notes updated');
    } catch (err) {
      next(err);
    }
  }
);

export default router;
