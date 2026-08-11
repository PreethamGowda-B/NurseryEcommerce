import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Root health check endpoint for Render & browser inspection
 */
router.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Sheeneeka Nursery API is operational',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      categories: '/api/categories',
    },
  });
});

router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Sheeneeka Nursery API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
