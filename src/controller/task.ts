// FILE: src/controller/task.ts
import type { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { getTasksCollection } from "../DB/connection.ts";
import { AppError } from "../helpers/errors.ts";
import type { TaskResponse, Task } from "../model/TaskModel.ts";

function toTaskResponse(doc: any): TaskResponse {
  return {
    id: String(doc._id),
    name: String(doc.name),
    subject: doc.subject,
    priority: Number(doc.priority),
    date: String(doc.date),
    completed: Boolean(doc.completed),
    location: [Number(doc.location?.[0]), Number(doc.location?.[1])]
  };
}

function parseId(id: string) {
  if (!ObjectId.isValid(id)) {
    throw new AppError({ status: 400, code: "BAD_REQUEST", message: "Invalid id" });
  }
  return new ObjectId(id);
}

export async function getAllTasks(req: Request, res: Response) {
  const collection = getTasksCollection();

  const q = req.query as any;
  const filter: any = {};

  if (q.subject) filter.subject = q.subject;
  if (typeof q.completed === "boolean") filter.completed = q.completed;

  if (q.priorityMin !== undefined || q.priorityMax !== undefined) {
    filter.priority = {};
    if (q.priorityMin !== undefined) filter.priority.$gte = q.priorityMin;
    if (q.priorityMax !== undefined) filter.priority.$lte = q.priorityMax;
  }

  const docs = await collection.find(filter).sort({ _id: -1 }).toArray();
  res.status(200).json(docs.map(toTaskResponse));
}

export async function getTaskById(req: Request, res: Response) {
  const collection = getTasksCollection();
  const id = parseId(String(req.params.id));

  const doc = await collection.findOne({ _id: id });
  if (!doc) {
    throw new AppError({ status: 404, code: "NOT_FOUND", message: "Task not found" });
  }

  res.status(200).json(toTaskResponse(doc));
}

export async function addTask(req: Request, res: Response) {
  const collection = getTasksCollection();

  const body = req.body as any;
  const newTask: Task = {
    name: body.name,
    subject: body.subject,
    priority: body.priority,
    date: body.date,
    completed: body.completed ?? false,
    location: body.location
  };

  const result = await collection.insertOne(newTask);
  const created = await collection.findOne({ _id: result.insertedId });

  res.status(201).json(toTaskResponse(created));
}

export async function replaceTask(req: Request, res: Response) {
  const collection = getTasksCollection();
  const id = parseId(String(req.params.id));

  const body = req.body as Task;

  const result = await collection.findOneAndReplace(
    { _id: id },
    {
      name: body.name,
      subject: body.subject,
      priority: body.priority,
      date: body.date,
      completed: body.completed,
      location: body.location
    },
    { returnDocument: "after" }
  );

  if (!result.value) {
    throw new AppError({ status: 404, code: "NOT_FOUND", message: "Task not found" });
  }

  res.status(200).json(toTaskResponse(result.value));
}

export async function patchTask(req: Request, res: Response) {
  const collection = getTasksCollection();
  const id = parseId(String(req.params.id));

  const patch = req.body as Partial<Task>;
  const allowed: Partial<Task> = {};

  if (patch.name !== undefined) allowed.name = patch.name;
  if (patch.subject !== undefined) allowed.subject = patch.subject;
  if (patch.priority !== undefined) allowed.priority = patch.priority;
  if (patch.date !== undefined) allowed.date = patch.date;
  if (patch.completed !== undefined) allowed.completed = patch.completed;
  if (patch.location !== undefined) allowed.location = patch.location;

  const result = await collection.findOneAndUpdate(
    { _id: id },
    { $set: allowed },
    { returnDocument: "after" }
  );

  if (!result.value) {
    throw new AppError({ status: 404, code: "NOT_FOUND", message: "Task not found" });
  }

  res.status(200).json(toTaskResponse(result.value));
}

export async function deleteTask(req: Request, res: Response) {
  const collection = getTasksCollection();
  const id = parseId(String(req.params.id));

  const result = await collection.deleteOne({ _id: id });
  if (result.deletedCount === 0) {
    throw new AppError({ status: 404, code: "NOT_FOUND", message: "Task not found" });
  }

  res.status(200).json({ message: "Task deleted successfully" });
}

export async function deleteAllTasks(req: Request, res: Response) {
  const collection = getTasksCollection();

  if (process.env.NODE_ENV === "production") {
    throw new AppError({ status: 403, code: "BAD_REQUEST", message: "Not allowed in production" });
  }

  const result = await collection.deleteMany({});
  res.status(200).json({ deletedCount: result.deletedCount ?? 0 });
}
