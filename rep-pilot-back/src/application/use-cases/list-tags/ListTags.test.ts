import { describe, it, expect, vi } from "vitest";
import { ListTags } from "./ListTags";
import { mockTagRepository, buildTag } from "../__test-helpers";

function setup() {
  const tr = mockTagRepository();
  return { useCase: new ListTags(tr), tr };
}

describe("ListTags", () => {
  it("should return all tags", async () => {
    const { useCase, tr } = setup();
    vi.mocked(tr.findAll).mockResolvedValue([
      buildTag({ id: "t1", name: "ai" }),
    ]);
    const r = await useCase.execute();
    expect(r).toHaveLength(1);
    expect(r[0].name).toBe("ai");
  });

  it("should return empty when no tags", async () => {
    const { useCase, tr } = setup();
    vi.mocked(tr.findAll).mockResolvedValue([]);
    const r = await useCase.execute();
    expect(r).toEqual([]);
  });
});
