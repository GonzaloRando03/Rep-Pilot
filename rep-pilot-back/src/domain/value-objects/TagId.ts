import { randomUUID } from "crypto";

export class TagId {
  private constructor(private readonly value: string) {}

  static create(value?: string): TagId {
    const id = value && value.trim().length > 0 ? value : randomUUID();
    return new TagId(id);
  }

  toString(): string {
    return this.value;
  }
}
