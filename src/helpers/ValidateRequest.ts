// FILE: src/helpers/ValidateRequest.ts
import type { Request, Response, NextFunction } from "express";
import type Joi from "joi";
import { AppError } from "./errors.ts";

type Target = "body" | "params" | "query";

function replaceObjectInPlace(target: unknown, value: unknown) {
  if (!target || typeof target !== "object") return;

  const obj = target as Record<string, unknown>;

  for (const key of Object.keys(obj)) {
    delete obj[key];
  }

  if (value && typeof value === "object") {
    Object.assign(obj, value as Record<string, unknown>);
  }
}

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

    // Express 5: req.query is getter-only, so we must not reassign it.
    if (target === "query") {
      replaceObjectInPlace(req.query, value);
    } else if (target === "params") {
      replaceObjectInPlace(req.params, value);
    } else {
      (req as any).body = value;
    }

    next();
  };
}
