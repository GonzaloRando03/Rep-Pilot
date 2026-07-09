import { Language } from "../../domain/enums/Language";

export interface QuestionAnswer {
  question: string;
  answer: string;
}

export interface GenerateKitRequestDTO {
  specs: string;
  questionsAndAnswers: QuestionAnswer[];
  language?: Language;
}

export interface GenerateKitResponseDTO {
  buffer: Buffer;
  filename: string;
}

/** Supported AI coding tools — determines the kit directory structure */
export type AiTool = "github-copilot" | "claude-code" | "opencode" | "other";

/** Per-tool directory convention */
export interface AiKitStructure {
  rootDir: string;
  rulesFolder: string; // "instructions" or "rules"
}

export const TOOL_KIT_STRUCTURE: Record<AiTool, AiKitStructure> = {
  "github-copilot": { rootDir: ".github", rulesFolder: "instructions" },
  "claude-code": { rootDir: ".claude", rulesFolder: "rules" },
  opencode: { rootDir: ".opencode", rulesFolder: "rules" },
  other: { rootDir: "kit", rulesFolder: "rules" },
};

/** Internal shape the LLM returns when selecting files from repo trees */
export interface LlmFileSelection {
  repoUrl: string;
  path: string;
  destinationPath: string;
}

export interface LlmGenerateKitResponse {
  files: LlmFileSelection[];
  mdReadme: string;
}
