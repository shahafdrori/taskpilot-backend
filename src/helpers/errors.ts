// FILE: src/helpers/errors.ts
export type ErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "BAD_REQUEST"
  | "DB_NOT_READY"
  | "INTERNAL_ERROR";

export class AppError extends Error {
  public readonly status: number;
  public readonly code: ErrorCode;
  public readonly details?: unknown;

  constructor(params: { message: string; status: number; code: ErrorCode; details?: unknown }) {
    super(params.message);
    this.status = params.status;
    this.code = params.code;
    this.details = params.details;
  }
}

export function isAppError(err: unknown): err is AppError {
  return Boolean(
    err &&
      typeof err === "object" &&
      "status" in err &&
      "code" in err &&
      typeof (err as any).status === "number"
  );
}
