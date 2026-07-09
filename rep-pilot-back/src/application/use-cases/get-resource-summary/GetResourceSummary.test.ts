import { describe, it, expect, beforeEach, vi } from "vitest";
import { GetResourceSummary } from "./GetResourceSummary";
import { mockResourceRepository } from "../__test-helpers";
import { ResourceType } from "../../../domain/enums/ResourceType";

describe("GetResourceSummary", () => {
  let useCase: GetResourceSummary;
  const resourceRepo = mockResourceRepository();

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new GetResourceSummary(resourceRepo);
  });

  it("should return summary with stats", async () => {
    vi.mocked(resourceRepo.getStats).mockResolvedValue({
      total: 100,
      countByType: {
        [ResourceType.MCP]: 30,
        [ResourceType.AGENT]: 25,
        [ResourceType.SKILL]: 40,
        [ResourceType.INSTRUCTION]: 3,
        [ResourceType.KIT]: 2,
      },
    });

    const result = await useCase.execute();

    expect(result.totalRecord).toBe(100);
    expect(result.totalMcp).toBe(30);
    expect(result.totalAgents).toBe(25);
    expect(result.totalSkills).toBe(40);
  });

  it("should return zeros for missing types", async () => {
    vi.mocked(resourceRepo.getStats).mockResolvedValue({
      total: 0,
      countByType: {} as Record<ResourceType, number>,
    });

    const result = await useCase.execute();

    expect(result.totalRecord).toBe(0);
    expect(result.totalMcp).toBe(0);
    expect(result.totalAgents).toBe(0);
    expect(result.totalSkills).toBe(0);
  });
});
