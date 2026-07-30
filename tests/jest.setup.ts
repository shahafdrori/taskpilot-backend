import { jest } from "@jest/globals";

process.env.TZ = "UTC";
process.env.NODE_ENV = process.env.NODE_ENV ?? "test";
process.env.DATABASE_URL = process.env.DATABASE_URL;
process.env.DB_NAME = process.env.DB_NAME ?? "taskpilot_test";
process.env.PORT = process.env.PORT ?? "3000";

jest.setTimeout(30_000);
