import { Tag } from "../../domain/entities/Tag";
import { TagDTO } from "../dto/TagDTO";

export function toTagDTO(tag: Tag): TagDTO {
  return {
    id: tag.id.toString(),
    name: tag.name,
  };
}
