import { randomUUID } from "crypto";

export class ProjectId {
  private constructor(private readonly value: string) {}

  static create(value?: string): ProjectId {
    const id = value && value.trim().length > 0 ? value : randomUUID();
    return new ProjectId(id);
  }

  toString(): string {
    return this.value;
  }
}
