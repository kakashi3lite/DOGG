import { z } from "zod";

export const MessageSchema = z.object({
  _id: z.string(),
  room: z.string(), // ref to Room
  sender: z.string(), // ref to User
  content: z.string(),
  readBy: z.array(z.string()), // array of user ids
  createdAt: z.date(),
});

export type Message = z.infer<typeof MessageSchema>;
