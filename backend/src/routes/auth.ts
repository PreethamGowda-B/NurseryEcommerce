import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../db/client.js';
import { registerSchema, loginSchema } from '../schemas/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { authenticate } from '../middleware/authenticate.js';
import { generateToken, setAuthCookie, clearAuthCookie } from '../utils/jwt.js';
import { ConflictError, UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { sendSuccess } from '../utils/response.js';
import { logger } from '../utils/logger.js';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new customer account
 */
router.post(
  '/auth/register',
  authLimiter,
  validate(registerSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, phone, password } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      // Check for duplicate email
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        throw new ConflictError('An account with this email already exists.');
      }

      // Hash password securely with cost factor 12
      const passwordHash = await bcrypt.hash(password, 12);

      // Force role to CUSTOMER (ignore any role passed in request)
      const user = await prisma.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          phone: phone ? phone.trim() : null,
          passwordHash,
          role: 'CUSTOMER',
          status: 'ACTIVE',
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
        },
      });

      logger.info(`New user registered: ${user.email} (${user.id})`);

      // Generate JWT and set HttpOnly cookie
      const token = generateToken({ userId: user.id, role: user.role });
      setAuthCookie(res, token);

      sendSuccess(res, user, 'Account created successfully', 201);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/auth/login
 * Customer & Admin Login
 */
router.post(
  '/auth/login',
  authLimiter,
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      // Generic failure message to prevent account enumeration
      if (!user) {
        throw new UnauthorizedError('Invalid email or password.');
      }

      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid email or password.');
      }

      // Check account status
      if (user.status === 'SUSPENDED') {
        throw new ForbiddenError('Your account has been suspended. Please contact support.');
      }

      logger.info(`User logged in: ${user.email} (${user.role})`);

      // Generate JWT and set HttpOnly cookie
      const token = generateToken({ userId: user.id, role: user.role });
      setAuthCookie(res, token);

      const safeUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      };

      sendSuccess(res, safeUser, 'Logged in successfully');
    } catch (err) {
      next(err);
    }
  }
);

/**
 * POST /api/auth/logout
 * Clear authentication session cookie
 */
router.post('/auth/logout', (_req: Request, res: Response): void => {
  clearAuthCookie(res);
  sendSuccess(res, null, 'Successfully logged out');
});

/**
 * GET /api/auth/me
 * Get current authenticated user details
 */
router.get('/auth/me', authenticate, (req: Request, res: Response): void => {
  sendSuccess(res, req.user);
});

export default router;
