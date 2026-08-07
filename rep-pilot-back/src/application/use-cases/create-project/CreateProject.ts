import { CreateProjectUseCase } from "../../ports/in/CreateProjectUseCase";
import { CreateProjectDTO, ProjectDTO } from "../../dto/ProjectDTO";
import { ProjectRepository } from "../../ports/out/ProjectRepository";
import {
  ProjectFileStorage,
  ProjectFileEntry,
} from "../../ports/out/ProjectFileStorage";
import { UserRepository } from "../../ports/out/UserRepository";
import { Project } from "../../../domain/entities/Project";
import { UserId } from "../../../domain/value-objects/UserId";
import { NotFoundError } from "../../../domain/errors/NotFoundError";
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

export class CreateProject implements CreateProjectUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly projectFileStorage: ProjectFileStorage,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    input: CreateProjectDTO & { createdBy: string },
  ): Promise<ProjectDTO> {
    const memberIds = input.members.map((id) => UserId.create(id));
    const createdBy = UserId.create(input.createdBy);

    const memberChecks = await Promise.all(
      memberIds.map((id) => this.userRepository.findById(id.toString())),
    );
    for (let i = 0; i < memberChecks.length; i++) {
      if (!memberChecks[i]) {
        throw new NotFoundError(`User with id '${memberIds[i]}' not found`);
      }
    }

    const directoryTree = buildDirectoryTree(input.files);

    const project = Project.create({
      name: input.name,
      members: memberIds,
      rootFolderName: input.rootFolderName,
      directoryTree,
      createdBy,
      group: input.group,
    });

    await this.projectRepository.save(project);
    await this.projectFileStorage.saveProjectFiles(
      project.id.toString(),
      project.rootFolderName,
      input.files,
    );

    const allUsers = await this.userRepository.findAll();
    const userMap = new Map(
      allUsers.map((u) => [
        u.id.toString(),
        { username: u.username, name: u.name },
      ]),
    );

    return toProjectDTO(project, userMap);
  }
}
