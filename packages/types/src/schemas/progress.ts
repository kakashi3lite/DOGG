import { z } from "zod";

export const ProgressSchema = z.object({
  _id: z.string(),
  user: z.string(), // ref to User
  lesson: z.string(), // ref to Lesson
  completed: z.boolean(),
  xpEarned: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Progress = z.infer<typeof ProgressSchema>;
