import { Tag } from "../../../../domain/entities/Tag";
import { TagId } from "../../../../domain/value-objects/TagId";
import { TagDocument } from "../schemas/TagSchema";

export function toTagDocument(tag: Tag): Record<string, unknown> {
  return {
    _id: tag.id.toString(),
    name: tag.name,
  };
}

export function toDomainTag(doc: TagDocument): Tag {
  return Tag.create({
    id: TagId.create(doc._id),
    name: doc.name,
  });
}
