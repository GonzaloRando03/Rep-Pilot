import { CreateTagUseCase } from "../../ports/in/CreateTagUseCase";
import { CreateTagDTO, TagDTO } from "../../dto/TagDTO";
import { TagRepository } from "../../ports/out/TagRepository";
import { Tag } from "../../../domain/entities/Tag";
import { ConflictError } from "../../../domain/errors/ConflictError";
import { toTagDTO } from "../../mappers/toTagDTO";

export class CreateTag implements CreateTagUseCase {
  constructor(private readonly repository: TagRepository) {}

  async execute(input: CreateTagDTO): Promise<TagDTO> {
    const existing = await this.repository.findByName(input.name.trim());
    if (existing) {
      throw new ConflictError(
        `Tag with name '${input.name.trim()}' already exists`,
      );
    }

    const tag = Tag.create({ name: input.name });
    await this.repository.save(tag);
    return toTagDTO(tag);
  }
}
