import { MongoClient, type Collection, type Db } from "mongodb";
import dotenv from "dotenv";
import { AppError } from "../helpers/errors.ts";
import type { Task } from "../model/TaskModel.ts";

dotenv.config();

let client: MongoClient | null = null;
let db: Db | null = null;
let tasksCollection: Collection<Task> | null = null;

const getConnectionString = () =>
  process.env.DATABASE_URL || "mongodb://127.0.0.1:27017"; // check which one is right and use it, dont use || for it
// prefere using env for URL

const getDbName = () => {
  const explicit = process.env.DB_NAME;

  if (explicit?.trim()) {
    return explicit.trim();
  }

  return process.env.NODE_ENV === "test"
    ? "taskpilot_test"
    : "taskpilot";
};

export const connectToDB = async (): Promise<void> => {
  if (client && db && tasksCollection) {
    return;
  }

  client = new MongoClient(getConnectionString());
  await client.connect();

  db = client.db(getDbName());
  tasksCollection = db.collection<Task>("Tasks");

  await tasksCollection.createIndex({ subject: 1 });
  await tasksCollection.createIndex({ completed: 1 });
  await tasksCollection.createIndex({ priority: 1 });
};

export const disconnectFromDB = async (): Promise<void> => {
  if (client) {
    await client.close();
  }

  client = null;
  db = null;
  tasksCollection = null;
};

export const getTasksCollection = (): Collection<Task> => {
  if (!tasksCollection) {
    throw new AppError({
      status: 500,
      code: "DB_NOT_READY",
      message: "DB not initialized. Call connectToDB() first.",
    });
  }

  return tasksCollection;
};