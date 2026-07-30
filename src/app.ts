import cors from "cors";
import express from "express";

import { getNodeEnvironment, getPort } from "./config/env.ts";
import { connectToDB } from "./DB/connection.ts";
import { AppError, isAppError } from "./helpers/errors.ts";
import indexRouter from "./index.ts";

export const app = express();

app.use(express.json());
app.use(cors());
app.use(indexRouter);

app.use((_req, _res, next) => {
  next(
    new AppError({
      status: 404,
      code: "NOT_FOUND",
      message: "Route not found"
    })
  );
});

app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    if (isAppError(error)) {
      res.status(error.status).json({
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        }
      });
      return;
    }

    console.error(error);

    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error"
      }
    });
  }
);

const start = async (): Promise<void> => {
  await connectToDB();

  const port = getPort();

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
};

if (getNodeEnvironment() !== "test") {
  void start().catch((error: unknown) => {
    console.error("Failed to start server", error);
    process.exit(1);
  });
}