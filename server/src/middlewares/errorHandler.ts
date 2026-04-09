import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      error: 'Validation failed',
      details: err.errors,
    });
    return;
  }

  // Never expose internals in production
  const message = env.NODE_ENV === 'development' && err instanceof Error ? err.message : 'Internal server error';
  console.error(err);
  res.status(500).json({ success: false, error: message });
}
