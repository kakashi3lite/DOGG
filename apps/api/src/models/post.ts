import { model, Schema } from "mongoose";
import { Post } from "types";

const postSchema = new Schema<Post>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

export const PostModel = model<Post>("Post", postSchema);
