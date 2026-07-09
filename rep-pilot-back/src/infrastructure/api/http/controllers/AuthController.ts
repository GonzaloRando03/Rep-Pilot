import { Request, Response, NextFunction } from "express";
import { LoginUseCase } from "../../../../application/ports/in/LoginUseCase";

export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.loginUseCase.execute({
        username: req.body.username,
        password: req.body.password,
        totpCode: req.body.totpCode,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
