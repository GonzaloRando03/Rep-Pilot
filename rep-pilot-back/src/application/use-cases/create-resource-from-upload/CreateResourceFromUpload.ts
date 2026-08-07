import { CreateResourceFromUploadUseCase } from "../../ports/in/CreateResourceFromUploadUseCase";
import {
  CreateResourceFromUploadDTO,
  ResourceDTO,
} from "../../dto/ResourceDTO";
import { ResourceRepository } from "../../ports/out/ResourceRepository";
import { ResourceFileStorage } from "../../ports/out/ResourceFileStorage";
import { TagRepository } from "../../ports/out/TagRepository";
import { UserRepository } from "../../ports/out/UserRepository";
import { Resource } from "../../../domain/entities/Resource";
import { toResourceDTO } from "../../mappers/toResourceDTO";

export class CreateResourceFromUpload implements CreateResourceFromUploadUseCase {
  constructor(
    private readonly repository: ResourceRepository,
    private readonly fileStorage: ResourceFileStorage,
    private readonly tagRepository: TagRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: CreateResourceFromUploadDTO): Promise<ResourceDTO> {
    const resource = Resource.create({
      name: input.name,
      type: input.type,
      description: input.description,
      path: input.path,
      tags: input.tags,
      createdBy: input.createdBy,
      hasFiles: true,
    });

    const [, , allTags, creator] = await Promise.all([
      this.repository.save(resource),
      this.fileStorage.saveFiles(resource.id.toString(), input.files),
      this.tagRepository.findAll(),
      this.userRepository.findById(input.createdBy),
    ]);

    const tagMap = new Map(allTags.map((t) => [t.id.toString(), t.name]));
    const userMap = creator
      ? new Map([
          [
            creator.id.toString(),
            { username: creator.username, name: creator.name },
          ],
        ])
      : new Map<string, { username: string; name: string }>();

    return toResourceDTO(resource, tagMap, userMap);
  }
}
