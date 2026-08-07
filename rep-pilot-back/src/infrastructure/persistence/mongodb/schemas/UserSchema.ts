import { Schema, model, Document } from "mongoose";

export interface UserDocument extends Document<string> {
  _id: string;
  username: string;
  name: string;
  isAdmin: boolean;
  password: string;
  language: string;
  twoFactorSecret: string | null;
  twoFactorEnabled: boolean;
  email?: string;
}

const userSchema = new Schema<UserDocument>(
  {
    _id: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
    password: { type: String, required: true },
    language: { type: String, required: true, default: "en" },
    twoFactorSecret: { type: String, default: null },
    twoFactorEnabled: { type: Boolean, required: true, default: false },
    email: { type: String, required: false },
  },
  { _id: false },
);

export const UserModel = model<UserDocument>("User", userSchema);
