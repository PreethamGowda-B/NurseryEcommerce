import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { BadRequestError } from '../utils/errors.js';

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      if (parsed.query) req.query = parsed.query;
      if (parsed.body) req.body = parsed.body;
      if (parsed.params) req.params = parsed.params;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issues = err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
        next(new BadRequestError(`Validation error: ${issues}`));
        return;
      }
      next(err);
    }
  };
}
