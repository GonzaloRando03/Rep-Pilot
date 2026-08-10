import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConfirmTwoFactor } from "./ConfirmTwoFactor";
import {
  mockUserRepository,
  mockTotpPort,
  mockTokenService,
  buildUser,
} from "../__test-helpers";
import { InvalidTwoFactorCodeError } from "../../../domain/errors/InvalidTwoFactorCodeError";

describe("ConfirmTwoFactor", () => {
  const ur = mockUserRepository();
  const totp = mockTotpPort();
  const ts = mockTokenService();
  let useCase: ConfirmTwoFactor;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new ConfirmTwoFactor(ur, totp, ts);
  });

  it("should activate 2FA and return a new token when code is valid", async () => {
    const user = buildUser({
      id: "u1",
      twoFactorSecret: "JBSWY3DPEHPK3PXP",
      twoFactorEnabled: false,
    });
    vi.mocked(ur.findById).mockResolvedValue(user);
    vi.mocked(totp.verify).mockResolvedValue(true);
    vi.mocked(ts.sign).mockReturnValue("new.session.token");

    const result = await useCase.execute({ userId: "u1", totpCode: "123456" });

    expect(ur.save).toHaveBeenCalledWith(
      expect.objectContaining({ twoFactorEnabled: true }),
    );
    expect(result.token).toBe("new.session.token");
    expect(ts.sign).toHaveBeenCalledWith({
      sub: "u1",
      username: "testuser",
      isAdmin: false,
    });
  });

  it("should throw InvalidTwoFactorCodeError when code is wrong", async () => {
    const user = buildUser({
      id: "u1",
      twoFactorSecret: "JBSWY3DPEHPK3PXP",
      twoFactorEnabled: false,
    });
    vi.mocked(ur.findById).mockResolvedValue(user);
    vi.mocked(totp.verify).mockResolvedValue(false);

    await expect(
      useCase.execute({ userId: "u1", totpCode: "000000" }),
    ).rejects.toBeInstanceOf(InvalidTwoFactorCodeError);
  });

  it("should throw if user has no pending secret", async () => {
    const user = buildUser({ id: "u1", twoFactorSecret: null });
    vi.mocked(ur.findById).mockResolvedValue(user);

    await expect(
      useCase.execute({ userId: "u1", totpCode: "123456" }),
    ).rejects.toBeInstanceOf(InvalidTwoFactorCodeError);
  });

  it("should throw NotFoundError if user does not exist", async () => {
    vi.mocked(ur.findById).mockResolvedValue(null);

    await expect(
      useCase.execute({ userId: "bad", totpCode: "123456" }),
    ).rejects.toThrow("User not found");
  });
});
