import { DeleteProjectUseCase } from "../../ports/in/DeleteProjectUseCase";
import { ProjectRepository } from "../../ports/out/ProjectRepository";
import { ProjectFileStorage } from "../../ports/out/ProjectFileStorage";
import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { ForbiddenError } from "../../../domain/errors/ForbiddenError";

export class DeleteProject implements DeleteProjectUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly projectFileStorage: ProjectFileStorage,
  ) {}

  async execute(id: string, userId: string, isAdmin: boolean): Promise<void> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundError(`Project with id '${id}' not found`);
    }

    const isOwner = project.createdBy.toString() === userId;
    if (!isOwner && !isAdmin) {
      throw new ForbiddenError(
        "You are not allowed to delete this project. Only the owner or an admin can delete it.",
      );
    }

    await Promise.all([
      this.projectFileStorage.deleteProjectFiles(id),
      this.projectRepository.deleteById(id),
    ]);
  }
}
