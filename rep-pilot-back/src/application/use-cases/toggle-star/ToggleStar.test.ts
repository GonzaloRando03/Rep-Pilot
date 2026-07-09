import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  mockResourceRepository,
  mockTagRepository,
  mockUserRepository,
  buildResource,
  buildTag,
  buildUser,
} from "../__test-helpers";
import { ToggleStar } from "./ToggleStar";
import { ResourceType } from "../../../domain/enums/ResourceType";

describe("ToggleStar", () => {
  let useCase: ToggleStar;
  const resourceRepo = mockResourceRepository();
  const tagRepo = mockTagRepository();
  const userRepo = mockUserRepository();

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new ToggleStar(resourceRepo, tagRepo, userRepo);
  });

  it("should add star when user has not starred", async () => {
    const resource = buildResource({ stars: [] });
    vi.mocked(resourceRepo.findById).mockResolvedValue(resource);
    vi.mocked(tagRepo.findAll).mockResolvedValue([]);
    vi.mocked(userRepo.findAll).mockResolvedValue([]);

    const result = await useCase.execute("resource-1", "user-1");

    expect(resourceRepo.save).toHaveBeenCalledTimes(1);
    const savedResource = vi.mocked(resourceRepo.save).mock.calls[0][0];
    expect(savedResource.hasStarFrom("user-1")).toBe(true);
  });

  it("should remove star when user has already starred", async () => {
    const resource = buildResource({ stars: [] }).addStar("user-1");
    vi.mocked(resourceRepo.findById).mockResolvedValue(resource);
    vi.mocked(tagRepo.findAll).mockResolvedValue([]);
    vi.mocked(userRepo.findAll).mockResolvedValue([]);

    const result = await useCase.execute("resource-1", "user-1");

    const savedResource = vi.mocked(resourceRepo.save).mock.calls[0][0];
    expect(savedResource.hasStarFrom("user-1")).toBe(false);
  });

  it("should throw NotFoundError if resource does not exist", async () => {
    vi.mocked(resourceRepo.findById).mockResolvedValue(null);

    await expect(useCase.execute("missing", "user-1")).rejects.toThrow(
      "Resource with id 'missing' not found",
    );
  });
});
