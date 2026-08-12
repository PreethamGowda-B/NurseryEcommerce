import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import prisma from '../db/client.js';

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : (req.query?.token as string) || null);

    if (!token) {
      throw new UnauthorizedError('Authentication token missing');
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      throw new UnauthorizedError('Invalid or expired authentication token');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User account no longer exists');
    }

    if (user.status === 'SUSPENDED') {
      throw new ForbiddenError('Account suspended. Please contact support.');
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}
