import { InvalidCredentialsError } from "../../../domain/errors/InvalidCredentialsError";
import { TwoFactorRequiredError } from "../../../domain/errors/TwoFactorRequiredError";
import { TwoFactorSetupRequiredError } from "../../../domain/errors/TwoFactorSetupRequiredError";
import { InvalidTwoFactorCodeError } from "../../../domain/errors/InvalidTwoFactorCodeError";
import { AuthTokenDTO, LoginDTO } from "../../dto/AuthDTO";
import { LoginUseCase } from "../../ports/in/LoginUseCase";
import { CreateUserUseCase } from "../../ports/in/CreateUserUseCase";
import { ConfigRepository } from "../../ports/out/ConfigRepository";
import { LdapAuthPort } from "../../ports/out/LdapAuthPort";
import { PasswordHasher } from "../../ports/out/PasswordHasher";
import { TokenService } from "../../ports/out/TokenService";
import { UserRepository } from "../../ports/out/UserRepository";
import { TotpPort } from "../../ports/out/TotpPort";

const TWO_FA_SETUP_TOKEN_EXPIRY = "10m";

export class Login implements LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
    private readonly configRepository: ConfigRepository,
    private readonly ldapAuth: LdapAuthPort,
    private readonly createUser: CreateUserUseCase,
    private readonly totp: TotpPort,
  ) {}

  async execute(input: LoginDTO): Promise<AuthTokenDTO> {
    const user = await this.tryLdapLogin(input);

    if (!user) {
      return this.localLogin(input);
    }

    await this.verifyTwoFactor(user.id.toString(), input.totpCode);
    return this.issueToken(user);
  }

  private async tryLdapLogin(input: LoginDTO): Promise<{
    id: { toString(): string };
    username: string;
    isAdmin: boolean;
  } | null> {
    const config = await this.configRepository.find();
    if (!config || !config.ldapConfig.url) {
      return null;
    }

    let ldapResult: { success: boolean; displayName?: string };
    try {
      ldapResult = await this.ldapAuth.authenticate(
        config.ldapConfig.url,
        config.ldapConfig.bindDn,
        input.username,
        input.password,
      );
    } catch {
      return null;
    }

    if (!ldapResult.success) {
      return null;
    }

    const existingUser = await this.userRepository.findByUsername(
      input.username,
    );
    if (existingUser) {
      return {
        id: existingUser.id,
        username: existingUser.username,
        isAdmin: existingUser.isAdmin,
      };
    }

    const created = await this.createUser.execute({
      username: input.username,
      name: ldapResult.displayName ?? input.username,
      password: this.generateLdapPlaceholder(),
    });

    return {
      id: { toString: () => created.id },
      username: created.username,
      isAdmin: created.isAdmin,
    };
  }

  private async localLogin(input: LoginDTO): Promise<AuthTokenDTO> {
    const user = await this.userRepository.findByUsername(input.username);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await this.passwordHasher.compare(
      input.password,
      user.password,
    );
    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    await this.verifyTwoFactor(user.id.toString(), input.totpCode);

    return this.issueToken({
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
    });
  }

  private async verifyTwoFactor(
    userId: string,
    totpCode: string | undefined,
  ): Promise<void> {
    const config = await this.configRepository.find();
    if (!config?.enableTwoFactor) {
      console.log("[verifyTwoFactor] Global 2FA is disabled → skipping");
      return;
    }

    console.log(
      `[verifyTwoFactor] Global 2FA enabled. userId=${userId} hasTotpCode=${totpCode !== undefined}`,
    );

    const user = await this.userRepository.findById(userId);
    console.log(
      `[verifyTwoFactor] User found: username=${user?.username}, twoFactorEnabled=${user?.twoFactorEnabled}, hasSecret=${user?.twoFactorSecret !== null}`,
    );

    if (!user?.twoFactorEnabled || !user?.twoFactorSecret) {
      console.log(
        `[verifyTwoFactor] User needs 2FA setup (enabled=${user?.twoFactorEnabled}, hasSecret=${user?.twoFactorSecret !== null}) → throwing TwoFactorSetupRequiredError`,
      );
      const setupToken = this.tokenService.sign(
        {
          sub: userId,
          username: user?.username ?? "",
          isAdmin: user?.isAdmin ?? false,
          scope: "2fa_setup",
        },
        TWO_FA_SETUP_TOKEN_EXPIRY,
      );
      throw new TwoFactorSetupRequiredError(setupToken);
    }

    if (!totpCode) {
      console.log(
        "[verifyTwoFactor] User has 2FA fully configured but no totpCode provided → throwing TwoFactorRequiredError",
      );
      throw new TwoFactorRequiredError();
    }

    const isValid = await this.totp.verify(totpCode, user.twoFactorSecret!);
    if (!isValid) throw new InvalidTwoFactorCodeError();
  }

  private issueToken(user: {
    id: { toString(): string };
    username: string;
    isAdmin: boolean;
  }): AuthTokenDTO {
    const token = this.tokenService.sign({
      sub: user.id.toString(),
      username: user.username,
      isAdmin: user.isAdmin,
    });
    return { token };
  }

  private generateLdapPlaceholder(): string {
    return `ldap:${Date.now()}:${Math.random().toString(36).slice(2)}`;
  }
}
