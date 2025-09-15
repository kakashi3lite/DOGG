import { model, Schema } from "mongoose";
import { UserAchievement } from "types";

const userAchievementSchema = new Schema<UserAchievement>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    achievement: {
      type: Schema.Types.ObjectId,
      ref: "Achievement",
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

userAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });

export const UserAchievementModel = model<UserAchievement>(
  "UserAchievement",
  userAchievementSchema,
);
