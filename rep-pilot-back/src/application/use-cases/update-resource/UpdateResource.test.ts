import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  mockResourceRepository,
  mockTagRepository,
  mockUserRepository,
  buildResource,
  buildTag,
  buildUser,
} from "../__test-helpers";
import { UpdateResource } from "./UpdateResource";
import { ResourceType } from "../../../domain/enums/ResourceType";

describe("UpdateResource", () => {
  let useCase: UpdateResource;
  const resourceRepo = mockResourceRepository();
  const tagRepo = mockTagRepository();
  const userRepo = mockUserRepository();

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new UpdateResource(resourceRepo, tagRepo, userRepo);
  });

  const updateInput = { name: "Updated Name", description: "New desc" };

  it("should update resource when owner requests it", async () => {
    const resource = buildResource({ createdBy: "user-1" });
    vi.mocked(resourceRepo.findById).mockResolvedValue(resource);
    vi.mocked(tagRepo.findAll).mockResolvedValue([]);
    vi.mocked(userRepo.findById).mockResolvedValue(null);

    const result = await useCase.execute(
      "resource-1",
      "user-1",
      false,
      updateInput,
    );

    expect(resourceRepo.save).toHaveBeenCalledTimes(1);
    expect(result.name).toBe("Updated Name");
  });

  it("should update when admin requests it even if not owner", async () => {
    const resource = buildResource({ createdBy: "user-2" });
    vi.mocked(resourceRepo.findById).mockResolvedValue(resource);
    vi.mocked(tagRepo.findAll).mockResolvedValue([]);
    vi.mocked(userRepo.findById).mockResolvedValue(null);

    const result = await useCase.execute(
      "resource-1",
      "user-1",
      true,
      updateInput,
    );

    expect(result.name).toBe("Updated Name");
  });

  it("should throw NotFoundError if resource does not exist", async () => {
    vi.mocked(resourceRepo.findById).mockResolvedValue(null);

    await expect(
      useCase.execute("missing", "user-1", false, updateInput),
    ).rejects.toThrow("Resource with id 'missing' not found");
  });

  it("should throw ForbiddenError if non-owner non-admin tries to update", async () => {
    const resource = buildResource({ createdBy: "owner" });
    vi.mocked(resourceRepo.findById).mockResolvedValue(resource);

    await expect(
      useCase.execute("resource-1", "intruder", false, updateInput),
    ).rejects.toThrow("You are not allowed to update this resource");
  });
});
