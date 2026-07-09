import {
  LlmConfig,
  LlmMessage,
  LlmProviderPort,
} from "../../application/ports/out/LlmProviderPort";
import { LlmProviderError } from "../../domain/errors/LlmProviderError";

interface OpenAiChatResponse {
  choices: {
    message: {
      role: string;
      content: string;
    };
  }[];
}

export class OpenAiLlmProvider implements LlmProviderPort {
  async chat(messages: LlmMessage[], config: LlmConfig): Promise<LlmMessage> {
    const url = config.url.replace(/\/$/, "");

    const response = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.token}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "Unknown error");
      throw new LlmProviderError(
        `LLM provider returned status ${response.status}: ${errorBody}`,
      );
    }

    const data = (await response.json()) as OpenAiChatResponse;

    const choice = data.choices?.[0];
    if (!choice?.message) {
      throw new LlmProviderError(
        "LLM provider returned an unexpected response format",
      );
    }

    return {
      role: "assistant",
      content: choice.message.content,
    };
  }
}
