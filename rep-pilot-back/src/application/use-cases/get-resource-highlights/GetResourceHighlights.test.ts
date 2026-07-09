import { describe, it, expect, vi } from "vitest";
import { GetResourceHighlights } from "./GetResourceHighlights";
import {
  mockResourceRepository,
  mockTagRepository,
  mockUserRepository,
  buildResource,
} from "../__test-helpers";

function setup() {
  const rr = mockResourceRepository();
  const tr = mockTagRepository();
  const ur = mockUserRepository();
  return { useCase: new GetResourceHighlights(rr, tr, ur), rr, tr, ur };
}

describe("GetResourceHighlights", () => {
  it("should return top and latest", async () => {
    const { useCase, rr, tr, ur } = setup();
    vi.mocked(rr.findTopByStars).mockResolvedValue([
      buildResource({ id: "r1", name: "Best" }),
    ]);
    vi.mocked(rr.findLatest).mockResolvedValue([
      buildResource({ id: "r2", name: "Latest" }),
    ]);
    vi.mocked(tr.findAll).mockResolvedValue([]);
    vi.mocked(ur.findAll).mockResolvedValue([]);
    const r = await useCase.execute();
    expect(r.bestResources).toHaveLength(1);
    expect(r.lastResources).toHaveLength(1);
  });

  it("should handle empty", async () => {
    const { useCase, rr, tr, ur } = setup();
    vi.mocked(rr.findTopByStars).mockResolvedValue([]);
    vi.mocked(rr.findLatest).mockResolvedValue([]);
    vi.mocked(tr.findAll).mockResolvedValue([]);
    vi.mocked(ur.findAll).mockResolvedValue([]);
    const r = await useCase.execute();
    expect(r.bestResources).toEqual([]);
    expect(r.lastResources).toEqual([]);
  });
});
