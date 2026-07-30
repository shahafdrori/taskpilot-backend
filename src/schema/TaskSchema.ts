import Joi from "joi";

import { SUBJECTS, type CreateTaskInput, type ReplaceTaskInput, type PatchTaskInput } from "../model/TaskModel.ts";

const isoDateString = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .messages({ "string.pattern.base": "date must be in YYYY-MM-DD format" });

const locationSchema = Joi.array()
  .items(Joi.number().min(-180).max(180))
  .length(2)
  .required()
  .messages({ "array.length": "location must be [lon, lat]" });

export const listTasksQuerySchema = Joi.object({
  subject: Joi.string().valid(...SUBJECTS).optional(),
  completed: Joi.boolean().optional(),
  priorityMin: Joi.number().integer().min(1).max(10).optional(),
  priorityMax: Joi.number().integer().min(1).max(10).optional()
});

export const idParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required()
});

export const createTaskBodySchema = Joi.object<CreateTaskInput>({
  name: Joi.string().min(1).max(200).required(),
  subject: Joi.string().valid(...SUBJECTS).required(),
  priority: Joi.number().integer().min(1).max(10).required(),
  date: isoDateString.required(),
  completed: Joi.boolean().optional(),
  location: locationSchema
});

export const replaceTaskBodySchema = Joi.object<ReplaceTaskInput>({
  name: Joi.string().min(1).max(200).required(),
  subject: Joi.string().valid(...SUBJECTS).required(),
  priority: Joi.number().integer().min(1).max(10).required(),
  date: isoDateString.required(),
  completed: Joi.boolean().required(),
  location: locationSchema
});

export const patchTaskBodySchema = Joi.object<PatchTaskInput>({
  name: Joi.string().min(1).max(200).optional(),
  subject: Joi.string().valid(...SUBJECTS).optional(),
  priority: Joi.number().integer().min(1).max(10).optional(),
  date: isoDateString.optional(),
  completed: Joi.boolean().optional(),
  location: Joi.array().items(Joi.number().min(-180).max(180)).length(2).optional()
}).min(1);
