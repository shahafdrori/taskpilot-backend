import type { Request, Response } from "express";

import { getValidatedData } from "../helpers/ValidateRequest.ts";
import type {
  CreateTaskInput,
  ListTasksQuery,
  PatchTaskInput,
  ReplaceTaskInput,
  TaskIdParams
} from "../model/TaskModel.ts";
import * as taskService from "../services/taskService.ts";

export const getAllTasks = async (
  req: Request,
  res: Response
): Promise<void> => {
  const query = getValidatedData<ListTasksQuery>(req, "query");
  const tasks = await taskService.getAllTasks(query);

  res.status(200).json(tasks);
};

export const getTaskById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = getValidatedData<TaskIdParams>(req, "params");
  const task = await taskService.getTaskById(id);

  res.status(200).json(task);
};

export const addTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  const input = getValidatedData<CreateTaskInput>(req, "body");
  const task = await taskService.addTask(input);

  res.status(201).json(task);
};

export const replaceTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = getValidatedData<TaskIdParams>(req, "params");
  const input = getValidatedData<ReplaceTaskInput>(req, "body");
  const task = await taskService.replaceTask(id, input);

  res.status(200).json(task);
};

export const patchTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = getValidatedData<TaskIdParams>(req, "params");
  const input = getValidatedData<PatchTaskInput>(req, "body");
  const task = await taskService.patchTask(id, input);

  res.status(200).json(task);
};

export const deleteTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = getValidatedData<TaskIdParams>(req, "params");

  await taskService.deleteTask(id);

  res.status(200).json({
    message: "Task deleted successfully"
  });
};

export const deleteAllTasks = async (
  _req: Request,
  res: Response
): Promise<void> => {
  const deletedCount = await taskService.deleteAllTasks();

  res.status(200).json({ deletedCount });
};