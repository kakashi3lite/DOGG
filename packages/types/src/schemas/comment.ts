import { z } from "zod";

export const CommentSchema = z.object({
  _id: z.string(),
  content: z.string(),
  author: z.string(), // ref to User
  post: z.string(), // ref to Post
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Comment = z.infer<typeof CommentSchema>;
