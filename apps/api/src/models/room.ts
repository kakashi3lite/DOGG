import { model, Schema } from "mongoose";
import { Room } from "types";

const roomSchema = new Schema<Room>(
  {
    name: { type: String },
    isGroup: { type: Boolean, default: false },
    participants: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
  },
  { timestamps: true },
);

export const RoomModel = model<Room>("Room", roomSchema);
