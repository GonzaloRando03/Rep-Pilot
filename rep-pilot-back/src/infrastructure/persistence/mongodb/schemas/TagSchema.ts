import { Schema, model, Document } from "mongoose";

export interface TagDocument extends Document<string> {
  _id: string;
  name: string;
}

const tagSchema = new Schema<TagDocument>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, unique: true },
  },
  { _id: false },
);

export const TagModel = model<TagDocument>("Tag", tagSchema);
