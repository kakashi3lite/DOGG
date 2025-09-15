import { z } from "zod";

export const LessonSchema = z.object({
  _id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  videoUrl: z.string().url(),
  xp: z.number().int().positive(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Lesson = z.infer<typeof LessonSchema>;
