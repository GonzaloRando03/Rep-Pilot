import { describe, it, expect, beforeEach, vi } from "vitest";
import { Chat } from "../chat/Chat";
import {
  mockLlmProvider,
  mockConfigRepository,
  buildAppConfig,
} from "../__test-helpers";

describe("Chat", () => {
  let useCase: Chat;
  const llmProvider = mockLlmProvider();
  const configRepo = mockConfigRepository();

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new Chat(llmProvider, configRepo);
  });

  const chatRequest = {
    messages: [{ role: "user" as const, content: "Hello" }],
  };

  it("should call LLM provider and return response", async () => {
    const config = buildAppConfig();
    vi.mocked(configRepo.find).mockResolvedValue(config);
    vi.mocked(llmProvider.chat).mockResolvedValue({
      role: "assistant",
      content: "Hi there!",
    });

    const result = await useCase.execute(chatRequest);

    expect(result.message.content).toBe("Hi there!");
    expect(llmProvider.chat).toHaveBeenCalledWith(chatRequest.messages, {
      url: "https://api.openai.com",
      token: "sk-test",
      model: "gpt-4o",
    });
  });

  it("should throw LlmProviderError if no config exists", async () => {
    vi.mocked(configRepo.find).mockResolvedValue(null);

    await expect(useCase.execute(chatRequest)).rejects.toThrow(
      "LLM provider is not configured",
    );
  });

  it("should throw LlmProviderError if config has empty URL", async () => {
    const config = buildAppConfig({
      openaiConfig: { url: "", token: "sk", model: "gpt-4o" },
    });
    vi.mocked(configRepo.find).mockResolvedValue(config);

    await expect(useCase.execute(chatRequest)).rejects.toThrow(
      "LLM provider URL, token, and model are required",
    );
  });

  it("should throw LlmProviderError if config has empty token", async () => {
    const config = buildAppConfig({
      openaiConfig: { url: "http://x", token: "", model: "gpt-4o" },
    });
    vi.mocked(configRepo.find).mockResolvedValue(config);

    await expect(useCase.execute(chatRequest)).rejects.toThrow(
      "LLM provider URL, token, and model are required",
    );
  });
});
