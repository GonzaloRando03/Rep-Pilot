export interface SetupTwoFactorUseCase {
  execute(userId: string): Promise<{ qrUri: string }>;
}
