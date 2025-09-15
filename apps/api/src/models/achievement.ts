import { model, Schema } from "mongoose";
import { Achievement } from "types";

const achievementSchema = new Schema<Achievement>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    badgeUrl: { type: String, required: true },
    xp: { type: Number, required: true },
  },
  { timestamps: true },
);

export const AchievementModel = model<Achievement>(
  "Achievement",
  achievementSchema,
);
