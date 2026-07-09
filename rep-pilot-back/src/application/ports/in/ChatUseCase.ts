import { ChatRequestDTO, ChatResponseDTO } from "../../dto/ChatDTO";

export interface ChatUseCase {
  execute(input: ChatRequestDTO): Promise<ChatResponseDTO>;
}
