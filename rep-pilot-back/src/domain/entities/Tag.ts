import { DomainValidationError } from "../errors/DomainValidationError";
import { TagId } from "../value-objects/TagId";

export class Tag {
  private constructor(
    public readonly id: TagId,
    public readonly name: string,
  ) {}

  static create(params: { id?: TagId; name: string }): Tag {
    const normalizedName = params.name?.trim();
    if (!normalizedName) {
      throw new DomainValidationError("Tag name is required");
    }

    return new Tag(params.id ?? TagId.create(), normalizedName);
  }
}
