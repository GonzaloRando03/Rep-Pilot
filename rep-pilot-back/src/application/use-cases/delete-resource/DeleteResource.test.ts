import { describe, it, expect, beforeEach, vi } from "vitest";
import { DeleteResource } from "./DeleteResource";
import { mockResourceRepository, buildResource } from "../__test-helpers";

describe("DeleteResource", () => {
  let useCase: DeleteResource;
  const resourceRepo = mockResourceRepository();

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new DeleteResource(resourceRepo);
  });

  it("should delete a resource when owner requests it", async () => {
    const resource = buildResource({ createdBy: "user-1" });
    vi.mocked(resourceRepo.findById).mockResolvedValue(resource);

    await expect(
      useCase.execute("resource-1", "user-1", false),
    ).resolves.toBeUndefined();
    expect(resourceRepo.deleteById).toHaveBeenCalledWith("resource-1");
  });

  it("should delete when admin requests it even if not owner", async () => {
    const resource = buildResource({ createdBy: "user-2" });
    vi.mocked(resourceRepo.findById).mockResolvedValue(resource);

    await expect(
      useCase.execute("resource-1", "user-1", true),
    ).resolves.toBeUndefined();
  });

  it("should throw NotFoundError if resource does not exist", async () => {
    vi.mocked(resourceRepo.findById).mockResolvedValue(null);

    await expect(useCase.execute("missing", "user-1", false)).rejects.toThrow(
      "Resource with id 'missing' not found",
    );
  });

  it("should throw ForbiddenError if non-owner non-admin tries to delete", async () => {
    const resource = buildResource({ createdBy: "owner" });
    vi.mocked(resourceRepo.findById).mockResolvedValue(resource);

    await expect(
      useCase.execute("resource-1", "intruder", false),
    ).rejects.toThrow("You are not allowed to delete this resource");
  });
});
