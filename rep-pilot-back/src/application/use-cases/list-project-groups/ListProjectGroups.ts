import { ListProjectGroupsUseCase } from "../../ports/in/ListProjectGroupsUseCase";
import { ProjectRepository } from "../../ports/out/ProjectRepository";

export class ListProjectGroups implements ListProjectGroupsUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(): Promise<string[]> {
    return this.projectRepository.findDistinctGroups();
  }
}
