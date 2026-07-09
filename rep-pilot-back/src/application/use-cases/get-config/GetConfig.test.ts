import { describe, it, expect, beforeEach, vi } from "vitest";
import { GetConfig } from "./GetConfig";
import { mockConfigRepository, buildAppConfig } from "../__test-helpers";

describe("GetConfig", () => {
  let useCase: GetConfig;
  const configRepo = mockConfigRepository();

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new GetConfig(configRepo);
  });

  it("should return config DTO when config exists", async () => {
    const config = buildAppConfig();
    vi.mocked(configRepo.find).mockResolvedValue(config);

    const result = await useCase.execute();

    expect(result).not.toBeNull();
    expect(result!.openaiConfig.model).toBe("gpt-4o");
    expect(result!.gitInstances).toEqual([]);
  });

  it("should return null when no config exists", async () => {
    vi.mocked(configRepo.find).mockResolvedValue(null);

    const result = await useCase.execute();

    expect(result).toBeNull();
  });
});
