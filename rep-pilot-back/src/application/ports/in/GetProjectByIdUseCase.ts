import { ProjectDTO } from "../../dto/ProjectDTO";

export interface GetProjectByIdUseCase {
  execute(id: string): Promise<ProjectDTO>;
}
