import { LlmProviderError } from "../../../domain/errors/LlmProviderError";
import { ChatRequestDTO, ChatResponseDTO } from "../../dto/ChatDTO";
import { ChatUseCase } from "../../ports/in/ChatUseCase";
import { ConfigRepository } from "../../ports/out/ConfigRepository";
import { LlmProviderPort } from "../../ports/out/LlmProviderPort";

export class Chat implements ChatUseCase {
  constructor(
    private readonly llmProvider: LlmProviderPort,
    private readonly configRepository: ConfigRepository,
  ) {}

  async execute(input: ChatRequestDTO): Promise<ChatResponseDTO> {
    const config = await this.configRepository.find();

    if (!config) {
      throw new LlmProviderError(
        "LLM provider is not configured. Please set up the configuration first.",
      );
    }

    const { url, token, model } = config.openaiConfig;

    if (!url || !token || !model) {
      throw new LlmProviderError(
        "LLM provider URL, token, and model are required. Please configure them in settings.",
      );
    }

    const response = await this.llmProvider.chat(input.messages, {
      url,
      token,
      model,
    });

    return { message: response };
  }
}
