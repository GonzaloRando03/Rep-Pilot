import { Request, Response, NextFunction } from "express";
import { GetConfigUseCase } from "../../../../application/ports/in/GetConfigUseCase";
import { UpsertConfigUseCase } from "../../../../application/ports/in/UpsertConfigUseCase";

export class ConfigController {
  constructor(
    private readonly upsertConfigUseCase: UpsertConfigUseCase,
    private readonly getConfigUseCase: GetConfigUseCase,
  ) {}

  upsert = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const config = await this.upsertConfigUseCase.execute({
        gitInstances: req.body.gitInstances,
        openaiConfig: req.body.openaiConfig,
        ldapConfig: req.body.ldapConfig,
        enableTwoFactor: req.body.enableTwoFactor,
      });
      res.status(200).json(config);
    } catch (error) {
      next(error);
    }
  };

  get = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const config = await this.getConfigUseCase.execute();
      if (!config) {
        res.status(404).json({ message: "Configuration not found" });
        return;
      }
      res.status(200).json(config);
    } catch (error) {
      next(error);
    }
  };

  upsertLdap = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const config = await this.upsertConfigUseCase.execute({
        ldapConfig: req.body,
      });
      res.status(200).json(config);
    } catch (error) {
      next(error);
    }
  };

  getLdap = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const config = await this.getConfigUseCase.execute();
      if (!config) {
        res.status(404).json({ message: "Configuration not found" });
        return;
      }
      res.status(200).json(config.ldapConfig);
    } catch (error) {
      next(error);
    }
  };
}
