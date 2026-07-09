import { LlmProviderError } from "../../../domain/errors/LlmProviderError";
import {
  ProjectSetupRequestDTO,
  ProjectSetupResponseDTO,
  LlmProjectSetupResponse,
} from "../../dto/ProjectSetupDTO";
import { ProjectSetupUseCase } from "../../ports/in/ProjectSetupUseCase";
import { ConfigRepository } from "../../ports/out/ConfigRepository";
import { LlmProviderPort } from "../../ports/out/LlmProviderPort";
import { ResourceRepository } from "../../ports/out/ResourceRepository";
import { TagRepository } from "../../ports/out/TagRepository";

export class ProjectSetup implements ProjectSetupUseCase {
  constructor(
    private readonly llmProvider: LlmProviderPort,
    private readonly configRepository: ConfigRepository,
    private readonly tagRepository: TagRepository,
    private readonly resourceRepository: ResourceRepository,
  ) {}

  async execute(
    input: ProjectSetupRequestDTO,
  ): Promise<ProjectSetupResponseDTO> {
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

    // Detectar idioma del usuario (por defecto inglés)
    const userLang = input.language || "en";

    const tags = await this.tagRepository.findAll();
    const tagNames = tags.map((t) => t.name);

    // Mapa name → id para convertir después de la selección del LLM
    const tagNameToId = new Map(tags.map((t) => [t.name, t.id.toString()]));

    // Paso 1: La IA selecciona las etiquetas relevantes según las especificaciones
    const selectedTagNames = await this.selectRelevantTags(
      tagNames,
      input.specs,
      {
        url,
        token,
        model,
      },
      userLang,
    );

    // Convertir nombres a IDs (los recursos almacenan IDs, no nombres)
    const selectedTagIds = selectedTagNames
      .map((name) => tagNameToId.get(name))
      .filter((id): id is string => id !== undefined);

    // Paso 2: Obtener recursos de las etiquetas seleccionadas (solo nombre y descripción)
    const resources =
      selectedTagIds.length > 0
        ? await this.resourceRepository.findByTags(selectedTagIds)
        : [];

    const resourceSummaries = resources.map((r) => ({
      name: r.name,
      description: r.description,
    }));

    // Paso 3: Segunda llamada a la IA con contexto enriquecido
    const systemPrompt = this.buildSystemPrompt(
      selectedTagNames,
      resourceSummaries,
      userLang,
    );
    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: input.specs },
    ];

    const response = await this.llmProvider.chat(messages, {
      url,
      token,
      model,
    });

    const parsed = this.parseResponse(response.content);

    // Append the AI tool question as the last question
    const toolQuestion = this.buildToolQuestion(userLang);
    const questions = [...parsed.questions, toolQuestion];

    return {
      mdToRender: parsed.mdToRender,
      questions,
    };
  }

  /**
   * Primera llamada a la IA: selecciona las etiquetas relevantes según las specs del usuario.
   */
  private async selectRelevantTags(
    tagNames: string[],
    specs: string,
    config: { url: string; token: string; model: string },
    userLang: string,
  ): Promise<string[]> {
    if (tagNames.length === 0) {
      return [];
    }

    const tagsList = tagNames.map((t) => `  - ${t}`).join("\n");

    // Instrucción para responder en el idioma del usuario
    const systemPrompt = `You are an expert assistant in software development technologies.
Your task is to select, from the following list of available tags, those that are RELEVANT for the project described by the user.

Available tags:
${tagsList}

Respond ONLY with a valid JSON object (no markdown or extra text) with this structure:
{
  "selectedTags": ["tag1", "tag2", ...]
}

Select only the tags that are clearly related to the described project. If no tag is relevant, return an empty array.

IMPORTANT: Answer in the same language as the user's project description. User language: ${userLang}`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: specs },
    ];

    try {
      const response = await this.llmProvider.chat(messages, config);
      const cleaned = response.content
        .replace(/```(?:json)?\s*/gi, "")
        .replace(/\s*```/g, "")
        .trim();
      const parsed = JSON.parse(cleaned) as { selectedTags: string[] };

      if (!Array.isArray(parsed.selectedTags)) {
        return [];
      }

      // Filtrar solo tags que realmente existen
      return parsed.selectedTags.filter((t) => tagNames.includes(t));
    } catch {
      // Si falla, continuamos con todos los tags (comportamiento anterior)
      return tagNames;
    }
  }

  private buildSystemPrompt(
    tagNames: string[],
    resourceSummaries: { name: string; description: string }[],
    userLang: string,
  ): string {
    const tagsList =
      tagNames.length > 0
        ? tagNames.map((t) => `  - ${t}`).join("\n")
        : "  (No tags registered yet)";

    const resourcesList =
      resourceSummaries.length > 0
        ? resourceSummaries
            .map((r) => `  - ${r.name}: ${r.description}`)
            .join("\n")
        : "  (No resources associated with the selected tags)";

    return `You are an expert assistant in software project setup.
Your goal is to analyze the specifications provided by the user about their project and help generate a personalized starter kit with agents, skills, and tools.

## Available context

### Tags (technologies, frameworks, tools) relevant for the project:
${tagsList}

### Resources in the system associated with those tags:
${resourcesList}

Use this information to ask relevant questions to the user. The listed resources are tools or components that already exist in the ecosystem; you can reference them in your questions to know if the user is interested in using them or needs something different.

## Response format

You must respond ONLY with a valid JSON object (no markdown or extra text) with the following structure:

{
  "mdToRender": "string",
  "questions": ["string", ...]
}

- mdToRender: A friendly and professional Markdown message addressed to the user.
  In this message:
  1. Acknowledge receipt of the specifications provided by the user.
  2. Briefly mention that you have reviewed the available technologies in the system.
  3. Explain that you need to ask some questions to refine the setup.
  4. Keep a close but professional tone.

- questions: An array of specific questions the AI needs to ask the user to get more context about their project.

  RULES for questions — follow these strictly:
  1. Each question MUST be directly related to at least one resource listed in "Resources in the system" above, or to a tag listed in "Tags". Do NOT ask about tools, frameworks, or services UNLESS they appear in the tags or resources provided.
  2. Ask only what is necessary to disambiguate or refine the selection of the available resources. If a resource is clearly applicable based on the user's specs, you may mention it in mdToRender and ask if they want to include it.
  3. Do NOT try to reach a fixed number of questions. Up to 10 questions maximum.

IMPORTANT: Answer in the same language as the user's project description. User language: ${userLang}`;
  }

  private parseResponse(content: string): LlmProjectSetupResponse {
    try {
      const cleaned = content
        .replace(/```(?:json)?\s*/gi, "")
        .replace(/\s*```/g, "")
        .trim();

      const parsed = JSON.parse(cleaned) as LlmProjectSetupResponse;

      if (
        typeof parsed.mdToRender !== "string" ||
        parsed.mdToRender.trim().length === 0
      ) {
        throw new Error("Missing or empty mdToRender");
      }

      if (!Array.isArray(parsed.questions)) {
        throw new Error("Missing or invalid questions array");
      }

      return {
        mdToRender: parsed.mdToRender,
        questions: parsed.questions,
      };
    } catch {
      throw new LlmProviderError(
        "Failed to parse LLM response. The provider returned an unexpected format.",
      );
    }
  }

  /** Build the AI tool selection question based on user language */
  private buildToolQuestion(userLang: string): string {
    const questions: Record<string, string> = {
      en: "Which AI coding tool will you use? (e.g., GitHub Copilot, Claude Code, OpenCode, or other)",
      es: "¿Qué herramienta de codificación AI vas a usar? (ej: GitHub Copilot, Claude Code, OpenCode, u otra)",
    };

    return questions[userLang] ?? questions["en"];
  }
}
