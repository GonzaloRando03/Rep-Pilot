export interface LlmMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface LlmConfig {
  url: string;
  token: string;
  model: string;
}

export interface LlmProviderPort {
  chat(messages: LlmMessage[], config: LlmConfig): Promise<LlmMessage>;
}
