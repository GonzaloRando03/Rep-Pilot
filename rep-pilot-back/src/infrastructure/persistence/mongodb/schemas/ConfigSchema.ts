import { Schema, model, Document } from "mongoose";

export interface GitInstanceDocument {
  id: string;
  url: string;
  username: string;
  token: string;
}

export interface OpenAiConfigDocument {
  url: string;
  token: string;
  model: string;
}

export interface LdapConfigDocument {
  url: string;
  bindDn: string;
}

export interface ConfigDocument extends Document<string> {
  _id: string;
  gitInstances: GitInstanceDocument[];
  openaiConfig: OpenAiConfigDocument;
  ldapConfig: LdapConfigDocument;
  enableTwoFactor: boolean;
}

const gitInstanceSchema = new Schema<GitInstanceDocument>(
  {
    id: { type: String, required: true },
    url: { type: String, required: true },
    username: { type: String, required: true },
    token: { type: String, required: true },
  },
  { _id: false },
);

const openAiConfigSchema = new Schema<OpenAiConfigDocument>(
  {
    url: { type: String, required: true, default: "" },
    token: { type: String, required: true, default: "" },
    model: { type: String, required: true, default: "gpt-4o" },
  },
  { _id: false },
);

const ldapConfigSchema = new Schema<LdapConfigDocument>(
  {
    url: { type: String, required: true, default: "" },
    bindDn: { type: String, required: true, default: "" },
  },
  { _id: false },
);

const configSchema = new Schema<ConfigDocument>(
  {
    _id: { type: String, required: true },
    gitInstances: { type: [gitInstanceSchema], required: true, default: [] },
    openaiConfig: {
      type: openAiConfigSchema,
      required: true,
      default: () => ({ url: "", token: "", model: "gpt-4o" }),
    },
    ldapConfig: {
      type: ldapConfigSchema,
      required: true,
      default: () => ({
        url: "",
        bindDn: "",
      }),
    },
    enableTwoFactor: { type: Boolean, required: true, default: false },
  },
  { _id: false },
);

export const ConfigModel = model<ConfigDocument>("Config", configSchema);
export const CONFIG_DOCUMENT_ID = "app-config";
