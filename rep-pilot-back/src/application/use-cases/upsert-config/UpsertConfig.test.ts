import { describe, it, expect, beforeEach, vi } from "vitest";
import { UpsertConfig } from "./UpsertConfig";
import { mockConfigRepository, buildAppConfig } from "../__test-helpers";

describe("UpsertConfig", () => {
  let useCase: UpsertConfig;
  const configRepo = mockConfigRepository();

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new UpsertConfig(configRepo);
  });

  const validInput = {
    gitInstances: [
      {
        id: "git-1",
        url: "https://github.com",
        username: "user",
        token: "tok",
      },
    ],
    openaiConfig: {
      url: "https://api.openai.com",
      token: "sk-test",
      model: "gpt-4o",
    },
    ldapConfig: { url: "ldap://server", bindDn: "cn={{username}}" },
  };

  it("should create config when none exists", async () => {
    vi.mocked(configRepo.find).mockResolvedValue(null);

    const result = await useCase.execute(validInput);

    expect(configRepo.save).toHaveBeenCalledTimes(1);
    expect(result.gitInstances).toHaveLength(1);
    expect(result.openaiConfig.model).toBe("gpt-4o");
  });

  it("should update existing config", async () => {
    const existing = buildAppConfig();
    vi.mocked(configRepo.find).mockResolvedValue(existing);

    const result = await useCase.execute(validInput);

    expect(configRepo.save).toHaveBeenCalledTimes(1);
    expect(result.gitInstances).toHaveLength(1);
  });

  it("should accept partial update (only gitInstances)", async () => {
    const existing = buildAppConfig();
    vi.mocked(configRepo.find).mockResolvedValue(existing);

    const result = await useCase.execute({
      gitInstances: [
        { id: "new", url: "https://gitlab.com", username: "u", token: "t" },
      ],
    });

    expect(result.gitInstances).toHaveLength(1);
    expect(result.openaiConfig.model).toBe("gpt-4o");
  });
});
