import { Router, Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/categoryService.js';
import { sendSuccess } from '../utils/response.js';

const router = Router();

/**
 * GET /api/categories
 * Returns active categories for public storefront
 */
router.get('/categories', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await CategoryService.getActiveCategories();
    sendSuccess(res, categories);
  } catch (err) {
    next(err);
  }
});

export default router;
