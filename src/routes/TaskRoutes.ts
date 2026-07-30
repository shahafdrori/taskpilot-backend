import express from "express";

import {
  addTask,
  deleteAllTasks,
  deleteTask,
  getAllTasks,
  getTaskById,
  patchTask,
  replaceTask
} from "../controller/task.ts";
import { asyncHandler } from "../helpers/asyncHandler.ts";
import { validateRequest } from "../helpers/ValidateRequest.ts";
import {
  createTaskBodySchema,
  idParamSchema,
  listTasksQuerySchema,
  patchTaskBodySchema,
  replaceTaskBodySchema
} from "../schema/TaskSchema.ts";

const tasksRouter = express.Router();

tasksRouter.get(
  "/",
  validateRequest(listTasksQuerySchema, "query"),
  asyncHandler(getAllTasks)
);

tasksRouter.get(
  "/:id",
  validateRequest(idParamSchema, "params"),
  asyncHandler(getTaskById)
);

tasksRouter.post(
  "/",
  validateRequest(createTaskBodySchema, "body"),
  asyncHandler(addTask)
);

tasksRouter.put(
  "/:id",
  validateRequest(idParamSchema, "params"),
  validateRequest(replaceTaskBodySchema, "body"),
  asyncHandler(replaceTask)
);

tasksRouter.patch(
  "/:id",
  validateRequest(idParamSchema, "params"),
  validateRequest(patchTaskBodySchema, "body"),
  asyncHandler(patchTask)
);

tasksRouter.delete(
  "/:id",
  validateRequest(idParamSchema, "params"),
  asyncHandler(deleteTask)
);

tasksRouter.delete("/", asyncHandler(deleteAllTasks));

export default tasksRouter;