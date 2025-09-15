import { z } from "zod";

export const UserSchema = z.object({
  _id: z.string(),
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
  avatarUrl: z.string().url().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;
