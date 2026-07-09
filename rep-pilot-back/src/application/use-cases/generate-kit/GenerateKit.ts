import JSZip from "jszip";
import { ResourceType } from "../../../domain/enums/ResourceType";
import { LlmProviderError } from "../../../domain/errors/LlmProviderError";
import {
  GenerateKitRequestDTO,
  GenerateKitResponseDTO,
  LlmGenerateKitResponse,
  LlmFileSelection,
  AiTool,
  TOOL_KIT_STRUCTURE,
} from "../../dto/GenerateKitDTO";
import { GenerateKitUseCase } from "../../ports/in/GenerateKitUseCase";
import { ConfigRepository } from "../../ports/out/ConfigRepository";
import { LlmProviderPort } from "../../ports/out/LlmProviderPort";
import { RepositoryFile } from "../../ports/out/GitProviderPort";
import { ResourceRepository } from "../../ports/out/ResourceRepository";
import { TagRepository } from "../../ports/out/TagRepository";
import { GitProviderFactoryPort } from "../scan-repository/ScanRepository";
import { Resource } from "../../../domain/entities/Resource";

/** Tree sent to the LLM: repo + its file tree (non-MCP resources) */
interface RepoTree {
  repoUrl: string;
  resourceName: string;
  resourceType: string;
  tree: string;
}

/** MCP resource info (no file tree — only README for documentation) */
interface McpInfo {
  name: string;
  description: string;
  readmeContent: string | null;
}

export class GenerateKit implements GenerateKitUseCase {
  constructor(
    private readonly llmProvider: LlmProviderPort,
    private readonly configRepository: ConfigRepository,
    private readonly tagRepository: TagRepository,
    private readonly resourceRepository: ResourceRepository,
    private readonly gitProviderFactory: GitProviderFactoryPort,
  ) {}

  async execute(input: GenerateKitRequestDTO): Promise<GenerateKitResponseDTO> {
    const config = await this.configRepository.find();
    if (!config) {
      throw new LlmProviderError(
        "LLM provider is not configured. Please set up the configuration first.",
      );
    }

    const { url, token, model } = config.openaiConfig;
    if (!url || !token || !model) {
      throw new LlmProviderError(
        "LLM provider URL, token, and model are required.",
      );
    }

    const userLang = input.language ?? "en";
    const userContext = this.buildUserContext(input);

    // Resolve which AI tool the user selected (from Q&A)
    const aiTool = this.resolveAiTool(input.questionsAndAnswers);

    // ── Step 1: Select relevant tags ──
    const tags = await this.tagRepository.findAll();
    const tagNames = tags.map((t) => t.name);
    const tagNameToId = new Map(tags.map((t) => [t.name, t.id.toString()]));

    const selectedTagNames = await this.selectRelevantTags(
      tagNames,
      userContext,
      { url, token, model },
    );

    const selectedTagIds = selectedTagNames
      .map((name) => tagNameToId.get(name))
      .filter((id): id is string => id !== undefined);

    // ── Step 2: Get resources for selected tags ──
    const resources =
      selectedTagIds.length > 0
        ? await this.resourceRepository.findByTags(selectedTagIds)
        : [];

    // ── Step 3: Split resources: MCP vs non-MCP ──
    const mcpResources = resources.filter((r) => r.type === ResourceType.MCP);
    const regularResources = resources.filter(
      (r) => r.type !== ResourceType.MCP,
    );

    // ── Step 4: Get file trees from regular resources + READMEs from MCPs ──
    const repoTrees = await this.gatherRepoTrees(regularResources, config);
    const mcpInfos = await this.gatherMcpInfos(mcpResources, config);

    // ── Step 5: LLM selects files + generates README ──
    const { files, readmeContent } = await this.selectFilesAndReadme(
      repoTrees,
      mcpInfos,
      userContext,
      userLang,
      aiTool,
      { url, token, model },
    );

    // ── Step 6: Download selected files and build zip ──
    const zipBuffer = await this.buildZip(files, readmeContent, aiTool, config);

    return {
      buffer: zipBuffer,
      filename: "rep-pilot-kit",
    };
  }

  // ─── Private helpers ────────────────────────────────────────

  /** Detect the target AI tool from the questions & answers array */
  private resolveAiTool(
    qas: GenerateKitRequestDTO["questionsAndAnswers"],
  ): AiTool {
    const toolKeywords: { regex: RegExp; tool: AiTool }[] = [
      { regex: /\bcopilot\b|\bgithub\s*copilot\b/i, tool: "github-copilot" },
      { regex: /\bclaude\b|\bclaude\s*code\b/i, tool: "claude-code" },
      { regex: /\bopencode\b/i, tool: "opencode" },
    ];

    const toolQuestionKeywords =
      /tool|herramienta|usarás|usar|usas|vas a usar|ai tool|agente/i;

    for (const qa of qas) {
      // Only inspect questions that look like they're asking about the tool
      if (toolQuestionKeywords.test(qa.question)) {
        for (const { regex, tool } of toolKeywords) {
          if (regex.test(qa.answer)) {
            return tool;
          }
        }
        // Question matched but answer didn't match any known tool → fall through to "other"
      }
    }

    return "other";
  }

  private buildUserContext(input: GenerateKitRequestDTO): string {
    const qaText = input.questionsAndAnswers
      .map((qa) => `Q: ${qa.question}\nA: ${qa.answer}`)
      .join("\n\n");

    return `## Project specifications\n${input.specs}\n\n## Questions & Answers\n${qaText}`;
  }

  /** First LLM call: select relevant tags */
  private async selectRelevantTags(
    tagNames: string[],
    userContext: string,
    llmConfig: { url: string; token: string; model: string },
  ): Promise<string[]> {
    if (tagNames.length === 0) return [];

    const tagsList = tagNames.map((t) => `  - ${t}`).join("\n");

    const systemPrompt = `You are an expert assistant in software development technologies.
Your task is to select, from the following list of available tags, those that are RELEVANT for the project described by the user.

Available tags:
${tagsList}

Respond ONLY with a valid JSON object (no markdown or extra text) with this structure:
{
  "selectedTags": ["tag1", "tag2", ...]
}

Select only the tags that are clearly related to the described project. If no tag is relevant, return an empty array.`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: userContext },
    ];

    try {
      const response = await this.llmProvider.chat(messages, llmConfig);
      const cleaned = this.cleanJson(response.content);
      const parsed = JSON.parse(cleaned) as { selectedTags: string[] };

      if (!Array.isArray(parsed.selectedTags)) return [];
      return parsed.selectedTags.filter((t) => tagNames.includes(t));
    } catch {
      return tagNames; // fallback: all tags
    }
  }

  /** Gather file trees from git repos for non-MCP resources */
  private async gatherRepoTrees(
    resources: Resource[],
    config: Awaited<ReturnType<ConfigRepository["find"]>>,
  ): Promise<RepoTree[]> {
    const trees: RepoTree[] = [];
    const seenUrls = new Map<string, RepositoryFile[]>();

    for (const resource of resources) {
      if (!resource.gitUrl) continue;

      if (!seenUrls.has(resource.gitUrl)) {
        try {
          const provider = this.gitProviderFactory.getProvider(resource.gitUrl);
          const gitToken = config?.gitInstances.find((g) =>
            resource.gitUrl.startsWith(g.url),
          )?.token;
          const files = await provider.listFiles(resource.gitUrl, gitToken);
          seenUrls.set(resource.gitUrl, files);
        } catch {
          continue;
        }
      }
    }

    for (const [repoUrl, files] of seenUrls) {
      const repoResources = resources.filter((r) => r.gitUrl === repoUrl);
      const resourceNames = repoResources.map((r) => r.name).join(", ");
      const resourceType = repoResources[0]?.type ?? "UNKNOWN";
      const tree = this.formatTree(files);
      trees.push({
        repoUrl,
        resourceName: resourceNames,
        resourceType,
        tree,
      });
    }

    return trees;
  }

  /** Gather README content for MCP resources (no file tree needed) */
  private async gatherMcpInfos(
    mcpResources: Resource[],
    config: Awaited<ReturnType<ConfigRepository["find"]>>,
  ): Promise<McpInfo[]> {
    const infos: McpInfo[] = [];

    for (const mcp of mcpResources) {
      if (!mcp.gitUrl) {
        infos.push({
          name: mcp.name,
          description: mcp.description,
          readmeContent: null,
        });
        continue;
      }

      try {
        const provider = this.gitProviderFactory.getProvider(mcp.gitUrl);
        const gitToken = config?.gitInstances.find((g) =>
          mcp.gitUrl.startsWith(g.url),
        )?.token;
        const readme = await provider.getFileContent(
          mcp.gitUrl,
          "README.md",
          gitToken,
        );
        infos.push({
          name: mcp.name,
          description: mcp.description,
          readmeContent: readme,
        });
      } catch {
        infos.push({
          name: mcp.name,
          description: mcp.description,
          readmeContent: null,
        });
      }
    }

    return infos;
  }

  /** Format a file list as a flat sorted list */
  private formatTree(files: RepositoryFile[]): string {
    return files
      .filter((f) => f.type === "file")
      .map((f) => f.path)
      .sort()
      .join("\n");
  }

  /** Build the MCP section for the LLM prompt */
  private buildMcpSection(mcpInfos: McpInfo[]): string {
    if (mcpInfos.length === 0) return "";

    return mcpInfos
      .map(
        (m) =>
          `### MCP Server: ${m.name}\nDescription: ${m.description}\nREADME:\n\`\`\`\n${m.readmeContent ?? "(README not available)"}\n\`\`\``,
      )
      .join("\n\n");
  }

  /** Second LLM call: select files + generate README */
  private async selectFilesAndReadme(
    repoTrees: RepoTree[],
    mcpInfos: McpInfo[],
    userContext: string,
    userLang: string,
    aiTool: AiTool,
    llmConfig: { url: string; token: string; model: string },
  ): Promise<{ files: LlmFileSelection[]; readmeContent: string }> {
    const treesSection = repoTrees
      .map(
        (rt) =>
          `### Repository: ${rt.repoUrl}\nResource: ${rt.resourceName} (type: ${rt.resourceType})\nFile tree:\n\`\`\`\n${rt.tree}\n\`\`\``,
      )
      .join("\n\n");

    const mcpSection = this.buildMcpSection(mcpInfos);

    const { rulesFolder } = TOOL_KIT_STRUCTURE[aiTool];

    const systemPrompt = `You are an expert assistant that builds AI-assisted development kits (for GitHub Copilot, OpenCode, Cursor, etc.).

Given a set of repositories with their file trees and optionally some MCP servers, you must:
1. Select the relevant files and organize them into a kit structure.
2. Generate a README.md that explains everything included in the kit.

## Kit structure

\`\`\`
README.md                       (you will generate this)
agents/
  <agent-name>.agent.md
skills/
  <skill-name>/
    SKILL.md
${rulesFolder}/
  <${rulesFolder === "instructions" ? "instruction" : "rule"}-name>.${rulesFolder === "instructions" ? "instructions" : ""}md
\`\`\`

## Rules for file selection

- For agents: include the .agent.md file. Destination: agents/<filename>.agent.md (NO subfolder — the .agent.md goes directly inside agents/)
- For skills: include SKILL.md and any additional files from the same directory. Destination: skills/<skill-name>/<filename> (skills DO have subfolders, one per skill)
- For ${rulesFolder}: include the relevant file. Destination: ${rulesFolder}/<filename> (NO subfolder — the .md goes directly inside ${rulesFolder}/)
- Only select files clearly relevant to the user's project.
- Preserve folder names from original paths (parent folder of SKILL.md = skill name).
- IMPORTANT: Only skills use subfolders. Agents, ${rulesFolder} files go directly in their parent folder without intermediate directories.

## Rules for MCP servers

- MCP servers are NOT included as files in the kit. They are external tools the user must install.
- In the README, explain how to install and configure each MCP server based on its README content.
- If the README content is not available, give general guidance based on the MCP name and description.

## Rules for the README.md

The README must be a complete Markdown document that includes:

1. **Title**: A descriptive title for the kit.
2. **Overview**: Brief explanation of what this kit contains and what it's for.
3. **Contents**: A section listing:
   - Agents included (name + short description based on the agent file)
   - Skills included (name + short description based on the SKILL.md)
   - ${rulesFolder === "instructions" ? "Instructions" : "Rules"} included (name + short description)
   - MCP Servers (name + installation/configuration instructions)
4. **How to use**: Brief instructions on how to use this kit with AI coding tools.

## Response format

Respond ONLY with a valid JSON object (no markdown or extra text):

{
  "files": [
    {
      "repoUrl": "https://github.com/owner/repo",
      "path": "path/to/file/in/repo.md",
      "destinationPath": "skills/my-skill/SKILL.md"
    }
  ],
  "mdReadme": "# Kit Title\\n\\n## Overview\\n...full README in markdown..."
}

- files: array of file selections (can be empty if no regular resources).
- mdReadme: the complete README.md as a single string (with escaped newlines \\n).

IMPORTANT: The entire response must be in this language: ${userLang}`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      {
        role: "user" as const,
        content: `${userContext}\n\n## Available repository trees\n\n${treesSection || "(No regular resources available)"}\n\n## MCP Servers\n\n${mcpSection || "(No MCP servers available)"}`,
      },
    ];

    try {
      const response = await this.llmProvider.chat(messages, llmConfig);
      const cleaned = this.cleanJson(response.content);
      const parsed = JSON.parse(cleaned) as LlmGenerateKitResponse;

      if (!Array.isArray(parsed.files) || typeof parsed.mdReadme !== "string") {
        throw new Error("Invalid response structure");
      }

      const validFiles = parsed.files.filter(
        (f: LlmFileSelection) =>
          typeof f.repoUrl === "string" &&
          typeof f.path === "string" &&
          typeof f.destinationPath === "string",
      );

      return {
        files: validFiles,
        readmeContent: parsed.mdReadme,
      };
    } catch {
      throw new LlmProviderError(
        "Failed to generate kit: LLM returned an unexpected format.",
      );
    }
  }

  /** Build the zip from the selected files + README */
  private async buildZip(
    fileSelection: LlmFileSelection[],
    readmeContent: string,
    aiTool: AiTool,
    config: Awaited<ReturnType<ConfigRepository["find"]>>,
  ): Promise<Buffer> {
    const zip = new JSZip();
    const { rootDir } = TOOL_KIT_STRUCTURE[aiTool];

    // Add README.md at the root
    zip.file("README.md", readmeContent);

    // Group by repoUrl for efficient fetching
    const byRepo = new Map<string, LlmFileSelection[]>();
    for (const f of fileSelection) {
      const list = byRepo.get(f.repoUrl) ?? [];
      list.push(f);
      byRepo.set(f.repoUrl, list);
    }

    for (const [repoUrl, files] of byRepo) {
      const provider = this.gitProviderFactory.getProvider(repoUrl);
      const gitToken = config?.gitInstances.find((g) =>
        repoUrl.startsWith(g.url),
      )?.token;

      await Promise.all(
        files.map(async (file) => {
          try {
            const buffer = await provider.getFileContentBuffer(
              repoUrl,
              file.path,
              gitToken,
            );
            if (buffer !== null) {
              // Prepend the tool-specific root directory
              zip.file(`${rootDir}/${file.destinationPath}`, buffer);
            }
          } catch {
            // Skip files that can't be downloaded
          }
        }),
      );
    }

    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
    });

    // README alone is > 22 bytes, but we keep the guard for safety
    if (zipBuffer.length <= 22) {
      throw new LlmProviderError("No files could be included in the kit.");
    }

    return zipBuffer;
  }

  /** Remove markdown fences from a JSON string */
  private cleanJson(content: string): string {
    return content
      .replace(/```(?:json)?\s*/gi, "")
      .replace(/\s*```/g, "")
      .trim();
  }
}
