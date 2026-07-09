import { Request, Response, NextFunction } from "express";
import { CreateTagUseCase } from "../../../../application/ports/in/CreateTagUseCase";
import { ListTagsUseCase } from "../../../../application/ports/in/ListTagsUseCase";

export class TagController {
  constructor(
    private readonly listTagsUseCase: ListTagsUseCase,
    private readonly createTagUseCase: CreateTagUseCase,
  ) {}

  list = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const tags = await this.listTagsUseCase.execute();
      res.status(200).json(tags);
    } catch (error) {
      next(error);
    }
  };

  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const tag = await this.createTagUseCase.execute({ name: req.body.name });
      res.status(201).json(tag);
    } catch (error) {
      next(error);
    }
  };
}
