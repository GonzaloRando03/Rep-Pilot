import { TagDTO } from "../../dto/TagDTO";

export interface ListTagsUseCase {
  execute(): Promise<TagDTO[]>;
}
