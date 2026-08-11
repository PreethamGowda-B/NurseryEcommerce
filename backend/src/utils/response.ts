import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export function sendSuccess<T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode = 200
): Response {
  const response: ApiResponse<T> = {
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data }),
  };
  return res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  message = 'An unexpected error occurred',
  statusCode = 500
): Response {
  const response: ApiResponse = {
    success: false,
    message,
  };
  return res.status(statusCode).json(response);
}
