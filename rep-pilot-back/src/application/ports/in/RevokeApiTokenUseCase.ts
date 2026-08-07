export interface RevokeApiTokenUseCase {
  execute(input: { userId: string; tokenId: string }): Promise<void>;
}
