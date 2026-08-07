import { UpdateProjectDTO } from "../../dto/UpdateProjectDTO";
import { ProjectDTO } from "../../dto/ProjectDTO";

export interface UpdateProjectUseCase {
  execute(
    id: string,
    userId: string,
    isAdmin: boolean,
    input: UpdateProjectDTO,
  ): Promise<ProjectDTO>;
}
