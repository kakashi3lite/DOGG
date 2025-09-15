import { model, Schema } from "mongoose";
import { User } from "types";

const userSchema = new Schema<User>(
  {
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatarUrl: { type: String },
  },
  { timestamps: true },
);

export const UserModel = model<User>("User", userSchema);
