import { z } from "zod";

export const AchievementSchema = z.object({
  _id: z.string(),
  name: z.string(),
  description: z.string(),
  badgeUrl: z.string().url(),
  xp: z.number().int().positive(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Achievement = z.infer<typeof AchievementSchema>;
