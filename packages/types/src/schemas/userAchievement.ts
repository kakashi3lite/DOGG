import { z } from "zod";

export const UserAchievementSchema = z.object({
  _id: z.string(),
  user: z.string(), // ref to User
  achievement: z.string(), // ref to Achievement
  createdAt: z.date(),
});

export type UserAchievement = z.infer<typeof UserAchievementSchema>;
