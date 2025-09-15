import { model, Schema } from "mongoose";
import { Relationship } from "types";

const relationshipSchema = new Schema<Relationship>(
  {
    follower: { type: Schema.Types.ObjectId, ref: "User", required: true },
    following: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

relationshipSchema.index({ follower: 1, following: 1 }, { unique: true });

export const RelationshipModel = model<Relationship>(
  "Relationship",
  relationshipSchema,
);
