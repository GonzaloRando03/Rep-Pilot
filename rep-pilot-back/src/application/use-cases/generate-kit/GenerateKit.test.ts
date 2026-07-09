import { describe, it, expect, beforeEach, vi } from "vitest";
import JSZip from "jszip";
import { GenerateKit } from "./GenerateKit";
import {
  mockLlmProvider,
  mockConfigRepository,
  mockTagRepository,
  mockResourceRepository,
  mockGitProvider,
  buildAppConfig,
  buildTag,
  buildResource,
} from "../__test-helpers";
import { ResourceType } from "../../../domain/enums/ResourceType";

describe("GenerateKit", () => {
  let useCase: GenerateKit;
  const llmProvider = mockLlmProvider();
  const configRepo = mockConfigRepository();
  const tagRepo = mockTagRepository();
  const resourceRepo = mockResourceRepository();
  const gitProvider = mockGitProvider();
  const gitFactory = { getProvider: vi.fn().mockReturnValue(gitProvider) };

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new GenerateKit(
      llmProvider,
      configRepo,
      tagRepo,
      resourceRepo,
      gitFactory,
    );
  });

  const input = {
    specs: "I need a React + TypeScript kit with testing",
    questionsAndAnswers: [
      { question: "State management?", answer: "Redux" },
      { question: "¿Qué herramienta AI vas a usar?", answer: "GitHub Copilot" },
    ],
  };

  it("should throw LlmProviderError if no config exists", async () => {
    vi.mocked(configRepo.find).mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toThrow(
      "LLM provider is not configured",
    );
  });

  it("should throw LlmProviderError if config has empty fields", async () => {
    const config = buildAppConfig({
      openaiConfig: { url: "", token: "", model: "" },
    });
    vi.mocked(configRepo.find).mockResolvedValue(config);

    await expect(useCase.execute(input)).rejects.toThrow(
      "LLM provider URL, token, and model are required",
    );
  });

  it("should generate a kit ZIP with files under the .github/ root for GitHub Copilot", async () => {
    const config = buildAppConfig();
    vi.mocked(configRepo.find).mockResolvedValue(config);

    // Tags
    const tags = [
      buildTag({ id: "tag-1", name: "react" }),
      buildTag({ id: "tag-2", name: "typescript" }),
    ];
    vi.mocked(tagRepo.findAll).mockResolvedValue(tags);

    // First LLM call: tag selection
    vi.mocked(llmProvider.chat).mockResolvedValueOnce({
      role: "assistant",
      content: JSON.stringify({ selectedTags: ["react"] }),
    });

    // Resources found by tags
    const resource = buildResource({
      id: "r1",
      name: "react-skills",
      type: ResourceType.SKILL,
      gitUrl: "https://github.com/test/react-skills",
    });
    vi.mocked(resourceRepo.findByTags).mockResolvedValue([resource]);

    // Git files
    vi.mocked(gitProvider.listFiles).mockResolvedValue([
      {
        path: "skills/react-skill/SKILL.md",
        name: "SKILL.md",
        type: "file",
        gitUrl: resource.gitUrl,
      },
      {
        path: "README.md",
        name: "README.md",
        type: "file",
        gitUrl: resource.gitUrl,
      },
    ]);

    // Second LLM call: file selection + README
    const llmResponse = JSON.stringify({
      files: [
        {
          repoUrl: resource.gitUrl,
          path: "skills/react-skill/SKILL.md",
          destinationPath: "skills/react-skill/SKILL.md",
        },
      ],
      mdReadme: "# React Kit\nConfigured with Redux",
    });
    vi.mocked(llmProvider.chat).mockResolvedValueOnce({
      role: "assistant",
      content: llmResponse,
    });

    // File content
    vi.mocked(gitProvider.getFileContentBuffer).mockResolvedValue(
      Buffer.from("skill content here for the kit"),
    );

    const result = await useCase.execute(input);

    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.filename).toBeTruthy();

    // Verify files are under .github/ root
    const zip = await JSZip.loadAsync(result.buffer);
    const paths = Object.keys(zip.files);
    expect(paths).toContain("README.md");
    expect(paths).toContain(".github/skills/react-skill/SKILL.md");
    expect(result.buffer.length).toBeGreaterThan(22);
  });

  it("should place files under kit/ root when no AI tool is detected", async () => {
    const config = buildAppConfig();
    vi.mocked(configRepo.find).mockResolvedValue(config);

    const tags = [buildTag({ id: "tag-1", name: "react" })];
    vi.mocked(tagRepo.findAll).mockResolvedValue(tags);

    vi.mocked(llmProvider.chat).mockResolvedValueOnce({
      role: "assistant",
      content: JSON.stringify({ selectedTags: ["react"] }),
    });

    const resource = buildResource({
      id: "r1",
      name: "react-skills",
      type: ResourceType.SKILL,
      gitUrl: "https://github.com/test/react-skills",
    });
    vi.mocked(resourceRepo.findByTags).mockResolvedValue([resource]);

    vi.mocked(gitProvider.listFiles).mockResolvedValue([
      {
        path: "agents/test.agent.md",
        name: "test.agent.md",
        type: "file",
        gitUrl: resource.gitUrl,
      },
    ]);

    vi.mocked(llmProvider.chat).mockResolvedValueOnce({
      role: "assistant",
      content: JSON.stringify({
        files: [
          {
            repoUrl: resource.gitUrl,
            path: "agents/test.agent.md",
            destinationPath: "agents/test/test.agent.md",
          },
        ],
        mdReadme: "# Kit\nMinimal",
      }),
    });

    vi.mocked(gitProvider.getFileContentBuffer).mockResolvedValue(
      Buffer.from("agent"),
    );

    // Input WITHOUT a tool question
    const result = await useCase.execute({
      specs: "test",
      questionsAndAnswers: [{ question: "State management?", answer: "Redux" }],
    });

    const zip = await JSZip.loadAsync(result.buffer);
    const paths = Object.keys(zip.files);
    expect(paths).toContain("README.md");
    expect(paths).toContain("kit/agents/test/test.agent.md");
  });

  it("should place files under .claude/ root for Claude Code", async () => {
    const config = buildAppConfig();
    vi.mocked(configRepo.find).mockResolvedValue(config);

    const tags = [buildTag({ id: "tag-1", name: "testing" })];
    vi.mocked(tagRepo.findAll).mockResolvedValue(tags);

    vi.mocked(llmProvider.chat).mockResolvedValueOnce({
      role: "assistant",
      content: JSON.stringify({ selectedTags: ["testing"] }),
    });

    const resource = buildResource({
      id: "r1",
      name: "test-utils",
      type: ResourceType.SKILL,
      gitUrl: "https://github.com/test/utils",
    });
    vi.mocked(resourceRepo.findByTags).mockResolvedValue([resource]);

    vi.mocked(gitProvider.listFiles).mockResolvedValue([
      {
        path: "skills/testing/SKILL.md",
        name: "SKILL.md",
        type: "file",
        gitUrl: resource.gitUrl,
      },
    ]);

    vi.mocked(llmProvider.chat).mockResolvedValueOnce({
      role: "assistant",
      content: JSON.stringify({
        files: [
          {
            repoUrl: resource.gitUrl,
            path: "skills/testing/SKILL.md",
            destinationPath: "skills/testing/SKILL.md",
          },
        ],
        mdReadme: "# Claude Kit\nWith testing",
      }),
    });

    vi.mocked(gitProvider.getFileContentBuffer).mockResolvedValue(
      Buffer.from("skill"),
    );

    const result = await useCase.execute({
      specs: "test",
      questionsAndAnswers: [
        { question: "¿Qué herramienta AI usarás?", answer: "Claude Code" },
      ],
    });

    const zip = await JSZip.loadAsync(result.buffer);
    const paths = Object.keys(zip.files);
    expect(paths).toContain("README.md");
    expect(paths).toContain(".claude/skills/testing/SKILL.md");
  });

  it("should place files under .opencode/ root for OpenCode", async () => {
    const config = buildAppConfig();
    vi.mocked(configRepo.find).mockResolvedValue(config);

    const tags = [buildTag({ id: "tag-1", name: "react" })];
    vi.mocked(tagRepo.findAll).mockResolvedValue(tags);

    vi.mocked(llmProvider.chat).mockResolvedValueOnce({
      role: "assistant",
      content: JSON.stringify({ selectedTags: ["react"] }),
    });

    const resource = buildResource({
      id: "r1",
      name: "react-skills",
      type: ResourceType.INSTRUCTION,
      gitUrl: "https://github.com/test/react",
    });
    vi.mocked(resourceRepo.findByTags).mockResolvedValue([resource]);

    vi.mocked(gitProvider.listFiles).mockResolvedValue([
      {
        path: "instructions/solid.instructions.md",
        name: "solid.instructions.md",
        type: "file",
        gitUrl: resource.gitUrl,
      },
    ]);

    vi.mocked(llmProvider.chat).mockResolvedValueOnce({
      role: "assistant",
      content: JSON.stringify({
        files: [
          {
            repoUrl: resource.gitUrl,
            path: "instructions/solid.instructions.md",
            destinationPath: "rules/solid/solid.md",
          },
        ],
        mdReadme: "# OpenCode Kit\nWith rules",
      }),
    });

    vi.mocked(gitProvider.getFileContentBuffer).mockResolvedValue(
      Buffer.from("rule content"),
    );

    const result = await useCase.execute({
      specs: "test",
      questionsAndAnswers: [
        { question: "What tool will you use?", answer: "OpenCode" },
      ],
    });

    const zip = await JSZip.loadAsync(result.buffer);
    const paths = Object.keys(zip.files);
    expect(paths).toContain("README.md");
    expect(paths).toContain(".opencode/rules/solid/solid.md");
  });
});
