export type Subject = "Work" | "Study" | "Personal" | "Health";

export const SUBJECTS: readonly Subject[] = [
  "Work",
  "Study",
  "Personal",
  "Health"
];

export type LonLat = [longitude: number, latitude: number];

export type Task = {
  name: string;
  subject: Subject;
  priority: number;
  date: string;
  completed: boolean;
  location: LonLat;
};

export type TaskResponse = Task & { id: string };

export type CreateTaskInput = Omit<Task, "completed"> & {
  completed?: boolean;
};

export type ReplaceTaskInput = Task;
export type PatchTaskInput = Partial<Task>;

export type ListTasksQuery = {
  subject?: Subject;
  completed?: boolean;
  priorityMin?: number;
  priorityMax?: number;
};

export type TaskIdParams = {
  id: string;
};