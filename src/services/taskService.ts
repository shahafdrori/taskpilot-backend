import {
  ObjectId,
  type Filter,
  type WithId
} from "mongodb";

import { getNodeEnvironment } from "../config/env.ts";
import { getTasksCollection } from "../DB/connection.ts";
import { AppError } from "../helpers/errors.ts";
import { pickDefined } from "../helpers/pickDefined.ts";
import type {
  CreateTaskInput,
  ListTasksQuery,
  PatchTaskInput,
  ReplaceTaskInput,
  Task,
  TaskResponse
} from "../model/TaskModel.ts";

const taskPatchFields: readonly (keyof Task)[] = [
  "name",
  "subject",
  "priority",
  "date",
  "completed",
  "location"
];

const toTaskResponse = (task: WithId<Task>): TaskResponse => ({
  id: task._id.toHexString(),
  name: task.name,
  subject: task.subject,
  priority: task.priority,
  date: task.date,
  completed: task.completed,
  location: [task.location[0], task.location[1]]
});

const parseTaskId = (id: string): ObjectId => {
  if (!ObjectId.isValid(id)) {
    throw new AppError({
      status: 400,
      code: "BAD_REQUEST",
      message: "Invalid task id"
    });
  }

  return new ObjectId(id);
};

export const getAllTasks = async (
  query: ListTasksQuery
): Promise<TaskResponse[]> => {
  const collection = getTasksCollection();
  const filter: Filter<Task> = {};

  if (query.subject !== undefined) {
    filter.subject = query.subject;
  }

  if (query.completed !== undefined) {
    filter.completed = query.completed;
  }

  if (query.priorityMin !== undefined || query.priorityMax !== undefined) {
    filter.priority = {
      ...(query.priorityMin !== undefined && { $gte: query.priorityMin }),
      ...(query.priorityMax !== undefined && { $lte: query.priorityMax })
    };
  }

  const tasks = await collection.find(filter).sort({ _id: -1 }).toArray();
  return tasks.map(toTaskResponse);
};

export const getTaskById = async (id: string): Promise<TaskResponse> => {
  const collection = getTasksCollection();
  const task = await collection.findOne({ _id: parseTaskId(id) });

  if (!task) {
    throw new AppError({
      status: 404,
      code: "NOT_FOUND",
      message: "Task not found"
    });
  }

  return toTaskResponse(task);
};

export const addTask = async (
  input: CreateTaskInput
): Promise<TaskResponse> => {
  const collection = getTasksCollection();
  const task: Task = {
    ...input,
    completed: input.completed ?? false
  };

  const result = await collection.insertOne(task);
  return toTaskResponse({ ...task, _id: result.insertedId });
};

export const replaceTask = async (
  id: string,
  input: ReplaceTaskInput
): Promise<TaskResponse> => {
  const collection = getTasksCollection();
  const updatedTask = await collection.findOneAndReplace(
    { _id: parseTaskId(id) },
    input,
    { returnDocument: "after" }
  );

  if (!updatedTask) {
    throw new AppError({
      status: 404,
      code: "NOT_FOUND",
      message: "Task not found"
    });
  }

  return toTaskResponse(updatedTask);
};

export const patchTask = async (
  id: string,
  input: PatchTaskInput
): Promise<TaskResponse> => {
  const collection = getTasksCollection();
  const update = pickDefined(input, taskPatchFields);

  const updatedTask = await collection.findOneAndUpdate(
    { _id: parseTaskId(id) },
    { $set: update },
    { returnDocument: "after" }
  );

  if (!updatedTask) {
    throw new AppError({
      status: 404,
      code: "NOT_FOUND",
      message: "Task not found"
    });
  }

  return toTaskResponse(updatedTask);
};

export const deleteTask = async (id: string): Promise<void> => {
  const collection = getTasksCollection();
  const result = await collection.deleteOne({ _id: parseTaskId(id) });

  if (result.deletedCount === 0) {
    throw new AppError({
      status: 404,
      code: "NOT_FOUND",
      message: "Task not found"
    });
  }
};

export const deleteAllTasks = async (): Promise<number> => {
  if (getNodeEnvironment() === "production") {
    throw new AppError({
      status: 403,
      code: "FORBIDDEN",
      message: "Deleting all tasks is not allowed in production"
    });
  }

  const collection = getTasksCollection();
  const result = await collection.deleteMany({});

  return result.deletedCount;
};