import { Request, Response, NextFunction } from "express";
import { ChatUseCase } from "../../../../application/ports/in/ChatUseCase";

export class ChatController {
  constructor(private readonly chatUseCase: ChatUseCase) {}

  chat = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.chatUseCase.execute({
        messages: req.body.messages,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
