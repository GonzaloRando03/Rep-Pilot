export class TwoFactorSetupRequiredError extends Error {
  public readonly token: string;

  constructor(token: string) {
    super("Two-factor authentication setup is required");
    this.name = "TwoFactorSetupRequiredError";
    this.token = token;
  }
}
