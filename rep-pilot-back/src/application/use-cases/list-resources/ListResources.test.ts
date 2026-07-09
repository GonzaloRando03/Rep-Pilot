import { describe, it, expect, vi } from "vitest";
import { ListResources } from "./ListResources";
import {
  mockResourceRepository,
  mockTagRepository,
  mockUserRepository,
  buildResource,
  buildTag,
  buildUser,
} from "../__test-helpers";
import { ResourceType } from "../../../domain/enums/ResourceType";

function setup() {
  const rr = mockResourceRepository();
  const tr = mockTagRepository();
  const ur = mockUserRepository();
  return { useCase: new ListResources(rr, tr, ur), rr, tr, ur };
}

describe("ListResources", () => {
  it("should return resources with tags and users", async () => {
    const { useCase, rr, tr, ur } = setup();
    vi.mocked(rr.findAll).mockResolvedValue([
      buildResource({
        id: "r1",
        name: "S1",
        type: ResourceType.SKILL,
        tags: ["tag-1"],
        createdBy: "user-1",
      }),
    ]);
    vi.mocked(tr.findAll).mockResolvedValue([
      buildTag({ id: "tag-1", name: "ai" }),
    ]);
    vi.mocked(ur.findAll).mockResolvedValue([
      buildUser({ id: "user-1", username: "alice" }),
    ]);
    const r = await useCase.execute();
    expect(r).toHaveLength(1);
    expect(r[0].tags[0].name).toBe("ai");
  });

  it("should return empty when no resources", async () => {
    const { useCase, rr, tr, ur } = setup();
    vi.mocked(rr.findAll).mockResolvedValue([]);
    vi.mocked(tr.findAll).mockResolvedValue([]);
    vi.mocked(ur.findAll).mockResolvedValue([]);
    const r = await useCase.execute();
    expect(r).toEqual([]);
  });
});
