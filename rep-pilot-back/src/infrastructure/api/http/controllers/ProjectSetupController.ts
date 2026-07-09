import { Request, Response, NextFunction } from "express";
import { ProjectSetupUseCase } from "../../../../application/ports/in/ProjectSetupUseCase";
import { UserRepository } from "../../../../application/ports/out/UserRepository";
import { AuthenticatedRequest } from "../types/express.d";

export class ProjectSetupController {
  constructor(
    private readonly projectSetupUseCase: ProjectSetupUseCase,
    private readonly userRepository: UserRepository,
  ) {}

  setup = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { sub } = (req as AuthenticatedRequest).user;
      const user = await this.userRepository.findById(sub);
      const language = user?.language ?? req.body.language;

      const result = await this.projectSetupUseCase.execute({
        specs: req.body.specs,
        language,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
