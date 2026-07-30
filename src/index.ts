import express from "express";

import TasksRouter from "./routes/TaskRoutes.ts";

const indexRouter = express.Router();

indexRouter.use("/tasks", TasksRouter);

export default indexRouter;
