import { describe, it, expect, beforeEach, vi } from "vitest";
import { GetMe } from "./GetMe";
import { mockUserRepository, buildUser } from "../__test-helpers";

describe("GetMe", () => {
  let useCase: GetMe;
  const userRepo = mockUserRepository();

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new GetMe(userRepo);
  });

  it("should return the user DTO for a valid user id", async () => {
    const user = buildUser({ id: "user-1", username: "alice" });
    vi.mocked(userRepo.findById).mockResolvedValue(user);

    const result = await useCase.execute("user-1");

    expect(result.id).toBe("user-1");
    expect(result.username).toBe("alice");
  });

  it("should throw if user not found", async () => {
    vi.mocked(userRepo.findById).mockResolvedValue(null);

    await expect(useCase.execute("missing")).rejects.toThrow("User not found");
  });

  it("should call findById with the correct id", async () => {
    const user = buildUser({ id: "abc" });
    vi.mocked(userRepo.findById).mockResolvedValue(user);

    await useCase.execute("abc");

    expect(userRepo.findById).toHaveBeenCalledWith("abc");
  });
});
