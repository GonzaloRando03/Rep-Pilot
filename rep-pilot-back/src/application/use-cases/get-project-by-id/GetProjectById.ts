import { GetProjectByIdUseCase } from "../../ports/in/GetProjectByIdUseCase";
import { ProjectDTO } from "../../dto/ProjectDTO";
import { ProjectRepository } from "../../ports/out/ProjectRepository";
import { UserRepository } from "../../ports/out/UserRepository";
import { NotFoundError } from "../../../domain/errors/NotFoundError";
import { toProjectDTO } from "../../mappers/toProjectDTO";

export class GetProjectById implements GetProjectByIdUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(id: string): Promise<ProjectDTO> {
    const project = await this.projectRepository.findById(id);

    if (!project) {
      throw new NotFoundError(`Project with id '${id}' not found`);
    }

    const memberIds = project.members.map((m) => m.toString());
    const users = await Promise.all(
      memberIds.map((uid) => this.userRepository.findById(uid)),
    );
    const userMap = new Map<string, { username: string; name: string }>();
    for (const u of users) {
      if (u) {
        userMap.set(u.id.toString(), { username: u.username, name: u.name });
      }
    }

    return toProjectDTO(project, userMap);
  }
}
