import { Language } from "../../../domain/enums/Language";
import { GenerateKitResponseDTO } from "../../dto/GenerateKitDTO";

export interface GenerateKitUseCase {
  execute(input: {
    specs: string;
    questionsAndAnswers: { question: string; answer: string }[];
    language?: Language;
  }): Promise<GenerateKitResponseDTO>;
}
