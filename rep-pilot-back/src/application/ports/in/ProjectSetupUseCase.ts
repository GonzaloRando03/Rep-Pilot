import { Language } from "../../../domain/enums/Language";
import { ProjectSetupResponseDTO } from "../../dto/ProjectSetupDTO";

export interface ProjectSetupUseCase {
  execute(input: {
    specs: string;
    language?: Language;
  }): Promise<ProjectSetupResponseDTO>;
}
