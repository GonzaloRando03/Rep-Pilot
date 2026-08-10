import { describe, it, expect, vi } from "vitest";
import { CreateUser } from "./CreateUser";
import {
  mockUserRepository,
  mockPasswordHasher,
  buildUser,
} from "../__test-helpers";
import { Language } from "../../../domain/enums/Language";

function setup() {
  const userRepo = mockUserRepository();
  const ph = mockPasswordHasher();
  return {
    useCase: new CreateUser(userRepo, ph, Language.EN),
    userRepo,
    ph,
  };
}

const input = { username: "alice", name: "Alice", password: "s3cret" };

describe("CreateUser", () => {
  it("should create a user", async () => {
    const { useCase, userRepo, ph } = setup();
    vi.mocked(userRepo.findByUsername).mockResolvedValue(null);
    vi.mocked(ph.hash).mockResolvedValue("hashed");
    const r = await useCase.execute(input);
    expect(r.username).toBe("alice");
    expect(r.isAdmin).toBe(false);
    expect(r.language).toBe("en");
  });

  it("should create an admin", async () => {
    const { useCase, userRepo, ph } = setup();
    vi.mocked(userRepo.findByUsername).mockResolvedValue(null);
    vi.mocked(ph.hash).mockResolvedValue("hashed");
    const r = await useCase.execute({ ...input, isAdmin: true });
    expect(r.isAdmin).toBe(true);
  });

  it("should accept language=es", async () => {
    const { useCase, userRepo, ph } = setup();
    vi.mocked(userRepo.findByUsername).mockResolvedValue(null);
    vi.mocked(ph.hash).mockResolvedValue("hashed");
    const r = await useCase.execute({ ...input, language: "es" });
    expect(r.language).toBe("es");
  });

  it("should throw if username taken", async () => {
    const { useCase, userRepo } = setup();
    vi.mocked(userRepo.findByUsername).mockResolvedValue(
      buildUser({ username: "alice" }),
    );
    await expect(useCase.execute(input)).rejects.toThrow(
      "Username 'alice' is already taken",
    );
  });

  it("should throw if invalid language", async () => {
    const { useCase, userRepo } = setup();
    vi.mocked(userRepo.findByUsername).mockResolvedValue(null);
    await expect(useCase.execute({ ...input, language: "fr" })).rejects.toThrow(
      "Invalid language 'fr'",
    );
  });

  it("should use default language when none provided", async () => {
    const { useCase, userRepo, ph } = setup();
    vi.mocked(userRepo.findByUsername).mockResolvedValue(null);
    vi.mocked(ph.hash).mockResolvedValue("hashed");
    const r = await useCase.execute(input);
    expect(r.language).toBe("en");
  });

  it("should always create user with twoFactorEnabled=false regardless of global config", async () => {
    const { useCase, userRepo, ph } = setup();
    vi.mocked(userRepo.findByUsername).mockResolvedValue(null);
    vi.mocked(ph.hash).mockResolvedValue("hashed");
    const r = await useCase.execute(input);
    expect(r.twoFactorEnabled).toBe(false);
  });
});
