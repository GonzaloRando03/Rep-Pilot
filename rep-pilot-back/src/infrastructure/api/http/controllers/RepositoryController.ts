import { Request, Response, NextFunction } from "express";
import { ScanRepositoryUseCase } from "../../../../application/ports/in/ScanRepositoryUseCase";

export class RepositoryController {
  constructor(private readonly scanRepositoryUseCase: ScanRepositoryUseCase) {}

  scan = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.scanRepositoryUseCase.execute({
        url: req.body.url,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
