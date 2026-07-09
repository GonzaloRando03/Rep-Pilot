import { describe, it, expect, vi } from "vitest";
import { GetMyStarredResources } from "./GetMyStarredResources";
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
  return { useCase: new GetMyStarredResources(rr, tr, ur), rr, tr, ur };
}

describe("GetMyStarredResources", () => {
  it("should return starred resources", async () => {
    const { useCase, rr, tr, ur } = setup();
    vi.mocked(rr.findStarredByUser).mockResolvedValue([
      buildResource({ id: "r1" }),
    ]);
    vi.mocked(tr.findAll).mockResolvedValue([]);
    vi.mocked(ur.findAll).mockResolvedValue([]);
    const r = await useCase.execute("user-1");
    expect(r).toHaveLength(1);
  });

  it("should return empty when none", async () => {
    const { useCase, rr, tr, ur } = setup();
    vi.mocked(rr.findStarredByUser).mockResolvedValue([]);
    vi.mocked(tr.findAll).mockResolvedValue([]);
    vi.mocked(ur.findAll).mockResolvedValue([]);
    const r = await useCase.execute("user-1");
    expect(r).toEqual([]);
  });
});
