import { describe, it, expect, vi, beforeEach } from "vitest";
import { DisableTwoFactor } from "./DisableTwoFactor";
import { mockUserRepository, mockTotpPort, buildUser } from "../__test-helpers";
import { InvalidTwoFactorCodeError } from "../../../domain/errors/InvalidTwoFactorCodeError";

describe("DisableTwoFactor", () => {
  const ur = mockUserRepository();
  const totp = mockTotpPort();
  let useCase: DisableTwoFactor;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new DisableTwoFactor(ur, totp);
  });

  it("should disable 2FA when code is valid", async () => {
    const user = buildUser({
      id: "u1",
      twoFactorSecret: "JBSWY3DPEHPK3PXP",
      twoFactorEnabled: true,
    });
    vi.mocked(ur.findById).mockResolvedValue(user);
    vi.mocked(totp.verify).mockResolvedValue(true);

    await useCase.execute({ userId: "u1", totpCode: "123456" });

    expect(ur.save).toHaveBeenCalledWith(
      expect.objectContaining({ twoFactorEnabled: false, twoFactorSecret: null }),
    );
  });

  it("should throw InvalidTwoFactorCodeError when code is wrong", async () => {
    const user = buildUser({
      id: "u1",
      twoFactorSecret: "JBSWY3DPEHPK3PXP",
      twoFactorEnabled: true,
    });
    vi.mocked(ur.findById).mockResolvedValue(user);
    vi.mocked(totp.verify).mockResolvedValue(false);

    await expect(useCase.execute({ userId: "u1", totpCode: "000000" }))
      .rejects.toBeInstanceOf(InvalidTwoFactorCodeError);
  });

  it("should throw if 2FA is not enabled for the user", async () => {
    const user = buildUser({ id: "u1", twoFactorEnabled: false });
    vi.mocked(ur.findById).mockResolvedValue(user);

    await expect(useCase.execute({ userId: "u1", totpCode: "123456" }))
      .rejects.toBeInstanceOf(InvalidTwoFactorCodeError);
  });

  it("should throw NotFoundError if user does not exist", async () => {
    vi.mocked(ur.findById).mockResolvedValue(null);

    await expect(useCase.execute({ userId: "bad", totpCode: "123456" }))
      .rejects.toThrow("User not found");
  });
});
