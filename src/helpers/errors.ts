export type ErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "BAD_REQUEST"
  | "FORBIDDEN"
  | "CONFIG_ERROR"
  | "DB_NOT_READY"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  public readonly status: number;
  public readonly code: ErrorCode;
  public readonly details: unknown;

  constructor(params: {
    message: string;
    status: number;
    code: ErrorCode;
    details?: unknown;
  }) {
    super(params.message);
    this.name = "AppError";
    this.status = params.status;
    this.code = params.code;
    this.details = params.details;
  }
}

export const isAppError = (error: unknown): error is AppError =>
  error instanceof AppError;