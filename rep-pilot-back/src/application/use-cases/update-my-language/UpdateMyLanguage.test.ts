import { describe, it, expect, beforeEach, vi } from "vitest";
import { UpdateMyLanguage } from "./UpdateMyLanguage";
import { mockUserRepository, buildUser } from "../__test-helpers";
import { Language } from "../../../domain/enums/Language";

describe("UpdateMyLanguage", () => {
  let useCase: UpdateMyLanguage;
  const userRepo = mockUserRepository();

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new UpdateMyLanguage(userRepo);
  });

  it("should update user language", async () => {
    const user = buildUser({ id: "user-1", language: Language.EN });
    vi.mocked(userRepo.findById).mockResolvedValue(user);

    const result = await useCase.execute("user-1", "es");

    expect(userRepo.save).toHaveBeenCalledTimes(1);
    expect(result.language).toBe("es");
  });

  it("should throw if user not found", async () => {
    vi.mocked(userRepo.findById).mockResolvedValue(null);

    await expect(useCase.execute("missing", "en")).rejects.toThrow(
      "User not found",
    );
  });

  it("should throw if invalid language", async () => {
    const user = buildUser({ id: "user-1" });
    vi.mocked(userRepo.findById).mockResolvedValue(user);

    await expect(useCase.execute("user-1", "fr")).rejects.toThrow(
      "Invalid language 'fr'",
    );
  });

  it("should accept uppercase language input", async () => {
    const user = buildUser({ id: "user-1" });
    vi.mocked(userRepo.findById).mockResolvedValue(user);

    const result = await useCase.execute("user-1", "ES");

    expect(result.language).toBe("es");
  });
});
