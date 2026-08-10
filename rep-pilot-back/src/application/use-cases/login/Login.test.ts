import { describe, it, expect, vi } from "vitest";
import { Login } from "./Login";
import {
  mockUserRepository,
  mockPasswordHasher,
  mockTokenService,
  mockConfigRepository,
  mockLdapAuth,
  mockCreateUserUseCase,
  mockTotpPort,
  buildUser,
  buildAppConfig,
} from "../__test-helpers";
import { TwoFactorRequiredError } from "../../../domain/errors/TwoFactorRequiredError";
import { TwoFactorSetupRequiredError } from "../../../domain/errors/TwoFactorSetupRequiredError";
import { InvalidTwoFactorCodeError } from "../../../domain/errors/InvalidTwoFactorCodeError";

function setup() {
  const ur = mockUserRepository();
  const ph = mockPasswordHasher();
  const ts = mockTokenService();
  const cr = mockConfigRepository();
  const ldap = mockLdapAuth();
  const cu = mockCreateUserUseCase();
  const totp = mockTotpPort();
  const useCase = new Login(ur, ph, ts, cr, ldap, cu, totp);
  return { useCase, ur, ph, ts, cr, ldap, cu, totp };
}

const input = { username: "alice", password: "secret" };

describe("Login", () => {
  it("should login locally when LDAP not configured", async () => {
    const { useCase, ur, ph, cr } = setup();
    vi.mocked(cr.find).mockResolvedValue(null);
    vi.mocked(ur.findByUsername).mockResolvedValue(
      buildUser({ id: "u1", username: "alice" }),
    );
    vi.mocked(ph.compare).mockResolvedValue(true);

    const r = await useCase.execute(input);
    expect(r.token).toBe("mock.jwt.token");
  });

  it("should throw if user not found in local", async () => {
    const { useCase, ur, cr } = setup();
    vi.mocked(cr.find).mockResolvedValue(null);
    vi.mocked(ur.findByUsername).mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toThrow(
      "Invalid username or password",
    );
  });

  it("should throw if password wrong in local", async () => {
    const { useCase, ur, ph, cr } = setup();
    vi.mocked(cr.find).mockResolvedValue(null);
    vi.mocked(ur.findByUsername).mockResolvedValue(
      buildUser({ id: "u1", username: "alice" }),
    );
    vi.mocked(ph.compare).mockResolvedValue(false);

    await expect(useCase.execute(input)).rejects.toThrow(
      "Invalid username or password",
    );
  });

  it("should authenticate via LDAP when configured and user exists", async () => {
    const { useCase, ur, cr, ldap } = setup();
    vi.mocked(cr.find).mockResolvedValue(
      buildAppConfig({
        ldapConfig: { url: "ldap://srv", bindDn: "cn={{username}}" },
      }),
    );
    vi.mocked(ldap.authenticate).mockResolvedValue({
      success: true,
      displayName: "Alice",
    });
    vi.mocked(ur.findByUsername).mockResolvedValue(
      buildUser({ id: "u1", username: "alice" }),
    );
    vi.mocked(ur.findById).mockResolvedValue(
      buildUser({ id: "u1", username: "alice" }),
    );

    const r = await useCase.execute(input);
    expect(r.token).toBe("mock.jwt.token");
  });

  it("should auto-provision user on LDAP success if user missing", async () => {
    const { useCase, ur, cr, ldap, cu } = setup();
    vi.mocked(cr.find).mockResolvedValue(
      buildAppConfig({
        ldapConfig: { url: "ldap://srv", bindDn: "cn={{username}}" },
      }),
    );
    vi.mocked(ldap.authenticate).mockResolvedValue({
      success: true,
      displayName: "Alice",
    });
    vi.mocked(ur.findByUsername).mockResolvedValue(null);
    vi.mocked(ur.findById).mockResolvedValue(null);

    const r = await useCase.execute(input);
    expect(cu.execute).toHaveBeenCalledWith(
      expect.objectContaining({ username: "alice" }),
    );
    expect(r.token).toBe("mock.jwt.token");
  });

  it("should fallback to local if LDAP fails", async () => {
    const { useCase, ur, ph, cr, ldap } = setup();
    vi.mocked(cr.find).mockResolvedValue(
      buildAppConfig({
        ldapConfig: { url: "ldap://srv", bindDn: "cn={{username}}" },
      }),
    );
    vi.mocked(ldap.authenticate).mockResolvedValue({ success: false });
    vi.mocked(ur.findByUsername).mockResolvedValue(
      buildUser({ id: "u1", username: "alice" }),
    );
    vi.mocked(ph.compare).mockResolvedValue(true);

    const r = await useCase.execute(input);
    expect(r.token).toBe("mock.jwt.token");
  });

  it("should fallback if LDAP throws", async () => {
    const { useCase, ur, ph, cr, ldap } = setup();
    vi.mocked(cr.find).mockResolvedValue(
      buildAppConfig({
        ldapConfig: { url: "ldap://srv", bindDn: "cn={{username}}" },
      }),
    );
    vi.mocked(ldap.authenticate).mockRejectedValue(
      new Error("Connection refused"),
    );
    vi.mocked(ur.findByUsername).mockResolvedValue(
      buildUser({ id: "u1", username: "alice" }),
    );
    vi.mocked(ph.compare).mockResolvedValue(true);

    const r = await useCase.execute(input);
    expect(r.token).toBe("mock.jwt.token");
  });

  it("should throw TwoFactorRequiredError when 2FA is enabled and no code provided", async () => {
    const { useCase, ur, ph, cr } = setup();
    vi.mocked(cr.find).mockResolvedValue(
      buildAppConfig({ enableTwoFactor: true }),
    );
    const userWith2fa = buildUser({
      id: "u1",
      username: "alice",
      twoFactorEnabled: true,
      twoFactorSecret: "JBSWY3DPEHPK3PXP",
    });
    vi.mocked(ur.findByUsername).mockResolvedValue(userWith2fa);
    vi.mocked(ur.findById).mockResolvedValue(userWith2fa);
    vi.mocked(ph.compare).mockResolvedValue(true);

    await expect(useCase.execute(input)).rejects.toBeInstanceOf(
      TwoFactorRequiredError,
    );
  });

  it("should throw TwoFactorSetupRequiredError with token when 2FA is globally enabled but user has no 2FA configured", async () => {
    const { useCase, ur, ph, cr, ts } = setup();
    vi.mocked(cr.find).mockResolvedValue(
      buildAppConfig({ enableTwoFactor: true }),
    );
    const userWithout2fa = buildUser({
      id: "u1",
      username: "alice",
      twoFactorEnabled: false,
      twoFactorSecret: null,
    });
    vi.mocked(ur.findByUsername).mockResolvedValue(userWithout2fa);
    vi.mocked(ur.findById).mockResolvedValue(userWithout2fa);
    vi.mocked(ph.compare).mockResolvedValue(true);
    vi.mocked(ts.sign).mockReturnValue("scoped.2fa-setup.token");

    let caught: TwoFactorSetupRequiredError | null = null;
    try {
      await useCase.execute(input);
    } catch (e) {
      caught = e as TwoFactorSetupRequiredError;
    }

    expect(caught).toBeInstanceOf(TwoFactorSetupRequiredError);
    expect(caught!.token).toBe("scoped.2fa-setup.token");
    expect(ts.sign).toHaveBeenCalledWith(
      expect.objectContaining({ scope: "2fa_setup" }),
      "10m",
    );
  });

  it("should throw TwoFactorSetupRequiredError when user has twoFactorEnabled=true but no secret (corrupt state)", async () => {
    const { useCase, ur, ph, cr, ts } = setup();
    vi.mocked(cr.find).mockResolvedValue(
      buildAppConfig({ enableTwoFactor: true }),
    );
    const corruptUser = buildUser({
      id: "u1",
      username: "alice",
      twoFactorEnabled: true,
      twoFactorSecret: null,
    });
    vi.mocked(ur.findByUsername).mockResolvedValue(corruptUser);
    vi.mocked(ur.findById).mockResolvedValue(corruptUser);
    vi.mocked(ph.compare).mockResolvedValue(true);
    vi.mocked(ts.sign).mockReturnValue("scoped.2fa-setup.token");

    let caught: TwoFactorSetupRequiredError | null = null;
    try {
      await useCase.execute(input);
    } catch (e) {
      caught = e as TwoFactorSetupRequiredError;
    }

    expect(caught).toBeInstanceOf(TwoFactorSetupRequiredError);
    expect(caught!.token).toBe("scoped.2fa-setup.token");
    expect(ts.sign).toHaveBeenCalledWith(
      expect.objectContaining({ scope: "2fa_setup" }),
      "10m",
    );
  });

  it("should throw InvalidTwoFactorCodeError when code is wrong", async () => {
    const { useCase, ur, ph, cr, totp } = setup();
    vi.mocked(cr.find).mockResolvedValue(
      buildAppConfig({ enableTwoFactor: true }),
    );
    const userWith2fa = buildUser({
      id: "u1",
      username: "alice",
      twoFactorEnabled: true,
      twoFactorSecret: "JBSWY3DPEHPK3PXP",
    });
    vi.mocked(ur.findByUsername).mockResolvedValue(userWith2fa);
    vi.mocked(ur.findById).mockResolvedValue(userWith2fa);
    vi.mocked(ph.compare).mockResolvedValue(true);
    vi.mocked(totp.verify).mockResolvedValue(false);

    await expect(
      useCase.execute({ ...input, totpCode: "000000" }),
    ).rejects.toBeInstanceOf(InvalidTwoFactorCodeError);
  });

  it("should login successfully when 2FA code is correct", async () => {
    const { useCase, ur, ph, cr, totp } = setup();
    vi.mocked(cr.find).mockResolvedValue(
      buildAppConfig({ enableTwoFactor: true }),
    );
    const userWith2fa = buildUser({
      id: "u1",
      username: "alice",
      twoFactorEnabled: true,
      twoFactorSecret: "JBSWY3DPEHPK3PXP",
    });
    vi.mocked(ur.findByUsername).mockResolvedValue(userWith2fa);
    vi.mocked(ur.findById).mockResolvedValue(userWith2fa);
    vi.mocked(ph.compare).mockResolvedValue(true);
    vi.mocked(totp.verify).mockResolvedValue(true);

    const r = await useCase.execute({ ...input, totpCode: "123456" });
    expect(r.token).toBe("mock.jwt.token");
  });
});
