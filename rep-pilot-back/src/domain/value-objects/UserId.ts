import { randomUUID } from "crypto";

export class UserId {
  private constructor(private readonly value: string) {}

  static create(value?: string): UserId {
    const id = value && value.trim().length > 0 ? value : randomUUID();
    return new UserId(id);
  }

  toString(): string {
    return this.value;
  }
}
