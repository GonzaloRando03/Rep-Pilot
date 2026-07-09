import { describe, it, expect, vi } from "vitest";
import { CreateResource } from "./CreateResource";
import {
  mockResourceRepository,
  mockTagRepository,
  mockUserRepository,
  buildTag,
  buildUser,
} from "../__test-helpers";
import { ResourceType } from "../../../domain/enums/ResourceType";

function setup() {
  const rr = mockResourceRepository();
  const tr = mockTagRepository();
  const ur = mockUserRepository();
  return { useCase: new CreateResource(rr, tr, ur), rr, tr, ur };
}

const input = {
  name: "My Skill",
  type: ResourceType.SKILL,
  description: "Desc",
  gitUrl: "https://github.com/x/y",
  createdBy: "user-1",
};

describe("CreateResource", () => {
  it("should create a resource with DTO", async () => {
    const { useCase, tr, ur } = setup();
    vi.mocked(tr.findAll).mockResolvedValue([
      buildTag({ id: "tag-1", name: "ai" }),
    ]);
    vi.mocked(ur.findById).mockResolvedValue(
      buildUser({ id: "user-1", username: "alice" }),
    );
    const r = await useCase.execute({ ...input, tags: ["tag-1"] });
    expect(r.name).toBe("My Skill");
    expect(r.tags).toEqual([{ id: "tag-1", name: "ai" }]);
    expect(r.createdBy.username).toBe("alice");
  });

  it("should handle empty tags and unknown creator", async () => {
    const { useCase, tr, ur } = setup();
    vi.mocked(tr.findAll).mockResolvedValue([]);
    vi.mocked(ur.findById).mockResolvedValue(null);
    const r = await useCase.execute(input);
    expect(r.tags).toEqual([]);
    expect(r.createdBy.username).toBe("user-1");
  });

  it("should throw if name is empty", async () => {
    const { useCase } = setup();
    await expect(useCase.execute({ ...input, name: "" })).rejects.toThrow(
      "Resource name is required",
    );
  });
});
