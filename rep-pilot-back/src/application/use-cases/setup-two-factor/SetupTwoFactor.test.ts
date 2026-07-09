import { describe, it, expect, vi, beforeEach } from "vitest";
import { SetupTwoFactor } from "./SetupTwoFactor";
import { mockUserRepository, mockTotpPort, buildUser } from "../__test-helpers";

describe("SetupTwoFactor", () => {
  const ur = mockUserRepository();
  const totp = mockTotpPort();
  let useCase: SetupTwoFactor;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new SetupTwoFactor(ur, totp);
  });

  it("should generate a secret, save it, and return QR URI", async () => {
    const user = buildUser({ id: "u1", username: "alice" });
    vi.mocked(ur.findById).mockResolvedValue(user);

    const result = await useCase.execute("u1");

    expect(totp.generateSecret).toHaveBeenCalled();
    expect(ur.save).toHaveBeenCalledWith(
      expect.objectContaining({ twoFactorSecret: "JBSWY3DPEHPK3PXP", twoFactorEnabled: false }),
    );
    expect(result.qrUri).toContain("otpauth://totp");
  });

  it("should throw NotFoundError if user does not exist", async () => {
    vi.mocked(ur.findById).mockResolvedValue(null);

    await expect(useCase.execute("non-existent")).rejects.toThrow("User not found");
  });
});
