import { model, Schema } from "mongoose";
import { Dog } from "types";

const dogSchema = new Schema<Dog>(
  {
    name: { type: String, required: true },
    breed: { type: String, required: true },
    age: { type: Number, required: true },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    avatarUrl: { type: String },
  },
  { timestamps: true },
);

export const DogModel = model<Dog>("Dog", dogSchema);
