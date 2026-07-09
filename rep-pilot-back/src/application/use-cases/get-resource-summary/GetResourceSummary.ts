import { ResourceSummaryDTO } from "../../dto/ResourceSummaryDTO";
import { GetResourceSummaryUseCase } from "../../ports/in/GetResourceSummaryUseCase";
import { ResourceRepository } from "../../ports/out/ResourceRepository";
import { ResourceType } from "../../../domain/enums/ResourceType";

export class GetResourceSummary implements GetResourceSummaryUseCase {
  constructor(private readonly repository: ResourceRepository) {}

  async execute(): Promise<ResourceSummaryDTO> {
    const stats = await this.repository.getStats();

    return {
      totalRecord: stats.total,
      totalMcp: stats.countByType[ResourceType.MCP] ?? 0,
      totalAgents: stats.countByType[ResourceType.AGENT] ?? 0,
      totalSkills: stats.countByType[ResourceType.SKILL] ?? 0,
    };
  }
}
