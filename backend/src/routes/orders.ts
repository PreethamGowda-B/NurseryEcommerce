import { Router, Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/orderService.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { createOrderSchema, orderParamSchema } from '../schemas/order.js';
import { sendSuccess } from '../utils/response.js';

const router = Router();

// Require authentication for all order routes
router.use(authenticate);

/**
 * POST /api/orders
 * Place a new order
 */
router.post(
  '/orders',
  validate(createOrderSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { addressId } = req.body;
      const order = await OrderService.createOrder(userId, addressId);
      sendSuccess(res, order, 'Order created successfully', 201);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/orders
 * Get authenticated customer order history
 */
router.get('/orders', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const orders = await OrderService.getCustomerOrders(userId);
    sendSuccess(res, orders);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/orders/:orderNumber
 * Get order detail by order number with IDOR protection
 */
router.get(
  '/orders/:orderNumber',
  validate(orderParamSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const orderNumber = req.params.orderNumber as string;
      const order = await OrderService.getCustomerOrder(userId, orderNumber);
      sendSuccess(res, order);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
