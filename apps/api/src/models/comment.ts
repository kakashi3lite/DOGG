import { model, Schema } from "mongoose";
import { Comment } from "types";

const commentSchema = new Schema<Comment>(
  {
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

export const CommentModel = model<Comment>("Comment", commentSchema);
