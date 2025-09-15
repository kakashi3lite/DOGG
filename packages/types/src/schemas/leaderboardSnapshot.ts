import { z } from "zod";

const LeaderboardEntrySchema = z.object({
  user: z.string(), // ref to User
  xp: z.number().int(),
  rank: z.number().int(),
});

export const LeaderboardSnapshotSchema = z.object({
  _id: z.string(),
  type: z.enum(["daily", "weekly", "monthly", "all-time"]),
  entries: z.array(LeaderboardEntrySchema),
  createdAt: z.date(),
});

export type LeaderboardSnapshot = z.infer<typeof LeaderboardSnapshotSchema>;
