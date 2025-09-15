import { model, Schema } from "mongoose";
import { Lesson } from "types";

const lessonSchema = new Schema<Lesson>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    videoUrl: { type: String, required: true },
    xp: { type: Number, required: true },
  },
  { timestamps: true },
);

export const LessonModel = model<Lesson>("Lesson", lessonSchema);
