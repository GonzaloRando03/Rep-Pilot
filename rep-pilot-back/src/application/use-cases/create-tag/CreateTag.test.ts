import { describe, it, expect, vi } from "vitest";
import { CreateTag } from "./CreateTag";
import { mockTagRepository, buildTag } from "../__test-helpers";

function setup() {
  const tagRepo = mockTagRepository();
  return { useCase: new CreateTag(tagRepo), tagRepo };
}

describe("CreateTag", () => {
  it("should create a tag and return its DTO", async () => {
    const { useCase, tagRepo } = setup();
    vi.mocked(tagRepo.findByName).mockResolvedValue(null);
    const result = await useCase.execute({ name: "ai" });
    expect(tagRepo.save).toHaveBeenCalledTimes(1);
    expect(result.name).toBe("ai");
  });

  it("should throw ConflictError if tag name already exists", async () => {
    const { useCase, tagRepo } = setup();
    vi.mocked(tagRepo.findByName).mockResolvedValue(buildTag({ name: "ai" }));
    await expect(useCase.execute({ name: "ai" })).rejects.toThrow(
      "Tag with name 'ai' already exists",
    );
  });

  it("should trim the tag name", async () => {
    const { useCase, tagRepo } = setup();
    vi.mocked(tagRepo.findByName).mockResolvedValue(null);
    await useCase.execute({ name: "  ai  " });
    expect(tagRepo.findByName).toHaveBeenCalledWith("ai");
  });

  it("should throw if name is empty after trim", async () => {
    const { useCase, tagRepo } = setup();
    vi.mocked(tagRepo.findByName).mockResolvedValue(null);
    await expect(useCase.execute({ name: "   " })).rejects.toThrow(
      "Tag name is required",
    );
  });
});
