import { Request, Response, NextFunction } from 'express';
import { buildError } from '../utils/envelope';

/**
 * AppError — a typed error that carries an HTTP status code and an API error code.
 * Services and controllers throw this; errorHandler catches it.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Central error-handling middleware. Must be registered last in app.ts.
 * Converts AppError instances to the standard error envelope.
 * Falls back to 500 for unexpected errors.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(buildError(err.code, err.message));
    return;
  }

  // Unexpected error — do not leak internals
  console.error('[Unhandled error]', err);
  res.status(500).json(buildError('INTERNAL_ERROR', 'An unexpected error occurred'));
}
