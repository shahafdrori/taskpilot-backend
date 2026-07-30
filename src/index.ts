import express from "express";

import tasksRouter from "./routes/TaskRoutes.ts";

const indexRouter = express.Router();

indexRouter.use("/tasks", tasksRouter);

export default indexRouter;