import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import categoryRouter from './routes/categories.js';
import productRouter from './routes/products.js';
import cartRouter from './routes/cart.js';
import accountRouter from './routes/account.js';
import orderRouter from './routes/orders.js';
import paymentRouter from './routes/payments.js';
import adminProductsRouter from './routes/admin/products.js';
import adminCategoriesRouter from './routes/admin/categories.js';
import adminDashboardRouter from './routes/admin/dashboard.js';
import adminOrdersRouter from './routes/admin/orders.js';
import adminInventoryRouter from './routes/admin/inventory.js';
import { globalLimiter } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/error.js';
import { NotFoundError } from './utils/errors.js';

export const createApp = (): Express => {
  const app = express();

  // Security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS configuration
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.ADMIN_URL || 'http://localhost:3001',
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or server-to-server)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Body parsing & Cookies
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser(process.env.COOKIE_SECRET || 'dev_cookie_secret'));

  // Rate Limiting
  app.use('/api', globalLimiter);

  // Routes
  app.use('/api', healthRouter);
  app.use('/api', authRouter);
  app.use('/api', categoryRouter);
  app.use('/api', productRouter);
  app.use('/api', cartRouter);
  app.use('/api', accountRouter);
  app.use('/api', orderRouter);
  app.use('/api', paymentRouter);
  app.use('/api', adminProductsRouter);
  app.use('/api', adminCategoriesRouter);
  app.use('/api', adminDashboardRouter);
  app.use('/api', adminOrdersRouter);
  app.use('/api', adminInventoryRouter);

  // 404 Handler
  app.use('*', (_req, _res, next) => {
    next(new NotFoundError('API endpoint not found'));
  });

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
};

export default createApp;
