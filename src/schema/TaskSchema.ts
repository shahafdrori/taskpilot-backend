import Joi from "joi";

import {
  SUBJECTS,
  type CreateTaskInput,
  type ListTasksQuery,
  type PatchTaskInput,
  type ReplaceTaskInput,
  type TaskIdParams
} from "../model/TaskModel.ts";

const dateSchema = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .isoDate()
  .raw()
  .messages({
    "string.pattern.base": "date must be in YYYY-MM-DD format",
    "string.isoDate": "date must be a valid date in YYYY-MM-DD format"
  });

const locationSchema = Joi.array()
  .ordered(
    Joi.number().min(-180).max(180).required(),
    Joi.number().min(-90).max(90).required()
  )
  .length(2)
  .messages({
    "array.length": "location must contain longitude and latitude",
    "array.orderedLength": "location must contain longitude and latitude"
  });

export const listTasksQuerySchema = Joi.object<ListTasksQuery>({
  subject: Joi.string()
    .valid(...SUBJECTS)
    .optional(),
  completed: Joi.boolean().optional(),
  priorityMin: Joi.number().integer().min(1).max(10).optional(),
  priorityMax: Joi.number().integer().min(1).max(10).optional()
})
  .custom((value, helpers) => {
    if (
      value.priorityMin !== undefined &&
      value.priorityMax !== undefined &&
      value.priorityMin > value.priorityMax
    ) {
      return helpers.error("priority.range");
    }

    return value;
  })
  .messages({
    "priority.range": "priorityMin must be less than or equal to priorityMax"
  });

export const idParamSchema = Joi.object<TaskIdParams>({
  id: Joi.string().hex().length(24).required()
});

export const createTaskBodySchema = Joi.object<CreateTaskInput>({
  name: Joi.string().trim().min(1).max(200).required(),
  subject: Joi.string()
    .valid(...SUBJECTS)
    .required(),
  priority: Joi.number().integer().min(1).max(10).required(),
  date: dateSchema.required(),
  completed: Joi.boolean().optional(),
  location: locationSchema.required()
});

export const replaceTaskBodySchema = Joi.object<ReplaceTaskInput>({
  name: Joi.string().trim().min(1).max(200).required(),
  subject: Joi.string()
    .valid(...SUBJECTS)
    .required(),
  priority: Joi.number().integer().min(1).max(10).required(),
  date: dateSchema.required(),
  completed: Joi.boolean().required(),
  location: locationSchema.required()
});

export const patchTaskBodySchema = Joi.object<PatchTaskInput>({
  name: Joi.string().trim().min(1).max(200).optional(),
  subject: Joi.string()
    .valid(...SUBJECTS)
    .optional(),
  priority: Joi.number().integer().min(1).max(10).optional(),
  date: dateSchema.optional(),
  completed: Joi.boolean().optional(),
  location: locationSchema.optional()
}).min(1);