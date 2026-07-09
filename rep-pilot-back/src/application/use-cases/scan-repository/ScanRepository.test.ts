import { describe, it, expect, vi } from "vitest";
import { ScanRepository } from "../scan-repository/ScanRepository";
import {
  mockResourceRepository,
  mockConfigRepository,
  mockGitProvider,
} from "../__test-helpers";
import { ResourceType } from "../../../domain/enums/ResourceType";

function setup() {
  const rr = mockResourceRepository();
  const cr = mockConfigRepository();
  const gp = mockGitProvider();
  const gf = { getProvider: vi.fn().mockReturnValue(gp) };
  const useCase = new ScanRepository(gf, cr, rr);
  return { useCase, rr, cr, gp, gf };
}

const repo = "https://github.com/test/repo";

describe("ScanRepository", () => {
  it("should discover skills, instructions, agents", async () => {
    const { useCase, rr, cr, gp } = setup();
    vi.mocked(gp.listFiles).mockResolvedValue([
      {
        path: "skills/my-skill/SKILL.md",
        name: "SKILL.md",
        type: "file",
        gitUrl: repo,
      },
      {
        path: "instructions/setup.instructions.md",
        name: "setup.instructions.md",
        type: "file",
        gitUrl: repo,
      },
      {
        path: "agents/coder.agent.md",
        name: "coder.agent.md",
        type: "file",
        gitUrl: repo,
      },
    ]);
    vi.mocked(rr.findByGitUrl).mockResolvedValue([]);
    vi.mocked(cr.find).mockResolvedValue(null);

    const r = await useCase.execute({ url: repo });
    expect(r.skills).toHaveLength(1);
    expect(r.skills[0].name).toBe("my-skill");
    expect(r.instructions).toHaveLength(1);
    expect(r.instructions[0].name).toBe("setup");
    expect(r.agents).toHaveLength(1);
    expect(r.agents[0].name).toBe("coder");
  });

  it("should match by file name in flat structure", async () => {
    const { useCase, rr, cr, gp } = setup();
    vi.mocked(gp.listFiles).mockResolvedValue([
      { path: "SKILL.md", name: "SKILL.md", type: "file", gitUrl: repo },
      { path: "my.agent.md", name: "my.agent.md", type: "file", gitUrl: repo },
    ]);
    vi.mocked(rr.findByGitUrl).mockResolvedValue([]);
    vi.mocked(cr.find).mockResolvedValue(null);

    const r = await useCase.execute({ url: repo });
    expect(r.skills).toHaveLength(1);
    expect(r.agents).toHaveLength(1);
  });

  it("should skip already registered paths", async () => {
    const { useCase, rr, cr, gp } = setup();
    vi.mocked(gp.listFiles).mockResolvedValue([
      {
        path: "skills/my-skill/SKILL.md",
        name: "SKILL.md",
        type: "file",
        gitUrl: repo,
      },
    ]);
    vi.mocked(rr.findByGitUrl).mockResolvedValue([
      { path: "skills/my-skill/SKILL.md" } as any,
    ]);
    vi.mocked(cr.find).mockResolvedValue(null);

    const r = await useCase.execute({ url: repo });
    expect(r.skills).toHaveLength(0);
  });

  it("should skip directories", async () => {
    const { useCase, rr, cr, gp } = setup();
    vi.mocked(gp.listFiles).mockResolvedValue([
      { path: "skills", name: "skills", type: "dir", gitUrl: repo },
      {
        path: "skills/test/SKILL.md",
        name: "SKILL.md",
        type: "file",
        gitUrl: repo,
      },
    ]);
    vi.mocked(rr.findByGitUrl).mockResolvedValue([]);
    vi.mocked(cr.find).mockResolvedValue(null);

    const r = await useCase.execute({ url: repo });
    expect(r.skills).toHaveLength(1);
  });

  it("should return empty when nothing matches", async () => {
    const { useCase, rr, cr, gp } = setup();
    vi.mocked(gp.listFiles).mockResolvedValue([
      { path: "src/index.ts", name: "index.ts", type: "file", gitUrl: repo },
    ]);
    vi.mocked(rr.findByGitUrl).mockResolvedValue([]);
    vi.mocked(cr.find).mockResolvedValue(null);

    const r = await useCase.execute({ url: repo });
    expect(r.skills).toEqual([]);
    expect(r.instructions).toEqual([]);
    expect(r.agents).toEqual([]);
  });

  it("should detect .md files inside rules/ as instructions", async () => {
    const { useCase, rr, cr, gp } = setup();
    vi.mocked(gp.listFiles).mockResolvedValue([
      {
        path: "rules/my-rule.md",
        name: "my-rule.md",
        type: "file",
        gitUrl: repo,
      },
      {
        path: "rules/nested/deep.md",
        name: "deep.md",
        type: "file",
        gitUrl: repo,
      },
    ]);
    vi.mocked(rr.findByGitUrl).mockResolvedValue([]);
    vi.mocked(cr.find).mockResolvedValue(null);

    const r = await useCase.execute({ url: repo });
    expect(r.instructions).toHaveLength(2);
    expect(r.instructions[0].name).toBe("my-rule");
    expect(r.instructions[1].name).toBe("deep");
  });

  it("should not detect non-md files inside rules/", async () => {
    const { useCase, rr, cr, gp } = setup();
    vi.mocked(gp.listFiles).mockResolvedValue([
      {
        path: "rules/config.json",
        name: "config.json",
        type: "file",
        gitUrl: repo,
      },
    ]);
    vi.mocked(rr.findByGitUrl).mockResolvedValue([]);
    vi.mocked(cr.find).mockResolvedValue(null);

    const r = await useCase.execute({ url: repo });
    expect(r.instructions).toEqual([]);
  });

  it("should detect SKILL.md inside agents/ as skill, not agent", async () => {
    const { useCase, rr, cr, gp } = setup();
    vi.mocked(gp.listFiles).mockResolvedValue([
      {
        path: "agents/SKILL.md",
        name: "SKILL.md",
        type: "file",
        gitUrl: repo,
      },
      {
        path: "agents/coder.agent.md",
        name: "coder.agent.md",
        type: "file",
        gitUrl: repo,
      },
    ]);
    vi.mocked(rr.findByGitUrl).mockResolvedValue([]);
    vi.mocked(cr.find).mockResolvedValue(null);

    const r = await useCase.execute({ url: repo });
    expect(r.skills).toHaveLength(1);
    expect(r.skills[0].name).toBe("agents"); // parent folder of SKILL.md
    expect(r.agents).toHaveLength(1);
    expect(r.agents[0].name).toBe("coder");
  });
});
