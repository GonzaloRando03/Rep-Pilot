import { describe, it, expect, vi } from "vitest";
import { SearchResources } from "./SearchResources";
import {
  mockResourceRepository,
  mockTagRepository,
  mockUserRepository,
  buildResource,
} from "../__test-helpers";
import { ResourceType } from "../../../domain/enums/ResourceType";

function setup() {
  const rr = mockResourceRepository();
  const tr = mockTagRepository();
  const ur = mockUserRepository();
  const useCase = new SearchResources(rr, tr, ur);
  return { useCase, rr, tr, ur };
}

describe("SearchResources", () => {
  it("should return paginated results", async () => {
    const { useCase, rr, tr, ur } = setup();
    vi.mocked(rr.findPaginated).mockResolvedValue({
      items: [buildResource()],
      total: 50,
    });
    vi.mocked(tr.findAll).mockResolvedValue([]);
    vi.mocked(ur.findAll).mockResolvedValue([]);

    const r = await useCase.execute({});
    expect(r.data).toHaveLength(1);
    expect(r.total).toBe(50);
    expect(r.page).toBe(1);
    expect(r.pageSize).toBe(20);
    expect(r.totalPages).toBe(3);
  });

  it("should clamp page and pageSize", async () => {
    const { useCase, rr, tr, ur } = setup();
    vi.mocked(rr.findPaginated).mockResolvedValue({ items: [], total: 0 });
    vi.mocked(tr.findAll).mockResolvedValue([]);
    vi.mocked(ur.findAll).mockResolvedValue([]);

    const r = await useCase.execute({ page: -5, pageSize: 200 });
    expect(r.page).toBe(1);
    expect(r.pageSize).toBe(100);
  });

  it("should pass filters to repository", async () => {
    const { useCase, rr, tr, ur } = setup();
    vi.mocked(rr.findPaginated).mockResolvedValue({ items: [], total: 0 });
    vi.mocked(tr.findAll).mockResolvedValue([]);
    vi.mocked(ur.findAll).mockResolvedValue([]);

    await useCase.execute({
      type: ResourceType.SKILL,
      search: "test",
      tags: ["t1"],
      page: 2,
      pageSize: 10,
    });
    expect(rr.findPaginated).toHaveBeenCalledWith({
      type: ResourceType.SKILL,
      search: "test",
      tags: ["t1"],
      page: 2,
      pageSize: 10,
    });
  });
});
