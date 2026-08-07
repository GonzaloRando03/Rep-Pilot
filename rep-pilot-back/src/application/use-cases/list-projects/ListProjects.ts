import { ListProjectsUseCase } from "../../ports/in/ListProjectsUseCase";
import { ProjectDTO } from "../../dto/ProjectDTO";
import { ProjectRepository } from "../../ports/out/ProjectRepository";
import { UserRepository } from "../../ports/out/UserRepository";
import { toProjectDTO } from "../../mappers/toProjectDTO";
import { Project } from "../../../domain/entities/Project";

export class ListProjects implements ListProjectsUseCase {
  constructor(
    private readonly projectRepository: ProjectRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: {
    userId: string;
    isAdmin: boolean;
    group?: string;
  }): Promise<ProjectDTO[]> {
    let projects: Project[];

    if (input.isAdmin && input.group) {
      projects = await this.projectRepository.findByGroup(input.group);
    } else if (input.isAdmin) {
      projects = await this.projectRepository.findAll();
    } else {
      projects = await this.projectRepository.findByMember(input.userId);
      if (input.group) {
        projects = projects.filter((p) => p.group === input.group);
      }
    }

    const allUsers = await this.userRepository.findAll();
    const userMap = new Map(
      allUsers.map((u) => [
        u.id.toString(),
        { username: u.username, name: u.name },
      ]),
    );

    return projects.map((p) => toProjectDTO(p, userMap));
  }
}
