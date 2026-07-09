import { vi } from "vitest";
import type { ConfigRepository } from "../ports/out/ConfigRepository";
import type { LlmProviderPort } from "../ports/out/LlmProviderPort";
import type { PasswordHasher } from "../ports/out/PasswordHasher";
import type { ResourceRepository } from "../ports/out/ResourceRepository";
import type { TagRepository } from "../ports/out/TagRepository";
import type { TokenService } from "../ports/out/TokenService";
import type { UserRepository } from "../ports/out/UserRepository";
import type { TotpPort } from "../ports/out/TotpPort";
import type { LdapAuthPort } from "../ports/out/LdapAuthPort";
import type { GitProviderPort } from "../ports/out/GitProviderPort";
import type { CreateUserUseCase } from "../ports/in/CreateUserUseCase";
import { AppConfig as AppConfigEntity } from "../../domain/entities/AppConfig";
import { ResourceType } from "../../domain/enums/ResourceType";
import { Language } from "../../domain/enums/Language";
import { UserId } from "../../domain/value-objects/UserId";
import { ResourceId } from "../../domain/value-objects/ResourceId";
import { TagId } from "../../domain/value-objects/TagId";
import { Star } from "../../domain/value-objects/Star";
import { User } from "../../domain/entities/User";
import { Resource } from "../../domain/entities/Resource";
import { Tag } from "../../domain/entities/Tag";

// ── Mock Factories ──

export function mockConfigRepository(
  overrides: Partial<ConfigRepository> = {},
): ConfigRepository {
  return {
    save: vi.fn().mockResolvedValue(undefined),
    find: vi.fn().mockResolvedValue(null),
    ...overrides,
  };
}

export function mockLlmProvider(
  overrides: Partial<LlmProviderPort> = {},
): LlmProviderPort {
  return {
    chat: vi.fn().mockResolvedValue({
      role: "assistant" as const,
      content: "Mock LLM response",
    }),
    ...overrides,
  };
}

export function mockPasswordHasher(
  overrides: Partial<PasswordHasher> = {},
): PasswordHasher {
  return {
    hash: vi.fn().mockResolvedValue("hashed_password"),
    compare: vi.fn().mockResolvedValue(true),
    ...overrides,
  };
}

export function mockResourceRepository(
  overrides: Partial<ResourceRepository> = {},
): ResourceRepository {
  return {
    save: vi.fn().mockResolvedValue(undefined),
    findAll: vi.fn().mockResolvedValue([]),
    findById: vi.fn().mockResolvedValue(null),
    getStats: vi.fn().mockResolvedValue({
      total: 0,
      countByType: {} as Record<ResourceType, number>,
    }),
    findTopByStars: vi.fn().mockResolvedValue([]),
    findLatest: vi.fn().mockResolvedValue([]),
    findPaginated: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    findByGitUrl: vi.fn().mockResolvedValue([]),
    findStarredByUser: vi.fn().mockResolvedValue([]),
    findByTags: vi.fn().mockResolvedValue([]),
    deleteById: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

export function mockTagRepository(
  overrides: Partial<TagRepository> = {},
): TagRepository {
  return {
    save: vi.fn().mockResolvedValue(undefined),
    findById: vi.fn().mockResolvedValue(null),
    findByName: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

export function mockTokenService(
  overrides: Partial<TokenService> = {},
): TokenService {
  return {
    sign: vi.fn().mockReturnValue("mock.jwt.token"),
    ...overrides,
  };
}

export function mockUserRepository(
  overrides: Partial<UserRepository> = {},
): UserRepository {
  return {
    save: vi.fn().mockResolvedValue(undefined),
    findById: vi.fn().mockResolvedValue(null),
    findByUsername: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

export function mockTotpPort(
  overrides: Partial<TotpPort> = {},
): TotpPort {
  return {
    generateSecret: vi.fn().mockReturnValue("JBSWY3DPEHPK3PXP"),
    generateQrUri: vi.fn().mockReturnValue("otpauth://totp/TestApp:user?secret=JBSWY3DPEHPK3PXP&issuer=TestApp"),
    verify: vi.fn().mockResolvedValue(true),
    ...overrides,
  };
}

export function mockLdapAuth(
  overrides: Partial<LdapAuthPort> = {},
): LdapAuthPort {
  return {
    authenticate: vi.fn().mockResolvedValue({ success: false }),
    ...overrides,
  };
}

export function mockGitProvider(
  overrides: Partial<GitProviderPort> = {},
): GitProviderPort {
  return {
    supports: vi.fn().mockReturnValue(true),
    listFiles: vi.fn().mockResolvedValue([]),
    getRepoOwner: vi.fn().mockReturnValue({
      owner: "test-owner",
      provider: "github" as const,
    }),
    getFileContent: vi.fn().mockResolvedValue(null),
    getFileContentBuffer: vi.fn().mockResolvedValue(null),
    ...overrides,
  };
}

export function mockGitProviderFactory(getProvider = mockGitProvider()) {
  return {
    getProvider: vi.fn().mockReturnValue(getProvider),
  };
}

export function mockCreateUserUseCase(
  overrides: Partial<CreateUserUseCase> = {},
): CreateUserUseCase {
  return {
    execute: vi.fn().mockResolvedValue({
      id: "created-user-id",
      username: "newuser",
      name: "New User",
      isAdmin: false,
      language: "en",
    }),
    ...overrides,
  };
}

// ── Domain Builders ──

export function buildUser(
  overrides: Partial<{
    id: string;
    username: string;
    name: string;
    isAdmin: boolean;
    password: string;
    language: Language;
    twoFactorSecret: string | null;
    twoFactorEnabled: boolean;
  }> = {},
): User {
  return User.create({
    id: UserId.create(overrides.id ?? "user-1"),
    username: overrides.username ?? "testuser",
    name: overrides.name ?? "Test User",
    isAdmin: overrides.isAdmin ?? false,
    password: overrides.password ?? "hashed_pass",
    language: overrides.language ?? Language.EN,
    twoFactorSecret: overrides.twoFactorSecret ?? null,
    twoFactorEnabled: overrides.twoFactorEnabled ?? false,
  });
}

export function buildResource(
  overrides: Partial<{
    id: string;
    name: string;
    type: ResourceType;
    description: string;
    gitUrl: string;
    path: string;
    stars: Star[];
    tags: string[];
    createdAt: Date;
    createdBy: string;
  }> = {},
): Resource {
  return Resource.create({
    id: ResourceId.create(overrides.id ?? "resource-1"),
    name: overrides.name ?? "Test Resource",
    type: overrides.type ?? ResourceType.SKILL,
    description: overrides.description ?? "A test resource",
    gitUrl: overrides.gitUrl ?? "https://github.com/test/repo",
    path: overrides.path ?? "skills/test-skill/SKILL.md",
    stars: overrides.stars ?? [],
    tags: overrides.tags ?? ["tag-1"],
    createdAt: overrides.createdAt ?? new Date("2025-01-01"),
    createdBy: overrides.createdBy ?? "user-1",
  });
}

export function buildTag(
  overrides: Partial<{
    id: string;
    name: string;
  }> = {},
): Tag {
  return Tag.create({
    id: TagId.create(overrides.id ?? "tag-1"),
    name: overrides.name ?? "Test Tag",
  });
}

export function buildAppConfig(
  overrides: Partial<{
    gitInstances: {
      id: string;
      url: string;
      username: string;
      token: string;
    }[];
    openaiConfig: { url: string; token: string; model: string };
    ldapConfig: { url: string; bindDn: string };
    enableTwoFactor: boolean;
  }> = {},
): AppConfigEntity {
  return AppConfigEntity.create({
    gitInstances: overrides.gitInstances ?? [],
    openaiConfig: overrides.openaiConfig ?? {
      url: "https://api.openai.com",
      token: "sk-test",
      model: "gpt-4o",
    },
    ldapConfig: overrides.ldapConfig ?? { url: "", bindDn: "" },
    enableTwoFactor: overrides.enableTwoFactor ?? false,
  });
}
