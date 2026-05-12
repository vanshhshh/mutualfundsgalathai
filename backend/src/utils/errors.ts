import { Express, Request, Response, NextFunction } from 'express';

export interface APIError {
  status: number;
  message: string;
  code?: string;
}

export class AppError extends Error implements APIError {
  status: number;
  code?: string;

  constructor(message: string, status: number = 500, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: err.message,
      code: err.code,
      status: err.status,
    });
  }

  console.error('Unexpected error:', err);

  res.status(500).json({
    error: 'Internal server error',
    status: 500,
  });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
