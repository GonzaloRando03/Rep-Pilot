import { User } from "../../../../domain/entities/User";
import { Language } from "../../../../domain/enums/Language";
import { UserId } from "../../../../domain/value-objects/UserId";
import { UserDocument } from "../schemas/UserSchema";
import { TokenEncryptor } from "../../../../application/ports/out/TokenEncryptor";

export async function toUserDocument(
  user: User,
  tokenEncryptor: TokenEncryptor,
): Promise<Record<string, unknown>> {
  return {
    _id: user.id.toString(),
    username: user.username,
    name: user.name,
    isAdmin: user.isAdmin,
    password: user.password,
    language: user.language,
    twoFactorSecret: user.twoFactorSecret
      ? await tokenEncryptor.encrypt(user.twoFactorSecret)
      : null,
    twoFactorEnabled: user.twoFactorEnabled,
  };
}

export async function toDomainUser(
  doc: UserDocument,
  tokenEncryptor: TokenEncryptor,
): Promise<User> {
  const twoFactorSecret =
    doc.twoFactorSecret
      ? await tokenEncryptor.decrypt(doc.twoFactorSecret)
      : null;

  return User.create({
    id: UserId.create(doc._id),
    username: doc.username,
    name: doc.name,
    isAdmin: doc.isAdmin,
    password: doc.password,
    language: (doc.language as Language) ?? Language.EN,
    twoFactorSecret,
    twoFactorEnabled: doc.twoFactorEnabled ?? false,
  });
}
