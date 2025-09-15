import { model, Schema } from "mongoose";
import { HealthRecord } from "types";

const healthRecordSchema = new Schema<HealthRecord>(
  {
    dog: {
      type: Schema.Types.ObjectId,
      ref: "Dog",
      required: true,
      index: true,
    },
    recordType: {
      type: String,
      enum: ["vaccination", "medication", "checkup"],
      required: true,
    },
    notes: { type: String, required: true },
    date: { type: Date, required: true },
  },
  { timestamps: true },
);

export const HealthRecordModel = model<HealthRecord>(
  "HealthRecord",
  healthRecordSchema,
);
