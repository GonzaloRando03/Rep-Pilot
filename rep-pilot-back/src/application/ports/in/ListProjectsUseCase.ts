import { ProjectDTO } from "../../dto/ProjectDTO";

export interface ListProjectsUseCase {
  execute(input: {
    userId: string;
    isAdmin: boolean;
    group?: string;
  }): Promise<ProjectDTO[]>;
}
