import { describe, it, expect, vi } from "vitest";
import { GetResourceById } from "./GetResourceById";
import {
  mockResourceRepository,
  mockTagRepository,
  mockUserRepository,
  mockConfigRepository,
  mockGitProvider,
  buildResource,
  buildTag,
  buildUser,
  buildAppConfig,
} from "../__test-helpers";
import { ResourceType } from "../../../domain/enums/ResourceType";

function setup() {
  const rr = mockResourceRepository();
  const tr = mockTagRepository();
  const ur = mockUserRepository();
  const cr = mockConfigRepository();
  const gp = mockGitProvider();
  const gf = { getProvider: vi.fn().mockReturnValue(gp) };
  const fs = {
    saveFiles: vi.fn(),
    getFiles: vi.fn().mockResolvedValue([]),
    deleteFiles: vi.fn(),
  };
  const useCase = new GetResourceById(rr, tr, ur, cr, gf, fs);
  return { useCase, rr, tr, ur, cr, gp, gf, fs };
}

describe("GetResourceById", () => {
  it("should return detail with docMD and owner", async () => {
    const { useCase, rr, tr, ur, cr, gp } = setup();
    vi.mocked(rr.findById).mockResolvedValue(
      buildResource({ id: "r1", name: "My Skill", type: ResourceType.SKILL }),
    );
    vi.mocked(tr.findAll).mockResolvedValue([
      buildTag({ id: "t1", name: "ai" }),
    ]);
    vi.mocked(ur.findAll).mockResolvedValue([
      buildUser({ id: "u1", username: "alice" }),
    ]);
    vi.mocked(cr.find).mockResolvedValue(buildAppConfig());
    vi.mocked(gp.getFileContent).mockResolvedValue("# Doc");

    const r = await useCase.execute("r1");
    expect(r.name).toBe("My Skill");
    expect(r.docMD).toBe("# Doc");
    expect(r.owner).toBe("test-owner");
    expect(r.provider).toBe("github");
  });

  it("should throw NotFoundError if missing", async () => {
    const { useCase, rr, tr, ur, cr } = setup();
    vi.mocked(rr.findById).mockResolvedValue(null);
    vi.mocked(tr.findAll).mockResolvedValue([]);
    vi.mocked(ur.findAll).mockResolvedValue([]);
    vi.mocked(cr.find).mockResolvedValue(null);

    await expect(useCase.execute("missing")).rejects.toThrow(
      "Resource with id 'missing' not found",
    );
  });

  it("should return docMD=null for MCP when no README", async () => {
    const { useCase, rr, tr, ur, cr, gp } = setup();
    vi.mocked(rr.findById).mockResolvedValue(
      buildResource({ id: "r1", type: ResourceType.MCP, path: "" }),
    );
    vi.mocked(tr.findAll).mockResolvedValue([]);
    vi.mocked(ur.findAll).mockResolvedValue([]);
    vi.mocked(cr.find).mockResolvedValue(null);
    vi.mocked(gp.getFileContent).mockResolvedValue(null);

    const r = await useCase.execute("r1");
    expect(r.docMD).toBeNull();
  });
});
