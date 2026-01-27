// FILE: src/app.ts
import express from "express";
import cors from "cors";
import indexRouter from "./index.ts";
import { connectToDB } from "./DB/connection.ts";
import { isAppError, AppError } from "./helpers/errors.ts";

export const app = express();

app.use(express.json());
app.use(cors());
app.use(indexRouter);

app.use((_req, _res, next) => {
  next(new AppError({ status: 404, code: "NOT_FOUND", message: "Route not found" }));
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (isAppError(err)) {
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    });
  }

  console.error(err);
  return res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error"
    }
  });
});

async function start() {
  await connectToDB();
  const port = Number(process.env.PORT ?? 3000);

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

if (process.env.NODE_ENV !== "test") {
  void start();
}
