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
import sseRouter from './routes/sse.js';
import adminProductsRouter from './routes/admin/products.js';
import adminCategoriesRouter from './routes/admin/categories.js';
import adminDashboardRouter from './routes/admin/dashboard.js';
import adminOrdersRouter from './routes/admin/orders.js';
import adminInventoryRouter from './routes/admin/inventory.js';
import adminUsersRouter from './routes/admin/users.js';
import { globalLimiter } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/error.js';
import { NotFoundError } from './utils/errors.js';

const isAllowedOrigin = (origin: string): boolean => {
  if (!origin) return true;

  // Exact configured environment variables
  if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return true;
  if (process.env.ADMIN_URL && origin === process.env.ADMIN_URL) return true;

  // Local development origins
  if (/^http:\/\/localhost:(3000|3001|5173|5174|8080)$/.test(origin)) return true;

  // Vercel preview & production deployment domains (*.vercel.app)
  if (/\.vercel\.app$/.test(origin)) return true;

  // Render deployment domains (*.onrender.com)
  if (/\.onrender\.com$/.test(origin)) return true;

  return false;
};

export const createApp = (): Express => {
  const app = express();

  // Security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // Robust CORS configuration supporting cross-domain production deployments
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || isAllowedOrigin(origin)) {
          callback(null, true);
        } else {
          callback(null, false);
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
  app.use('/', healthRouter);
  app.use('/api', healthRouter);
  app.use('/api', authRouter);
  app.use('/api', categoryRouter);
  app.use('/api', productRouter);
  app.use('/api', cartRouter);
  app.use('/api', accountRouter);
  app.use('/api', orderRouter);
  app.use('/api', paymentRouter);
  app.use('/api/sse', sseRouter);

  // Admin Routes
  app.use('/api/admin', adminProductsRouter);
  app.use('/api/admin', adminCategoriesRouter);
  app.use('/api/admin', adminDashboardRouter);
  app.use('/api/admin', adminOrdersRouter);
  app.use('/api/admin', adminInventoryRouter);
  app.use('/api/admin', adminUsersRouter);

  // 404 Handler
  app.use((req, _res, next) => {
    next(new NotFoundError(`API endpoint not found - Path: ${req.originalUrl}`));
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
