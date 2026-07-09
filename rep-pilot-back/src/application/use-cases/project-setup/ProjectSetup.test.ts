import { describe, it, expect, beforeEach, vi } from "vitest";
import { ProjectSetup } from "./ProjectSetup";
import {
  mockLlmProvider,
  mockConfigRepository,
  mockTagRepository,
  mockResourceRepository,
  buildAppConfig,
  buildTag,
} from "../__test-helpers";

describe("ProjectSetup", () => {
  let useCase: ProjectSetup;
  const llmProvider = mockLlmProvider();
  const configRepo = mockConfigRepository();
  const tagRepo = mockTagRepository();
  const resourceRepo = mockResourceRepository();

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new ProjectSetup(llmProvider, configRepo, tagRepo, resourceRepo);
  });

  const input = { specs: "I need a React frontend with TypeScript" };

  it("should throw LlmProviderError if no config exists", async () => {
    vi.mocked(configRepo.find).mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toThrow(
      "LLM provider is not configured",
    );
  });

  it("should throw LlmProviderError if config is incomplete", async () => {
    const config = buildAppConfig({
      openaiConfig: { url: "", token: "", model: "" },
    });
    vi.mocked(configRepo.find).mockResolvedValue(config);

    await expect(useCase.execute(input)).rejects.toThrow(
      "LLM provider URL, token, and model are required",
    );
  });

  it("should execute two-step flow: select tags then generate response", async () => {
    const config = buildAppConfig();
    vi.mocked(configRepo.find).mockResolvedValue(config);

    const tags = [
      buildTag({ id: "tag-1", name: "react" }),
      buildTag({ id: "tag-2", name: "typescript" }),
    ];
    vi.mocked(tagRepo.findAll).mockResolvedValue(tags);

    // First LLM call: tag selection
    vi.mocked(llmProvider.chat)
      .mockResolvedValueOnce({
        role: "assistant",
        content: JSON.stringify({ selectedTags: ["react", "typescript"] }),
      })
      // Second LLM call: final response
      .mockResolvedValueOnce({
        role: "assistant",
        content: JSON.stringify({
          mdToRender: "# Your React+TS project\nLooks great!",
          questions: ["Which state management?", "CSS framework?"],
        }),
      });

    vi.mocked(resourceRepo.findByTags).mockResolvedValue([]);

    const result = await useCase.execute(input);

    expect(result.mdToRender).toContain("Your React+TS project");
    expect(result.questions).toEqual([
      "Which state management?",
      "CSS framework?",
      "Which AI coding tool will you use? (e.g., GitHub Copilot, Claude Code, OpenCode, or other)",
    ]);
  });

  it("should handle empty tags gracefully", async () => {
    const config = buildAppConfig();
    vi.mocked(configRepo.find).mockResolvedValue(config);
    vi.mocked(tagRepo.findAll).mockResolvedValue([]);

    // Only one LLM call (no tags to select)
    vi.mocked(llmProvider.chat).mockResolvedValueOnce({
      role: "assistant",
      content: JSON.stringify({
        mdToRender: "# General setup",
        questions: [],
      }),
    });

    const result = await useCase.execute(input);

    expect(result.mdToRender).toBe("# General setup");
    expect(result.questions).toEqual([
      "Which AI coding tool will you use? (e.g., GitHub Copilot, Claude Code, OpenCode, or other)",
    ]);
  });

  it("should fallback to all tags if LLM response parsing fails", async () => {
    const config = buildAppConfig();
    vi.mocked(configRepo.find).mockResolvedValue(config);

    const tags = [buildTag({ id: "tag-1", name: "react" })];
    vi.mocked(tagRepo.findAll).mockResolvedValue(tags);

    // First LLM call returns invalid JSON → fallback
    vi.mocked(llmProvider.chat)
      .mockResolvedValueOnce({
        role: "assistant",
        content: "not json",
      })
      // Second LLM call
      .mockResolvedValueOnce({
        role: "assistant",
        content: JSON.stringify({
          mdToRender: "fallback response",
          questions: [],
        }),
      });

    vi.mocked(resourceRepo.findByTags).mockResolvedValue([]);

    const result = await useCase.execute(input);

    expect(result.mdToRender).toBe("fallback response");
    expect(result.questions).toContain(
      "Which AI coding tool will you use? (e.g., GitHub Copilot, Claude Code, OpenCode, or other)",
    );
    expect(resourceRepo.findByTags).toHaveBeenCalledWith(["tag-1"]);
  });

  it("should use user language in prompts", async () => {
    const config = buildAppConfig();
    vi.mocked(configRepo.find).mockResolvedValue(config);
    vi.mocked(tagRepo.findAll).mockResolvedValue([]);

    vi.mocked(llmProvider.chat).mockResolvedValueOnce({
      role: "assistant",
      content: JSON.stringify({
        mdToRender: "¡Proyecto configurado!",
        questions: [],
      }),
    });

    const result = await useCase.execute({ ...input, language: "es" as any });

    expect(result.mdToRender).toBe("¡Proyecto configurado!");
    expect(result.questions).toEqual([
      "¿Qué herramienta de codificación AI vas a usar? (ej: GitHub Copilot, Claude Code, OpenCode, u otra)",
    ]);
  });
});
