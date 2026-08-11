import { Router, Request, Response, NextFunction } from 'express';
import { CartService } from '../services/cartService.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import {
  addToCartSchema,
  updateCartItemSchema,
  removeCartItemSchema,
  mergeCartSchema,
} from '../schemas/cart.js';
import { sendSuccess } from '../utils/response.js';

const router = Router();

// Require authentication for all customer cart operations
router.use(authenticate);

/**
 * GET /api/cart
 * Fetch current authenticated customer's cart
 */
router.get('/cart', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const cart = await CartService.getFormattedCart(userId);
    sendSuccess(res, cart);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/cart/items
 * Add product to customer cart
 */
router.post(
  '/cart/items',
  validate(addToCartSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { productId, quantity } = req.body;
      const cart = await CartService.addItem(userId, productId, quantity);
      sendSuccess(res, cart, 'Item added to cart successfully');
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PATCH /api/cart/items/:productId
 * Update quantity for cart item
 */
router.patch(
  '/cart/items/:productId',
  validate(updateCartItemSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const productId = req.params.productId as string;
      const { quantity } = req.body;
      const cart = await CartService.updateItemQuantity(userId, productId, quantity);
      sendSuccess(res, cart, 'Cart quantity updated');
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE /api/cart/items/:productId
 * Remove item from cart
 */
router.delete(
  '/cart/items/:productId',
  validate(removeCartItemSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const productId = req.params.productId as string;
      const cart = await CartService.removeItem(userId, productId);
      sendSuccess(res, cart, 'Item removed from cart');
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE /api/cart
 * Clear customer cart
 */
router.delete('/cart', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const cart = await CartService.clearCart(userId);
    sendSuccess(res, cart, 'Cart cleared');
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/cart/merge
 * Merge local storage guest items into authenticated customer cart
 */
router.post(
  '/cart/merge',
  validate(mergeCartSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { items } = req.body;
      const cart = await CartService.mergeGuestCart(userId, items);
      sendSuccess(res, cart, 'Guest cart merged successfully');
    } catch (err) {
      next(err);
    }
  }
);

export default router;
