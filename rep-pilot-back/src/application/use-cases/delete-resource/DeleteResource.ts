import { DeleteResourceUseCase } from "../../ports/in/DeleteResourceUseCase";
import { ResourceRepository } from "../../ports/out/ResourceRepository";
import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { ForbiddenError } from "../../../domain/errors/ForbiddenError";

export class DeleteResource implements DeleteResourceUseCase {
  constructor(private readonly repository: ResourceRepository) {}

  async execute(id: string, userId: string, isAdmin: boolean): Promise<void> {
    const resource = await this.repository.findById(id);
    if (!resource) {
      throw new NotFoundError(`Resource with id '${id}' not found`);
    }

    const isOwner = resource.createdBy === userId;
    if (!isOwner && !isAdmin) {
      throw new ForbiddenError(
        "You are not allowed to delete this resource. Only the owner or an admin can delete it.",
      );
    }

    await this.repository.deleteById(id);
  }
}
