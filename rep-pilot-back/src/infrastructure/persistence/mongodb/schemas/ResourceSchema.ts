import { Schema, model, Document } from "mongoose";
import { ResourceType } from "../../../../domain/enums/ResourceType";

export interface StarDocument {
  user: string;
}

export interface ResourceDocument extends Document<string> {
  _id: string;
  name: string;
  type: ResourceType;
  description: string;
  gitUrl: string;
  path: string;
  stars: StarDocument[];
  tags: string[];
  createdAt: Date;
  createdBy: string;
}

const starSchema = new Schema<StarDocument>(
  {
    user: { type: String, required: true },
  },
  { _id: false },
);

const resourceSchema = new Schema<ResourceDocument>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, enum: Object.values(ResourceType), required: true },
    description: { type: String, required: true },
    gitUrl: { type: String, required: true },
    path: { type: String, default: "" },
    stars: { type: [starSchema], default: [] },
    tags: { type: [String], default: [] },
    createdAt: { type: Date, required: true, default: () => new Date() },
    createdBy: { type: String, required: true },
  },
  { _id: false },
);

export const ResourceModel = model<ResourceDocument>(
  "Resource",
  resourceSchema,
);
