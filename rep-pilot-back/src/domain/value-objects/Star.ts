import { DomainValidationError } from "../errors/DomainValidationError";

export class Star {
  private constructor(public readonly user: string) {}

  static create(userId: string): Star {
    if (!userId || userId.trim().length === 0) {
      throw new DomainValidationError("Star userId is required");
    }
    return new Star(userId.trim());
  }
}
