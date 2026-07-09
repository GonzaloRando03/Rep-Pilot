export interface ChatMessageDTO {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequestDTO {
  messages: ChatMessageDTO[];
}

export interface ChatResponseDTO {
  message: ChatMessageDTO;
}
