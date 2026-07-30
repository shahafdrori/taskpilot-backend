import { MongoClient, type Collection, type Db } from "mongodb";

import { getDatabaseUrl } from "../config/env.ts";
import { AppError } from "../helpers/errors.ts";
import type { Task } from "../model/TaskModel.ts";

let client: MongoClient | null = null;
let db: Db | null = null;
let tasksCollection: Collection<Task> | null = null;

export const connectToDB = async (): Promise<void> => {
  if (client && db && tasksCollection) {
    return;
  }

  const nextClient = new MongoClient(getDatabaseUrl());

  try {
    await nextClient.connect();

    const nextDb = nextClient.db();
    const nextTasksCollection = nextDb.collection<Task>("Tasks");

    await Promise.all([
      nextTasksCollection.createIndex({ subject: 1 }),
      nextTasksCollection.createIndex({ completed: 1 }),
      nextTasksCollection.createIndex({ priority: 1 })
    ]);

    client = nextClient;
    db = nextDb;
    tasksCollection = nextTasksCollection;
  } catch (error) {
    await nextClient.close();
    throw error;
  }
};

export const disconnectFromDB = async (): Promise<void> => {
  await client?.close();

  client = null;
  db = null;
  tasksCollection = null;
};

export const getTasksCollection = (): Collection<Task> => {
  if (!tasksCollection) {
    throw new AppError({
      status: 500,
      code: "DB_NOT_READY",
      message: "Database is not initialized"
    });
  }

  return tasksCollection;
};