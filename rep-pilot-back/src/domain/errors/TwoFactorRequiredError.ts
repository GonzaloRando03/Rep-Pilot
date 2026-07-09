export class TwoFactorRequiredError extends Error {
  constructor() {
    super("Two-factor authentication code is required");
    this.name = "TwoFactorRequiredError";
  }
}
