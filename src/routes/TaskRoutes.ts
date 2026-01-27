// FILE: src/routes/TaskRoutes.ts
import express from "express";
import { validateRequest } from "../helpers/ValidateRequest.ts";
import {
  createTaskBodySchema,
  idParamSchema,
  listTasksQuerySchema,
  patchTaskBodySchema,
  replaceTaskBodySchema
} from "../schema/TaskSchema.ts";
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

const TasksRouter = express.Router();

TasksRouter.get("/", validateRequest(listTasksQuerySchema, "query"), asyncHandler(getAllTasks));
TasksRouter.get("/:id", validateRequest(idParamSchema, "params"), asyncHandler(getTaskById));

TasksRouter.post("/", validateRequest(createTaskBodySchema, "body"), asyncHandler(addTask));

TasksRouter.put(
  "/:id",
  validateRequest(idParamSchema, "params"),
  validateRequest(replaceTaskBodySchema, "body"),
  asyncHandler(replaceTask)
);

TasksRouter.patch(
  "/:id",
  validateRequest(idParamSchema, "params"),
  validateRequest(patchTaskBodySchema, "body"),
  asyncHandler(patchTask)
);

TasksRouter.delete("/:id", validateRequest(idParamSchema, "params"), asyncHandler(deleteTask));
TasksRouter.delete("/", asyncHandler(deleteAllTasks));

export default TasksRouter;
