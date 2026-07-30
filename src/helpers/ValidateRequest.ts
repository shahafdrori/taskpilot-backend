import type { Request, Response, NextFunction } from "express";
import type Joi from "joi";

import { AppError } from "./errors.ts";

type Target = "body" | "params" | "query";

// try not using unknown, try giving it an actual type
const replaceObjectInPlace = (target: unknown, value: unknown): void => {
  if (!target || typeof target !== "object") return;

  const obj = target as Record<string, unknown>;

  Object.keys(obj).forEach((key) => {
    delete obj[key];
  });

  if (value && typeof value === "object") 
    Object.assign(obj, value as Record<string, unknown>);
  
};

export const validateRequest =
  (schema: Joi.ObjectSchema, target: Target) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const data = req[target];

    const { error, value } = schema.validate(data, {
      abortEarly: true,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      return next(
        new AppError({
          status: 400,
          code: "VALIDATION_ERROR",
          message: error.details[0]?.message ?? "Validation error",
          details: error.details,
        }),
      );
    }

    // check if you can write it in a better way, maybe extract to a different file or function, if you cant then keep it like this
    switch (target) {
      case "query":
        replaceObjectInPlace(req.query, value);
        break;

      case "params":
        replaceObjectInPlace(req.params, value);
        break;

      case "body":
        req.body = value;
        break;
    }

    next();
  };