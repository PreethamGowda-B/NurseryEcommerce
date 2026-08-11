import { Router, Request, Response, NextFunction } from 'express';
import { InventoryService } from '../../services/inventoryService.js';
import { authenticate } from '../../middleware/authenticate.js';
import { requireAdmin } from '../../middleware/requireAdmin.js';
import { validate } from '../../middleware/validate.js';
import {
  adjustStockSchema,
  listInventorySchema,
  listInventoryTransactionsSchema,
} from '../../schemas/inventory.js';
import { sendSuccess } from '../../utils/response.js';

const router = Router();

// Apply Admin Auth & RBAC to all routes
router.use(authenticate, requireAdmin);

/**
 * GET /api/admin/inventory/metrics
 * Inventory summary metrics
 */
router.get(
  '/admin/inventory/metrics',
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const metrics = await InventoryService.getInventoryMetrics();
      sendSuccess(res, metrics, 'Inventory metrics retrieved');
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/admin/inventory
 * List inventory items with stock status
 */
router.get(
  '/admin/inventory',
  validate(listInventorySchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await InventoryService.listInventory(req.query as any);
      sendSuccess(res, result, 'Inventory list retrieved');
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/admin/inventory/:productId/adjust
 * Manual stock adjustment with audit trail
 */
router.post(
  '/admin/inventory/:productId/adjust',
  validate(adjustStockSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminId = req.user!.id;
      const productId = req.params.productId as string;
      const { quantity, reason } = req.body;
      const ipAddress = req.ip;

      const result = await InventoryService.adjustStock(
        adminId,
        productId,
        quantity,
        reason,
        ipAddress
      );
      sendSuccess(res, result, 'Stock adjusted successfully');
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/admin/inventory/transactions
 * Inventory movement history
 */
router.get(
  '/admin/inventory/transactions',
  validate(listInventoryTransactionsSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await InventoryService.listTransactions(req.query as any);
      sendSuccess(res, result, 'Inventory transactions retrieved');
    } catch (err) {
      next(err);
    }
  }
);

export default router;
