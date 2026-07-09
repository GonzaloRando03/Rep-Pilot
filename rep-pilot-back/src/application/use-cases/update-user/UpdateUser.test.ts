import { describe, it, expect, beforeEach, vi } from "vitest";
import { UpdateUser } from "./UpdateUser";
import {
  mockUserRepository,
  mockPasswordHasher,
  buildUser,
} from "../__test-helpers";
import { Language } from "../../../domain/enums/Language";

describe("UpdateUser", () => {
  let useCase: UpdateUser;
  const userRepo = mockUserRepository();
  const passwordHasher = mockPasswordHasher();

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new UpdateUser(userRepo, passwordHasher);
  });

  it("should update user fields", async () => {
    const user = buildUser({ id: "user-1", username: "alice", name: "Alice" });
    vi.mocked(userRepo.findById).mockResolvedValue(user);

    const result = await useCase.execute("user-1", {
      name: "Alice Updated",
      language: "es",
    });

    expect(result.name).toBe("Alice Updated");
    expect(result.language).toBe("es");
  });

  it("should hash password when updating password", async () => {
    const user = buildUser({ id: "user-1" });
    vi.mocked(userRepo.findById).mockResolvedValue(user);

    await useCase.execute("user-1", { password: "newpass" });

    expect(passwordHasher.hash).toHaveBeenCalledWith("newpass");
  });

  it("should throw if username is taken by another user", async () => {
    const user = buildUser({ id: "user-1", username: "alice" });
    const otherUser = buildUser({ id: "user-2", username: "bob" });
    vi.mocked(userRepo.findById).mockResolvedValue(user);
    vi.mocked(userRepo.findByUsername).mockResolvedValue(otherUser);

    await expect(
      useCase.execute("user-1", { username: "bob" }),
    ).rejects.toThrow("Username 'bob' is already taken");
  });

  it("should allow same username (no change)", async () => {
    const user = buildUser({ id: "user-1", username: "alice" });
    vi.mocked(userRepo.findById).mockResolvedValue(user);

    const result = await useCase.execute("user-1", { username: "alice" });

    expect(result.username).toBe("alice");
  });

  it("should throw if user not found", async () => {
    vi.mocked(userRepo.findById).mockResolvedValue(null);

    await expect(useCase.execute("missing", { name: "New" })).rejects.toThrow(
      "User with id 'missing' not found",
    );
  });

  it("should throw if invalid language", async () => {
    const user = buildUser({ id: "user-1" });
    vi.mocked(userRepo.findById).mockResolvedValue(user);

    await expect(useCase.execute("user-1", { language: "de" })).rejects.toThrow(
      "Invalid language 'de'",
    );
  });
});
