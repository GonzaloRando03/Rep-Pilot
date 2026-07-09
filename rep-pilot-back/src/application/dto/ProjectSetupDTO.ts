import { Language } from "../../domain/enums/Language";

export interface ProjectSetupRequestDTO {
  specs: string;
  language?: Language;
}

export interface ProjectSetupResponseDTO {
  mdToRender: string;
  questions: string[];
}

/** Internal shape expected from the LLM response */
export interface LlmProjectSetupResponse {
  mdToRender: string;
  questions: string[];
}
