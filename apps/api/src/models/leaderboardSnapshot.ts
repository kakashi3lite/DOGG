import { model, Schema } from "mongoose";
import { LeaderboardSnapshot } from "types";

const leaderboardSnapshotSchema = new Schema<LeaderboardSnapshot>(
  {
    type: {
      type: String,
      enum: ["daily", "weekly", "monthly", "all-time"],
      required: true,
    },
    entries: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        xp: { type: Number, required: true },
        rank: { type: Number, required: true },
      },
    ],
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

leaderboardSnapshotSchema.index({ type: 1, createdAt: -1 });

export const LeaderboardSnapshotModel = model<LeaderboardSnapshot>(
  "LeaderboardSnapshot",
  leaderboardSnapshotSchema,
);
