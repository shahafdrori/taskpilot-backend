import type { NextFunction, Request, Response } from "express";
import type Joi from "joi";

import { AppError } from "./errors.ts";

type Target = "body" | "params" | "query";
type ValidatedData = Partial<Record<Target, object>>;

const validatedDataKey = Symbol("validatedData");

type RequestWithValidatedData = Request & {
  [validatedDataKey]?: ValidatedData;
};

export const getValidatedData = <T extends object>(
  req: Request,
  target: Target
): T => {
  const validatedRequest = req as RequestWithValidatedData;
  const value = validatedRequest[validatedDataKey]?.[target];

  if (!value) {
    throw new AppError({
      status: 500,
      code: "INTERNAL_ERROR",
      message: `Validated ${target} data is missing`
    });
  }

  return value as T;
};

export const validateRequest =
  <T extends object>(schema: Joi.ObjectSchema<T>, target: Target) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: true,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      next(
        new AppError({
          status: 400,
          code: "VALIDATION_ERROR",
          message: error.details[0]?.message ?? "Validation error",
          details: { validation: error.details }
        })
      );
      return;
    }

    const validatedRequest = req as RequestWithValidatedData;
    validatedRequest[validatedDataKey] = {
      ...validatedRequest[validatedDataKey],
      [target]: value
    };

    next();
  };