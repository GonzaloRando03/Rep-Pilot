export interface ConfirmTwoFactorUseCase {
  execute(input: { userId: string; totpCode: string }): Promise<void>;
}
