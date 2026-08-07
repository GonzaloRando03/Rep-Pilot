import { CreateProjectDTO, ProjectDTO } from "../../dto/ProjectDTO";

export interface CreateProjectUseCase {
  execute(input: CreateProjectDTO & { createdBy: string }): Promise<ProjectDTO>;
}
