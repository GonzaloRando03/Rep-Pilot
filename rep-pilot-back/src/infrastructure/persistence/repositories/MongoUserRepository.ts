import { UserRepository } from "../../../application/ports/out/UserRepository";
import { User } from "../../../domain/entities/User";
import { UserModel } from "../mongodb/schemas/UserSchema";
import {
  toDomainUser,
  toUserDocument,
} from "../mongodb/mappers/UserPersistenceMapper";
import { TokenEncryptor } from "../../../application/ports/out/TokenEncryptor";

export class MongoUserRepository implements UserRepository {
  constructor(private readonly tokenEncryptor: TokenEncryptor) {}

  async save(user: User): Promise<void> {
    await UserModel.findByIdAndUpdate(
      user.id.toString(),
      await toUserDocument(user, this.tokenEncryptor),
      { upsert: true, new: true },
    );
  }

  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id);
    return doc ? toDomainUser(doc, this.tokenEncryptor) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const doc = await UserModel.findOne({ username });
    return doc ? toDomainUser(doc, this.tokenEncryptor) : null;
  }

  async findAll(): Promise<User[]> {
    const docs = await UserModel.find();
    return Promise.all(
      docs.map((doc) => toDomainUser(doc, this.tokenEncryptor)),
    );
  }

  async deleteById(id: string): Promise<void> {
    await UserModel.findByIdAndDelete(id);
  }
}
