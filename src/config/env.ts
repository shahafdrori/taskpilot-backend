import dotenv from "dotenv";

import { AppError } from "../helpers/errors.ts";

dotenv.config();

type EnvironmentVariable = "DATABASE_URL" | "NODE_ENV" | "PORT";
type NodeEnvironment = "development" | "test" | "production";

const getRequiredEnvironmentVariable = (name: EnvironmentVariable): string => {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new AppError({
      status: 500,
      code: "CONFIG_ERROR",
      message: `Missing required environment variable: ${name}`
    });
  }

  return value;
};

export const getDatabaseUrl = (): string =>
  getRequiredEnvironmentVariable("DATABASE_URL");

export const getNodeEnvironment = (): NodeEnvironment => {
  const environment = getRequiredEnvironmentVariable("NODE_ENV");

  switch (environment) {
    case "development":
    case "test":
    case "production":
      return environment;
    default:
      throw new AppError({
        status: 500,
        code: "CONFIG_ERROR",
        message: "NODE_ENV must be development, test, or production"
      });
  }
};

export const getPort = (): number => {
  const port = Number(getRequiredEnvironmentVariable("PORT"));

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new AppError({
      status: 500,
      code: "CONFIG_ERROR",
      message: "PORT must be an integer between 1 and 65535"
    });
  }

  return port;
};