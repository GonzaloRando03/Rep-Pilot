import { Schema, model, Document } from "mongoose";

export interface ApiTokenDocument extends Document<string> {
  _id: string;
  userId: string;
  name: string;
  tokenHash: string;
  prefix: string;
  lastUsedAt: Date | null;
  createdAt: Date;
}

const apiTokenSchema = new Schema<ApiTokenDocument>(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    tokenHash: { type: String, required: true, unique: true },
    prefix: { type: String, required: true },
    lastUsedAt: { type: Date, default: null },
    createdAt: { type: Date, required: true, default: () => new Date() },
  },
  { _id: false },
);

// Índice compuesto para buscar tokens de un usuario eficientemente
apiTokenSchema.index({ userId: 1, createdAt: -1 });

export const ApiTokenModel = model<ApiTokenDocument>(
  "ApiToken",
  apiTokenSchema,
);
