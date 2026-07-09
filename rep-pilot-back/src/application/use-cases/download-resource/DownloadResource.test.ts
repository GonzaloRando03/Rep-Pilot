import { describe, it, expect, vi } from "vitest";
import { DownloadResource } from "./DownloadResource";
import {
  mockResourceRepository,
  mockConfigRepository,
  mockGitProvider,
  buildResource,
  buildAppConfig,
} from "../__test-helpers";
import { ResourceType } from "../../../domain/enums/ResourceType";

function setup() {
  const rr = mockResourceRepository();
  const cr = mockConfigRepository();
  const gp = mockGitProvider();
  const gf = { getProvider: vi.fn().mockReturnValue(gp) };
  const useCase = new DownloadResource(rr, cr, gf);
  return { useCase, rr, cr, gp, gf };
}

describe("DownloadResource", () => {
  it("should throw NotFoundError if missing", async () => {
    const { useCase, rr } = setup();
    vi.mocked(rr.findById).mockResolvedValue(null);
    await expect(useCase.execute("missing")).rejects.toThrow(
      "Resource with id 'missing' not found",
    );
  });

  it("should return ZIP buffer for MCP resource", async () => {
    const { useCase, rr, cr, gp } = setup();
    const res = buildResource({
      id: "r1",
      type: ResourceType.MCP,
      gitUrl: "https://github.com/x/y",
    });
    vi.mocked(rr.findById).mockResolvedValue(res);
    vi.mocked(cr.find).mockResolvedValue(null);
    vi.mocked(gp.listFiles).mockResolvedValue([
      {
        path: "README.md",
        name: "README.md",
        type: "file",
        gitUrl: res.gitUrl,
      },
      {
        path: "src/index.ts",
        name: "index.ts",
        type: "file",
        gitUrl: res.gitUrl,
      },
    ]);
    vi.mocked(gp.getFileContentBuffer)
      .mockResolvedValueOnce(Buffer.from("readme"))
      .mockResolvedValueOnce(Buffer.from("code"));

    const r = await useCase.execute("r1");
    expect(r.buffer).toBeInstanceOf(Buffer);
    expect(r.buffer.length).toBeGreaterThan(22);
  });

  it("should resolve token from git instance", async () => {
    const { useCase, rr, cr, gp } = setup();
    const res = buildResource({
      id: "r1",
      type: ResourceType.MCP,
      gitUrl: "https://github.com/x/y",
    });
    vi.mocked(rr.findById).mockResolvedValue(res);
    vi.mocked(cr.find).mockResolvedValue(
      buildAppConfig({
        gitInstances: [
          { id: "g1", url: "https://github.com", username: "u", token: "tok" },
        ],
      }),
    );
    vi.mocked(gp.listFiles).mockResolvedValue([
      {
        path: "README.md",
        name: "README.md",
        type: "file",
        gitUrl: res.gitUrl,
      },
    ]);
    vi.mocked(gp.getFileContentBuffer).mockResolvedValue(Buffer.from("c"));

    await useCase.execute("r1");
    expect(gp.listFiles).toHaveBeenCalledWith(res.gitUrl, "tok");
  });

  it("should throw if no downloadable files", async () => {
    const { useCase, rr, cr, gp } = setup();
    vi.mocked(rr.findById).mockResolvedValue(
      buildResource({ id: "r1", type: ResourceType.MCP }),
    );
    vi.mocked(cr.find).mockResolvedValue(null);
    vi.mocked(gp.listFiles).mockResolvedValue([]);

    await expect(useCase.execute("r1")).rejects.toThrow(
      "No downloadable files found",
    );
  });
});
