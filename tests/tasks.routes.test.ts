import request from "supertest";

import { app } from "../src/app.ts";
import {
  connectToDB,
  disconnectFromDB,
  getTasksCollection,
} from "../src/DB/connection.ts";
import {
  makeCreateTask,
  makeReplaceTask,
} from "./factories/taskFactory.ts";

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

  describe("POST", () => {
    it("POST /tasks creates a task", async () => {
      const payload = makeCreateTask();

      const res = await request(app).post("/tasks").send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.name).toBe(payload.name);
      expect(res.body.location).toEqual(payload.location);
      expect(res.body.completed).toBe(false);
    });

    it("validates body on POST when priority is out of range", async () => {
      const badPayload = makeCreateTask({ priority: 100 });

      const res = await request(app).post("/tasks").send(badPayload);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("GET", () => {
    it("GET /tasks returns all tasks", async () => {
      await request(app)
        .post("/tasks")
        .send(makeCreateTask({ name: "A" }));

      await request(app)
        .post("/tasks")
        .send(makeCreateTask({ name: "B", priority: 9 }));

      const res = await request(app).get("/tasks");

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
    });

    it("GET /tasks/:id returns one task", async () => {
      const created = await request(app)
        .post("/tasks")
        .send(makeCreateTask({ name: "One" }));

      const id = created.body.id;

      const res = await request(app).get(`/tasks/${id}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(id);
      expect(res.body.name).toBe("One");
    });

    it("validates params on GET /tasks/:id when id is invalid", async () => {
      const res = await request(app).get("/tasks/not-an-objectid");

      expect(res.status).toBe(400);
    });
  });

  describe("UPDATE", () => {
    it("PUT /tasks/:id replaces a task", async () => {
      const created = await request(app)
        .post("/tasks")
        .send(makeCreateTask({ name: "Old" }));

      const id = created.body.id;
      const putPayload = makeReplaceTask({ name: "New" });

      const res = await request(app)
        .put(`/tasks/${id}`)
        .send(putPayload);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(id);
      expect(res.body.name).toBe("New");
      expect(res.body.completed).toBe(true);
    });

    it("PATCH /tasks/:id updates partial fields", async () => {
      const created = await request(app)
        .post("/tasks")
        .send(
          makeCreateTask({
            name: "Old",
            completed: false,
          }),
        );

      const id = created.body.id;

      const res = await request(app)
        .patch(`/tasks/${id}`)
        .send({
          completed: true,
          priority: 10,
        });

      expect(res.status).toBe(200);
      expect(res.body.completed).toBe(true);
      expect(res.body.priority).toBe(10);

      const getRes = await request(app).get(`/tasks/${id}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.name).toBe("Old");
    });
  });

  describe("DELETE", () => {
    it("DELETE /tasks/:id deletes one task", async () => {
      const created = await request(app)
        .post("/tasks")
        .send(makeCreateTask());

      const id = created.body.id;

      const deleteRes = await request(app).delete(`/tasks/${id}`);

      expect(deleteRes.status).toBe(200);

      const getRes = await request(app).get(`/tasks/${id}`);

      expect(getRes.status).toBe(404);
    });

    it("DELETE /tasks deletes all tasks in non-production", async () => {
      await request(app).post("/tasks").send(makeCreateTask());
      await request(app).post("/tasks").send(makeCreateTask());

      const res = await request(app).delete("/tasks");

      expect(res.status).toBe(200);
      expect(res.body.deletedCount).toBe(2);

      const listRes = await request(app).get("/tasks");

      expect(listRes.status).toBe(200);
      expect(listRes.body).toHaveLength(0);
    });
  });
});