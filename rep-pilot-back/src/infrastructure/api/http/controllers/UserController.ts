import { Request, Response, NextFunction } from "express";
import { CreateUserUseCase } from "../../../../application/ports/in/CreateUserUseCase";
import { GetMeUseCase } from "../../../../application/ports/in/GetMeUseCase";
import { ListUsersUseCase } from "../../../../application/ports/in/ListUsersUseCase";
import { UpdateMyLanguageUseCase } from "../../../../application/ports/in/UpdateMyLanguageUseCase";
import { UpdateUserUseCase } from "../../../../application/ports/in/UpdateUserUseCase";
import { CreateApiTokenUseCase } from "../../../../application/ports/in/CreateApiTokenUseCase";
import { ListApiTokensUseCase } from "../../../../application/ports/in/ListApiTokensUseCase";
import { RevokeApiTokenUseCase } from "../../../../application/ports/in/RevokeApiTokenUseCase";
import { ChangePasswordUseCase } from "../../../../application/ports/in/ChangePasswordUseCase";
import { DeleteUserUseCase } from "../../../../application/ports/in/DeleteUserUseCase";
import { AuthenticatedRequest } from "../types/express.d";

export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getMeUseCase: GetMeUseCase,
    private readonly updateMyLanguageUseCase: UpdateMyLanguageUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly createApiTokenUseCase: CreateApiTokenUseCase,
    private readonly listApiTokensUseCase: ListApiTokensUseCase,
    private readonly revokeApiTokenUseCase: RevokeApiTokenUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
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
        email: req.body.email,
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
        email: req.body.email,
      });
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };

  delete = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { sub } = (req as AuthenticatedRequest).user;
      await this.deleteUserUseCase.execute(String(req.params.id), sub);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  // ─── API Token endpoints ──────────────────────────────────

  listTokens = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { sub } = (req as AuthenticatedRequest).user;
      const tokens = await this.listApiTokensUseCase.execute(sub);
      res.status(200).json(tokens);
    } catch (error) {
      next(error);
    }
  };

  createToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { sub } = (req as AuthenticatedRequest).user;

      const name = req.body.name?.trim();
      if (!name) {
        res.status(400).json({ message: "Token name is required" });
        return;
      }

      const result = await this.createApiTokenUseCase.execute({
        userId: sub,
        name,
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  revokeToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { sub } = (req as AuthenticatedRequest).user;
      const tokenId = req.params.tokenId as string;

      if (!tokenId?.trim()) {
        res.status(400).json({ message: "tokenId is required" });
        return;
      }

      await this.revokeApiTokenUseCase.execute({
        userId: sub,
        tokenId: tokenId.trim(),
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { sub } = (req as AuthenticatedRequest).user;
      const user = await this.changePasswordUseCase.execute(sub, {
        currentPassword: req.body.currentPassword,
        newPassword: req.body.newPassword,
      });
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };
}
