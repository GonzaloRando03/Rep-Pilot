import { Schema, model, Document } from "mongoose";

export interface ProjectDocument extends Document<string> {
  _id: string;
  name: string;
  members: string[];
  rootFolderName: string;
  directoryTree: Record<string, unknown>;
  createdAt: Date;
  createdBy: string;
  group?: string;
}

const projectSchema = new Schema<ProjectDocument>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    members: { type: [String], default: [] },
    rootFolderName: { type: String, required: true },
    directoryTree: { type: Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, required: true, default: () => new Date() },
    createdBy: { type: String, required: true },
    group: { type: String, required: false },
  },
  { _id: false },
);

export const ProjectModel = model<ProjectDocument>("Project", projectSchema);
