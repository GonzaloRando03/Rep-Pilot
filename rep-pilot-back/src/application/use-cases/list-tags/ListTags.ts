import { ListTagsUseCase } from "../../ports/in/ListTagsUseCase";
import { TagDTO } from "../../dto/TagDTO";
import { TagRepository } from "../../ports/out/TagRepository";
import { toTagDTO } from "../../mappers/toTagDTO";

export class ListTags implements ListTagsUseCase {
  constructor(private readonly repository: TagRepository) {}

  async execute(): Promise<TagDTO[]> {
    const tags = await this.repository.findAll();
    return tags.map(toTagDTO);
  }
}
