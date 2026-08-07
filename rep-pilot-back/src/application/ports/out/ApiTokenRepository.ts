import { ApiToken } from "../../../domain/entities/ApiToken";

export interface ApiTokenRepository {
  save(token: ApiToken): Promise<void>;
  findByUserId(userId: string): Promise<ApiToken[]>;
  findByTokenHash(tokenHash: string): Promise<ApiToken | null>;
  findById(id: string): Promise<ApiToken | null>;
  deleteById(id: string): Promise<void>;
}
