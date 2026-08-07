import { ApiTokenRepository } from "../../../application/ports/out/ApiTokenRepository";
import { ApiToken } from "../../../domain/entities/ApiToken";
import { ApiTokenModel } from "../mongodb/schemas/ApiTokenSchema";

export class MongoApiTokenRepository implements ApiTokenRepository {
  async save(token: ApiToken): Promise<void> {
    await ApiTokenModel.findByIdAndUpdate(
      token.id,
      {
        _id: token.id,
        userId: token.userId.toString(),
        name: token.name,
        tokenHash: token.tokenHash,
        prefix: token.prefix,
        lastUsedAt: token.lastUsedAt,
        createdAt: token.createdAt,
      },
      { upsert: true, new: true },
    );
  }

  async findByUserId(userId: string): Promise<ApiToken[]> {
    const docs = await ApiTokenModel.find({ userId }).sort({ createdAt: -1 });
    return docs.map((doc) =>
      ApiToken.fromPersistence({
        id: doc._id,
        userId: doc.userId,
        name: doc.name,
        tokenHash: doc.tokenHash,
        prefix: doc.prefix,
        lastUsedAt: doc.lastUsedAt,
        createdAt: doc.createdAt,
      }),
    );
  }

  async findByTokenHash(tokenHash: string): Promise<ApiToken | null> {
    const doc = await ApiTokenModel.findOne({ tokenHash });
    if (!doc) {
      return null;
    }
    return ApiToken.fromPersistence({
      id: doc._id,
      userId: doc.userId,
      name: doc.name,
      tokenHash: doc.tokenHash,
      prefix: doc.prefix,
      lastUsedAt: doc.lastUsedAt,
      createdAt: doc.createdAt,
    });
  }

  async findById(id: string): Promise<ApiToken | null> {
    const doc = await ApiTokenModel.findById(id);
    if (!doc) {
      return null;
    }
    return ApiToken.fromPersistence({
      id: doc._id,
      userId: doc.userId,
      name: doc.name,
      tokenHash: doc.tokenHash,
      prefix: doc.prefix,
      lastUsedAt: doc.lastUsedAt,
      createdAt: doc.createdAt,
    });
  }

  async deleteById(id: string): Promise<void> {
    await ApiTokenModel.findByIdAndDelete(id);
  }
}
