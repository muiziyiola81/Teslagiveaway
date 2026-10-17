import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input parameters',
        details: err.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message
        })),
        timestamp: new Date().toISOString()
      }
    });
    return;
  }

  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Log error on server side
  console.error(`[Error] ${req.method} ${req.path} (${statusCode}):`, err.message || err);
  if (!isProduction && err.stack) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    error: {
      code: err.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR'),
      message: statusCode >= 500 && isProduction ? 'An unexpected server error occurred.' : err.message,
      ...(isProduction ? {} : { details: err.details, stack: err.stack }),
      timestamp: new Date().toISOString()
    }
  });
}
