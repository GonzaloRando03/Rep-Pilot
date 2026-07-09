import { Request, Response, NextFunction } from "express";
import { GenerateKitUseCase } from "../../../../application/ports/in/GenerateKitUseCase";
import { UserRepository } from "../../../../application/ports/out/UserRepository";
import { AuthenticatedRequest } from "../types/express.d";

export class GenerateKitController {
  constructor(
    private readonly generateKitUseCase: GenerateKitUseCase,
    private readonly userRepository: UserRepository,
  ) {}

  generate = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { sub } = (req as AuthenticatedRequest).user;
      const user = await this.userRepository.findById(sub);
      const language = user?.language ?? req.body.language;

      const { buffer, filename } = await this.generateKitUseCase.execute({
        specs: req.body.specs,
        questionsAndAnswers: req.body.questionsAndAnswers,
        language,
      });

      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}.zip"`,
      );
      res.setHeader("Content-Length", buffer.length);
      res.end(buffer);
    } catch (error) {
      next(error);
    }
  };
}
