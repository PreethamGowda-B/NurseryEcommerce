import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    next(new UnauthorizedError('Authentication required'));
    return;
  }

  const allowedRoles = ['ADMIN', 'SUPER_ADMIN'];
  if (!allowedRoles.includes(req.user.role)) {
    next(new ForbiddenError('Access denied. Admin authorization required.'));
    return;
  }

  next();
}
