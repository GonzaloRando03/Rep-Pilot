import { Request, Response, NextFunction } from "express";
import { SetupTwoFactorUseCase } from "../../../../application/ports/in/SetupTwoFactorUseCase";
import { ConfirmTwoFactorUseCase } from "../../../../application/ports/in/ConfirmTwoFactorUseCase";
import { DisableTwoFactorUseCase } from "../../../../application/ports/in/DisableTwoFactorUseCase";
import { AuthenticatedRequest } from "../types/express.d";

export class TwoFactorController {
  constructor(
    private readonly setupTwoFactor: SetupTwoFactorUseCase,
    private readonly confirmTwoFactor: ConfirmTwoFactorUseCase,
    private readonly disableTwoFactor: DisableTwoFactorUseCase,
  ) {}

  setup = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).user.sub;
      const result = await this.setupTwoFactor.execute(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  confirm = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).user.sub;
      const result = await this.confirmTwoFactor.execute({
        userId,
        totpCode: req.body.totpCode,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  disable = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = (req as AuthenticatedRequest).user.sub;
      await this.disableTwoFactor.execute({
        userId,
        totpCode: req.body.totpCode,
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
