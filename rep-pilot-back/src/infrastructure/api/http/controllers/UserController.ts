import { Request, Response, NextFunction } from "express";
import { CreateUserUseCase } from "../../../../application/ports/in/CreateUserUseCase";
import { GetMeUseCase } from "../../../../application/ports/in/GetMeUseCase";
import { ListUsersUseCase } from "../../../../application/ports/in/ListUsersUseCase";
import { UpdateMyLanguageUseCase } from "../../../../application/ports/in/UpdateMyLanguageUseCase";
import { UpdateUserUseCase } from "../../../../application/ports/in/UpdateUserUseCase";
import { AuthenticatedRequest } from "../types/express.d";

export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getMeUseCase: GetMeUseCase,
    private readonly updateMyLanguageUseCase: UpdateMyLanguageUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
  ) {}

  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = await this.createUserUseCase.execute({
        username: req.body.username,
        name: req.body.name,
        password: req.body.password,
        isAdmin: req.body.isAdmin,
        language: req.body.language,
      });
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  };

  me = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { sub } = (req as AuthenticatedRequest).user;
      const user = await this.getMeUseCase.execute(sub);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };

  updateLanguage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { sub } = (req as AuthenticatedRequest).user;
      const user = await this.updateMyLanguageUseCase.execute(
        sub,
        req.body.language,
      );
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };

  list = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const users = await this.listUsersUseCase.execute();
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  };

  update = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = await this.updateUserUseCase.execute(String(req.params.id), {
        name: req.body.name,
        username: req.body.username,
        isAdmin: req.body.isAdmin,
        language: req.body.language,
        password: req.body.password,
      });
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };
}
