import { Request, Response, NextFunction } from "express";
import { buildError } from "../utils/envelope";

export class AppError extends Error {
  public statusCode: number;
  public code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(buildError(err.code, err.message));
    return;
  }

  // Handle standard errors or unhandled exceptions
  const message =
    err instanceof Error ? err.message : "An unexpected error occurred";
  res.status(500).json(buildError("INTERNAL_SERVER_ERROR", message));
}
