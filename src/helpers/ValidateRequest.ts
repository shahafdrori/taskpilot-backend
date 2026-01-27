// FILE: src/helpers/ValidateRequest.ts
import type { Request, Response, NextFunction } from "express";
import type Joi from "joi";
import { AppError } from "./errors.ts";

type Target = "body" | "params" | "query";

export function validateRequest<T>(schema: Joi.ObjectSchema<T>, target: Target) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const data = (req as any)[target];

    const { error, value } = schema.validate(data, {
      abortEarly: true,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      return next(
        new AppError({
          status: 400,
          code: "VALIDATION_ERROR",
          message: error.details[0]?.message ?? "Validation error",
          details: error.details
        })
      );
    }

    (req as any)[target] = value;
    next();
  };
}
