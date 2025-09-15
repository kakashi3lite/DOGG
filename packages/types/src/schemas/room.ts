import { z } from "zod";

export const RoomSchema = z.object({
  _id: z.string(),
  name: z.string().optional(), // for group chats
  isGroup: z.boolean().default(false),
  participants: z.array(z.string()), // array of user ids
  lastMessage: z.string().optional(), // ref to Message
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Room = z.infer<typeof RoomSchema>;
