import { Language } from "../enums/Language";
import { DomainValidationError } from "../errors/DomainValidationError";
import { UserId } from "../value-objects/UserId";

export class User {
  private constructor(
    public readonly id: UserId,
    public readonly username: string,
    public readonly name: string,
    public readonly isAdmin: boolean,
    public readonly password: string,
    public readonly language: Language,
    public readonly twoFactorSecret: string | null,
    public readonly twoFactorEnabled: boolean,
    public readonly email: string | undefined,
  ) {}

  static create(params: {
    id?: UserId;
    username: string;
    name: string;
    isAdmin?: boolean;
    password: string;
    language?: Language;
    twoFactorSecret?: string | null;
    twoFactorEnabled?: boolean;
    email?: string;
  }): User {
    const normalizedUsername = params.username?.trim();
    if (!normalizedUsername) {
      throw new DomainValidationError("User username is required");
    }

    const normalizedName = params.name?.trim();
    if (!normalizedName) {
      throw new DomainValidationError("User name is required");
    }

    if (!params.password || params.password.trim().length === 0) {
      throw new DomainValidationError("User password is required");
    }

    const normalizedEmail = params.email?.trim() || undefined;

    return new User(
      params.id ?? UserId.create(),
      normalizedUsername,
      normalizedName,
      params.isAdmin ?? false,
      params.password,
      params.language ?? Language.EN,
      params.twoFactorSecret ?? null,
      params.twoFactorEnabled ?? false,
      normalizedEmail,
    );
  }

  enableTwoFactor(secret: string): User {
    if (!secret?.trim()) {
      throw new DomainValidationError("Two-factor secret is required");
    }
    return new User(
      this.id,
      this.username,
      this.name,
      this.isAdmin,
      this.password,
      this.language,
      secret,
      true,
      this.email,
    );
  }

  disableTwoFactor(): User {
    return new User(
      this.id,
      this.username,
      this.name,
      this.isAdmin,
      this.password,
      this.language,
      null,
      false,
      this.email,
    );
  }

  withPendingTwoFactorSecret(secret: string): User {
    if (!secret?.trim()) {
      throw new DomainValidationError("Two-factor secret is required");
    }
    return new User(
      this.id,
      this.username,
      this.name,
      this.isAdmin,
      this.password,
      this.language,
      secret,
      false,
      this.email,
    );
  }

  withLanguage(newLanguage: Language): User {
    return new User(
      this.id,
      this.username,
      this.name,
      this.isAdmin,
      this.password,
      newLanguage,
      this.twoFactorSecret,
      this.twoFactorEnabled,
      this.email,
    );
  }

  withPassword(newPassword: string): User {
    if (!newPassword || newPassword.trim().length === 0) {
      throw new DomainValidationError("User password is required");
    }
    return new User(
      this.id,
      this.username,
      this.name,
      this.isAdmin,
      newPassword,
      this.language,
      this.twoFactorSecret,
      this.twoFactorEnabled,
      this.email,
    );
  }

  update(params: {
    name?: string;
    username?: string;
    isAdmin?: boolean;
    language?: Language;
    password?: string;
    email?: string;
  }): User {
    const name = params.name !== undefined ? params.name.trim() : this.name;
    if (!name) throw new DomainValidationError("User name is required");

    const username =
      params.username !== undefined ? params.username.trim() : this.username;
    if (!username) throw new DomainValidationError("User username is required");

    return new User(
      this.id,
      username,
      name,
      params.isAdmin ?? this.isAdmin,
      params.password ?? this.password,
      params.language ?? this.language,
      this.twoFactorSecret,
      this.twoFactorEnabled,
      params.email !== undefined ? params.email : this.email,
    );
  }

  promoteToAdmin(): User {
    return new User(
      this.id,
      this.username,
      this.name,
      true,
      this.password,
      this.language,
      this.twoFactorSecret,
      this.twoFactorEnabled,
      this.email,
    );
  }

  demoteFromAdmin(): User {
    return new User(
      this.id,
      this.username,
      this.name,
      false,
      this.password,
      this.language,
      this.twoFactorSecret,
      this.twoFactorEnabled,
      this.email,
    );
  }

  withEmail(newEmail: string | undefined): User {
    return new User(
      this.id,
      this.username,
      this.name,
      this.isAdmin,
      this.password,
      this.language,
      this.twoFactorSecret,
      this.twoFactorEnabled,
      newEmail,
    );
  }
}
