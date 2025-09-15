import { z } from "zod";

export const RelationshipSchema = z.object({
  _id: z.string(),
  follower: z.string(), // ref to User
  following: z.string(), // ref to User
  createdAt: z.date(),
});

export type Relationship = z.infer<typeof RelationshipSchema>;
