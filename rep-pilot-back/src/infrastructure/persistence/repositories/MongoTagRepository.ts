import { TagRepository } from "../../../application/ports/out/TagRepository";
import { Tag } from "../../../domain/entities/Tag";
import { TagModel } from "../mongodb/schemas/TagSchema";
import {
  toDomainTag,
  toTagDocument,
} from "../mongodb/mappers/TagPersistenceMapper";

export class MongoTagRepository implements TagRepository {
  async save(tag: Tag): Promise<void> {
    await TagModel.findByIdAndUpdate(tag.id.toString(), toTagDocument(tag), {
      upsert: true,
      new: true,
    });
  }

  async findById(id: string): Promise<Tag | null> {
    const doc = await TagModel.findById(id);
    return doc ? toDomainTag(doc) : null;
  }

  async findByName(name: string): Promise<Tag | null> {
    const doc = await TagModel.findOne({ name });
    return doc ? toDomainTag(doc) : null;
  }

  async findAll(): Promise<Tag[]> {
    const docs = await TagModel.find();
    return docs.map(toDomainTag);
  }
}
