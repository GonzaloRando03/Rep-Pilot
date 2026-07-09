import { CreateTagDTO, TagDTO } from "../../dto/TagDTO";

export interface CreateTagUseCase {
  execute(input: CreateTagDTO): Promise<TagDTO>;
}
