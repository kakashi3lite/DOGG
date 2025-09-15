import { z } from "zod";

export const PostSchema = z.object({
  _id: z.string(),
  title: z.string(),
  content: z.string(),
  author: z.string(), // ref to User
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Post = z.infer<typeof PostSchema>;
