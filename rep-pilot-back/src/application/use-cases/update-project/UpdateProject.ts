import { UpdateProjectUseCase } from "../../ports/in/UpdateProjectUseCase";
import { UpdateProjectDTO } from "../../dto/UpdateProjectDTO";
import { ProjectDTO } from "../../dto/ProjectDTO";
import { ProjectRepository } from "../../ports/out/ProjectRepository";
import {
  ProjectFileStorage,
  ProjectFileEntry,
} from "../../ports/out/ProjectFileStorage";
import { UserRepository } from "../../ports/out/UserRepository";
import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { ForbiddenError } from "../../../domain/errors/ForbiddenError";
import { toProjectDTO } from "../../mappers/toProjectDTO";

function buildDirectoryTree(
  files: ProjectFileEntry[],
): Record<string, unknown> {
  const tree: Record<string, unknown> = {};

  for (const file of files) {
    const segments = file.path.replace(/\\/g, "/").split("/");
    let current = tree;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      if (i === segments.length - 1) {
        current[segment] = true;
      } else {
        if (!current[segment] || typeof current[segment] === "boolean") {
          current[segment] = {};
        }
        current = current[segment] as Record<string, unknown>;
      }
    }
  }

  return tree;
}

export class UpdateProject implements UpdateProjectUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly projectFileStorage: ProjectFileStorage,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    id: string,
    userId: string,
    isAdmin: boolean,
    input: UpdateProjectDTO,
  ): Promise<ProjectDTO> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundError(`Project with id '${id}' not found`);
    }

    const isOwner = project.createdBy.toString() === userId;
    if (!isOwner && !isAdmin) {
      throw new ForbiddenError(
        "You are not allowed to update this project. Only the owner or an admin can update it.",
      );
    }

    let updated = project;

    // 1. Name
    if (input.name !== undefined) {
      updated = updated.withName(input.name);
    }

    // 2. Group (null or "" removes the group)
    if (input.group !== undefined) {
      const newGroup =
        input.group === null || input.group.trim() === ""
          ? undefined
          : input.group.trim();
      updated = updated.withGroup(newGroup);
    }

    // 3. Members
    if (input.members !== undefined) {
      updated = updated.withMembers(input.members);
    }

    // 4. Files — add/overwrite new files on disk
    if (input.files && input.files.length > 0) {
      await this.projectFileStorage.saveProjectFiles(
        id,
        updated.rootFolderName,
        input.files,
        userId,
      );
    }

    // 5. Removed files — delete from disk
    if (input.removedFiles && input.removedFiles.length > 0) {
      await this.projectFileStorage.deleteFiles(
        id,
        updated.rootFolderName,
        input.removedFiles,
      );
    }

    // 6. Rebuild directory tree from current disk files
    const allFiles = await this.projectFileStorage.getProjectFiles(id);
    const newTree = buildDirectoryTree(allFiles);
    updated = updated.withDirectoryTree(newTree);

    // 7. Persist
    await this.projectRepository.save(updated);

    // 8. Build DTO
    const allUsers = await this.userRepository.findAll();
    const userMap = new Map(
      allUsers.map((u) => [
        u.id.toString(),
        { username: u.username, name: u.name },
      ]),
    );

    return toProjectDTO(updated, userMap);
  }
}
