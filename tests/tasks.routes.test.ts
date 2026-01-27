// FILE: tests/tasks.routes.test.ts
import request from "supertest";
import { app } from "../src/app.ts";
import { connectToDB, disconnectFromDB } from "../src/DB/connection.ts";
import { getTasksCollection } from "../src/DB/connection.ts";
import { makeCreateTask, makeReplaceTask } from "./factories/taskFactory.ts";

describe("Task routes", () => {
  beforeAll(async () => {
    await connectToDB();
  });

  afterAll(async () => {
    await disconnectFromDB();
  });

  beforeEach(async () => {
    await getTasksCollection().deleteMany({});
  });

  it("POST /tasks creates a task", async () => {
    const payload = makeCreateTask();

    const res = await request(app).post("/tasks").send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe(payload.name);
    expect(res.body.location).toEqual(payload.location);
    expect(res.body.completed).toBe(false);
  });

  it("GET /tasks returns all tasks", async () => {
    await request(app).post("/tasks").send(makeCreateTask({ name: "A" }));
    await request(app).post("/tasks").send(makeCreateTask({ name: "B", priority: 9 }));

    const res = await request(app).get("/tasks");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  it("GET /tasks/:id returns one task", async () => {
    const created = await request(app).post("/tasks").send(makeCreateTask({ name: "One" }));
    const id = created.body.id;

    const res = await request(app).get(`/tasks/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
    expect(res.body.name).toBe("One");
  });

  it("PUT /tasks/:id replaces a task", async () => {
    const created = await request(app).post("/tasks").send(makeCreateTask({ name: "Old" }));
    const id = created.body.id;

    const putPayload = makeReplaceTask({ name: "New" });
    const res = await request(app).put(`/tasks/${id}`).send(putPayload);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
    expect(res.body.name).toBe("New");
    expect(res.body.completed).toBe(true);
  });

  it("PATCH /tasks/:id updates partial fields", async () => {
    const created = await request(app).post("/tasks").send(makeCreateTask({ name: "Old", completed: false }));
    const id = created.body.id;

    const res = await request(app).patch(`/tasks/${id}`).send({ completed: true, priority: 10 });
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
    expect(res.body.priority).toBe(10);

    const getRes = await request(app).get(`/tasks/${id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.name).toBe("Old");
  });

  it("DELETE /tasks/:id deletes a task", async () => {
    const created = await request(app).post("/tasks").send(makeCreateTask());
    const id = created.body.id;

    const delRes = await request(app).delete(`/tasks/${id}`);
    expect(delRes.status).toBe(200);

    const getRes = await request(app).get(`/tasks/${id}`);
    expect(getRes.status).toBe(404);
  });

  it("Validates body on POST (priority out of range)", async () => {
    const bad = makeCreateTask({ priority: 100 });

    const res = await request(app).post("/tasks").send(bad);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("Validates params on GET by id (invalid id)", async () => {
    const res = await request(app).get("/tasks/not-an-objectid");
    expect(res.status).toBe(400);
  });

  it("DELETE /tasks deletes all (only in non-production)", async () => {
    await request(app).post("/tasks").send(makeCreateTask());
    await request(app).post("/tasks").send(makeCreateTask());

    const res = await request(app).delete("/tasks");
    expect(res.status).toBe(200);
    expect(res.body.deletedCount).toBe(2);

    const list = await request(app).get("/tasks");
    expect(list.body.length).toBe(0);
  });
});
