import type { CreateTaskInput, ReplaceTaskInput } from "../../src/model/TaskModel.ts";

export function makeCreateTask(overrides: Partial<CreateTaskInput> = {}): CreateTaskInput {
  const base: CreateTaskInput = {
    name: "Build UI with React + MUI",
    subject: "Work",
    priority: 5,
    date: "2026-01-27",
    location: [34.7818, 32.0853],
    completed: false
  };

  return { ...base, ...overrides };
}

export function makeReplaceTask(overrides: Partial<ReplaceTaskInput> = {}): ReplaceTaskInput {
  const base: ReplaceTaskInput = {
    name: "Updated name",
    subject: "Study",
    priority: 8,
    date: "2026-01-28",
    completed: true,
    location: [35.2137, 31.7683]
  };

  return { ...base, ...overrides };
}
