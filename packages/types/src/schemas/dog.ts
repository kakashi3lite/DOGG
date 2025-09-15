import { z } from "zod";

export const DogSchema = z.object({
  _id: z.string(),
  name: z.string(),
  breed: z.string(),
  age: z.number().int().positive(),
  owner: z.string(), // ref to User
  avatarUrl: z.string().url().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Dog = z.infer<typeof DogSchema>;
