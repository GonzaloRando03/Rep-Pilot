export interface DisableTwoFactorUseCase {
  execute(input: { userId: string; totpCode: string }): Promise<void>;
}
