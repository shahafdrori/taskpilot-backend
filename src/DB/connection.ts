// FILE: src/DB/connection.ts
import { MongoClient, type Db, type Collection } from "mongodb";
import dotenv from "dotenv";
import { AppError } from "../helpers/errors.ts";

dotenv.config();

let client: MongoClient | null = null;
let db: Db | null = null;
let tasksCollection: Collection | null = null;

function getConnectionString() {
  return process.env.DATABASE_URL || "mongodb://127.0.0.1:27017";
}

function getDbName() {
  const explicit = process.env.DB_NAME;
  if (explicit && explicit.trim()) return explicit.trim();

  if (process.env.NODE_ENV === "test") return "taskpilot_test";
  return "taskpilot";
}

export async function connectToDB() {
  if (client && db && tasksCollection) return;

  client = new MongoClient(getConnectionString());
  await client.connect();

  db = client.db(getDbName());
  tasksCollection = db.collection("Tasks");

  await tasksCollection.createIndex({ subject: 1 });
  await tasksCollection.createIndex({ completed: 1 });
  await tasksCollection.createIndex({ priority: 1 });
}

export async function disconnectFromDB() {
  if (client) {
    await client.close();
  }
  client = null;
  db = null;
  tasksCollection = null;
}

export function getTasksCollection(): Collection {
  if (!tasksCollection) {
    throw new AppError({
      status: 500,
      code: "DB_NOT_READY",
      message: "DB not initialized. Call connectToDB() first."
    });
  }
  return tasksCollection;
}
