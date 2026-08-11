import { Router, Request, Response, NextFunction } from 'express';
import { ProductService, ProductFilterOptions } from '../services/productService.js';
import { productQuerySchema, productSlugParamSchema } from '../schemas/product.js';
import { validate } from '../middleware/validate.js';
import { sendSuccess } from '../utils/response.js';
import { NotFoundError } from '../utils/errors.js';

const router = Router();

/**
 * GET /api/products
 * Public published products catalog with pagination, search, filters, and sorting
 */
router.get(
  '/products',
  validate(productQuerySchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const options: ProductFilterOptions = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        search: req.query.search as string,
        category: req.query.category as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        inStock: req.query.inStock === 'true',
        featured: req.query.featured === 'true',
        sort: req.query.sort as ProductFilterOptions['sort'],
      };

      const result = await ProductService.getPublicProducts(options);

      res.status(200).json({
        success: true,
        data: result.products,
        pagination: result.pagination,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/products/:slug
 * Public product detail by slug with images and related products (404 if unpublished/missing)
 */
router.get(
  '/products/:slug',
  validate(productSlugParamSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const slug = req.params.slug as string;
      const product = await ProductService.getPublicProductBySlug(slug);

      if (!product) {
        throw new NotFoundError('Product not found');
      }

      sendSuccess(res, product);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
