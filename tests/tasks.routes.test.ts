import request from "supertest";

import { app } from "../src/app.ts";
import {
  connectToDB,
  disconnectFromDB,
  getTasksCollection
} from "../src/DB/connection.ts";
import {
  makeCreateTask,
  makeReplaceTask
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

      const response = await request(app).post("/tasks").send(payload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.name).toBe(payload.name);
      expect(response.body.location).toEqual(payload.location);
      expect(response.body.completed).toBe(false);
    });

    it("strips unknown body fields", async () => {
      const response = await request(app)
        .post("/tasks")
        .send({
          ...makeCreateTask(),
          ignoredField: "ignored"
        });

      expect(response.status).toBe(201);
      expect(response.body).not.toHaveProperty("ignoredField");

      const storedTask = await getTasksCollection().findOne({
        name: response.body.name
      });

      expect(storedTask).not.toHaveProperty("ignoredField");
    });

    it("validates body when priority is out of range", async () => {
      const response = await request(app)
        .post("/tasks")
        .send(makeCreateTask({ priority: 100 }));

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("validates longitude and latitude separately", async () => {
      const response = await request(app)
        .post("/tasks")
        .send(makeCreateTask({ location: [34.8, 120] }));

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
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

      const response = await request(app).get("/tasks");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
    });

    it("GET /tasks filters validated query values", async () => {
      await request(app)
        .post("/tasks")
        .send(
          makeCreateTask({
            name: "Incomplete",
            completed: false,
            priority: 3
          })
        );

      await request(app)
        .post("/tasks")
        .send(
          makeCreateTask({
            name: "Completed",
            completed: true,
            priority: 9
          })
        );

      const response = await request(app).get(
        "/tasks?completed=true&priorityMin=8"
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe("Completed");
    });

    it("rejects an invalid priority range", async () => {
      const response = await request(app).get(
        "/tasks?priorityMin=8&priorityMax=3"
      );

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("GET /tasks/:id returns one task", async () => {
      const created = await request(app)
        .post("/tasks")
        .send(makeCreateTask({ name: "One" }));

      const id = created.body.id;
      const response = await request(app).get(`/tasks/${id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(id);
      expect(response.body.name).toBe("One");
    });

    it("validates params when id is invalid", async () => {
      const response = await request(app).get(
        "/tasks/not-an-objectid"
      );

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("UPDATE", () => {
    it("PUT /tasks/:id replaces a task", async () => {
      const created = await request(app)
        .post("/tasks")
        .send(makeCreateTask({ name: "Old" }));

      const id = created.body.id;

      const response = await request(app)
        .put(`/tasks/${id}`)
        .send(makeReplaceTask({ name: "New" }));

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(id);
      expect(response.body.name).toBe("New");
      expect(response.body.completed).toBe(true);
    });

    it("PATCH /tasks/:id updates partial fields", async () => {
      const created = await request(app)
        .post("/tasks")
        .send(
          makeCreateTask({
            name: "Old",
            completed: false
          })
        );

      const id = created.body.id;

      const response = await request(app)
        .patch(`/tasks/${id}`)
        .send({
          completed: true,
          priority: 10
        });

      expect(response.status).toBe(200);
      expect(response.body.completed).toBe(true);
      expect(response.body.priority).toBe(10);

      const getResponse = await request(app).get(`/tasks/${id}`);

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.name).toBe("Old");
    });

    it("rejects a PATCH body without supported fields", async () => {
      const created = await request(app)
        .post("/tasks")
        .send(makeCreateTask());

      const response = await request(app)
        .patch(`/tasks/${created.body.id}`)
        .send({
          ignoredField: "ignored"
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("DELETE", () => {
    it("DELETE /tasks/:id deletes one task", async () => {
      const created = await request(app)
        .post("/tasks")
        .send(makeCreateTask());

      const id = created.body.id;

      const deleteResponse = await request(app).delete(
        `/tasks/${id}`
      );

      expect(deleteResponse.status).toBe(200);

      const getResponse = await request(app).get(`/tasks/${id}`);

      expect(getResponse.status).toBe(404);
    });

    it("DELETE /tasks deletes all tasks outside production", async () => {
      await request(app).post("/tasks").send(makeCreateTask());
      await request(app).post("/tasks").send(makeCreateTask());

      const response = await request(app).delete("/tasks");

      expect(response.status).toBe(200);
      expect(response.body.deletedCount).toBe(2);

      const listResponse = await request(app).get("/tasks");

      expect(listResponse.status).toBe(200);
      expect(listResponse.body).toHaveLength(0);
    });
  });
});