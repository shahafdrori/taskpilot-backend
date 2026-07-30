import dotenv from "dotenv";
import { jest } from "@jest/globals";

dotenv.config();

process.env.TZ = "UTC";
process.env.NODE_ENV = "test";
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  "mongodb://localhost:27018/taskpilot_test";
process.env.PORT = process.env.PORT ?? "3001";

jest.setTimeout(30_000);