import { randomUUID } from "crypto";

export class ResourceId {
  private constructor(private readonly value: string) {}

  static create(value?: string): ResourceId {
    const id = value && value.trim().length > 0 ? value : randomUUID();
    return new ResourceId(id);
  }

  toString(): string {
    return this.value;
  }
}
