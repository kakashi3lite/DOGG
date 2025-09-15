import { model, Schema } from "mongoose";
import { Progress } from "types";

const progressSchema = new Schema<Progress>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lesson: { type: Schema.Types.ObjectId, ref: "Lesson", required: true },
    completed: { type: Boolean, default: false },
    xpEarned: { type: Number, default: 0 },
  },
  { timestamps: true },
);

progressSchema.index({ user: 1, lesson: 1 }, { unique: true });

export const ProgressModel = model<Progress>("Progress", progressSchema);
