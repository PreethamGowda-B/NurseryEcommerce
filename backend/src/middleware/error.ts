import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    logger.warn(`AppError [${err.statusCode}] - ${err.message} - Path: ${req.path}`);
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Log unhandled server errors internally
  logger.error(`Unhandled Error: ${err.message}`, { stack: err.stack, path: req.path });

  // Safe response for clients in production
  const message =
    process.env.NODE_ENV === 'development'
      ? err.message
      : 'An unexpected internal server error occurred';

  res.status(500).json({
    success: false,
    message,
  });
}
