import { Router, Request, Response, NextFunction } from 'express';
import { AccountService } from '../services/accountService.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import {
  updateProfileSchema,
  createAddressSchema,
  updateAddressSchema,
  addressParamSchema,
} from '../schemas/account.js';
import { sendSuccess } from '../utils/response.js';

const router = Router();

// Protect all account routes with authentication
router.use(authenticate);

/**
 * GET /api/account/profile
 * Get authenticated customer profile
 */
router.get('/account/profile', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const profile = await AccountService.getProfile(userId);
    sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/account/profile
 * Update profile (name, phone)
 */
router.patch(
  '/account/profile',
  validate(updateProfileSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const { name, phone } = req.body;
      const updated = await AccountService.updateProfile(userId, { name, phone });
      sendSuccess(res, updated, 'Profile updated successfully');
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/account/addresses
 * List all saved shipping addresses for customer
 */
router.get('/account/addresses', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;
    const addresses = await AccountService.getAddresses(userId);
    sendSuccess(res, addresses);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/account/addresses
 * Add a new shipping address
 */
router.post(
  '/account/addresses',
  validate(createAddressSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const address = await AccountService.createAddress(userId, req.body);
      sendSuccess(res, address, 'Address added successfully', 201);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PATCH /api/account/addresses/:id
 * Update an existing shipping address
 */
router.patch(
  '/account/addresses/:id',
  validate(updateAddressSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const addressId = req.params.id as string;
      const updated = await AccountService.updateAddress(userId, addressId, req.body);
      sendSuccess(res, updated, 'Address updated successfully');
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE /api/account/addresses/:id
 * Delete shipping address safely
 */
router.delete(
  '/account/addresses/:id',
  validate(addressParamSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const addressId = req.params.id as string;
      await AccountService.deleteAddress(userId, addressId);
      sendSuccess(res, null, 'Address deleted successfully');
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/account/addresses/:id/default
 * Set address as default shipping address
 */
router.post(
  '/account/addresses/:id/default',
  validate(addressParamSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const addressId = req.params.id as string;
      const updated = await AccountService.setDefaultAddress(userId, addressId);
      sendSuccess(res, updated, 'Default shipping address updated');
    } catch (err) {
      next(err);
    }
  }
);

export default router;
