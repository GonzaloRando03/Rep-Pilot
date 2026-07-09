export class InvalidTwoFactorCodeError extends Error {
  constructor() {
    super("Invalid two-factor authentication code");
    this.name = "InvalidTwoFactorCodeError";
  }
}
