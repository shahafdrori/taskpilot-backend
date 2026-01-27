// FILE: src/model/TaskModel.ts
export const SUBJECTS = ["Work", "Study", "Personal", "Health"] as const;
export type Subject = (typeof SUBJECTS)[number];

export type LonLat = [number, number]; // [lon, lat]

export type Task = {
  name: string;
  subject: Subject;
  priority: number; // 1..10
  date: string; // YYYY-MM-DD
  completed: boolean;
  location: LonLat;
};

export type TaskResponse = Task & { id: string };

export type CreateTaskInput = Omit<Task, "completed"> & { completed?: boolean };
export type ReplaceTaskInput = Task;
export type PatchTaskInput = Partial<Task>;
