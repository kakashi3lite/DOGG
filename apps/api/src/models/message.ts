import { model, Schema } from "mongoose";
import { Message } from "types";

const messageSchema = new Schema<Message>(
  {
    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const MessageModel = model<Message>("Message", messageSchema);
