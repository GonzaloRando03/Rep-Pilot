import { Request, Response, NextFunction } from "express";
import { CreateResourceUseCase } from "../../../../application/ports/in/CreateResourceUseCase";
import { DownloadResourceUseCase } from "../../../../application/ports/in/DownloadResourceUseCase";
import { GetMyStarredResourcesUseCase } from "../../../../application/ports/in/GetMyStarredResourcesUseCase";
import { GetResourceByIdUseCase } from "../../../../application/ports/in/GetResourceByIdUseCase";
import { GetResourceHighlightsUseCase } from "../../../../application/ports/in/GetResourceHighlightsUseCase";
import { GetResourceSummaryUseCase } from "../../../../application/ports/in/GetResourceSummaryUseCase";
import { ListResourcesUseCase } from "../../../../application/ports/in/ListResourcesUseCase";
import { SearchResourcesUseCase } from "../../../../application/ports/in/SearchResourcesUseCase";
import { ToggleStarUseCase } from "../../../../application/ports/in/ToggleStarUseCase";
import { UpdateResourceUseCase } from "../../../../application/ports/in/UpdateResourceUseCase";
import { DeleteResourceUseCase } from "../../../../application/ports/in/DeleteResourceUseCase";
import { ResourceType } from "../../../../domain/enums/ResourceType";
import { AuthenticatedRequest } from "../types/express.d";

export class ResourceController {
  constructor(
    private readonly createResourceUseCase: CreateResourceUseCase,
    private readonly listResourcesUseCase: ListResourcesUseCase,
    private readonly getResourceSummaryUseCase: GetResourceSummaryUseCase,
    private readonly getResourceHighlightsUseCase: GetResourceHighlightsUseCase,
    private readonly searchResourcesUseCase: SearchResourcesUseCase,
    private readonly getResourceByIdUseCase: GetResourceByIdUseCase,
    private readonly toggleStarUseCase: ToggleStarUseCase,
    private readonly downloadResourceUseCase: DownloadResourceUseCase,
    private readonly getMyStarredResourcesUseCase: GetMyStarredResourcesUseCase,
    private readonly updateResourceUseCase: UpdateResourceUseCase,
    private readonly deleteResourceUseCase: DeleteResourceUseCase,
  ) {}

  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { sub: createdBy } = (req as AuthenticatedRequest).user;
      const resource = await this.createResourceUseCase.execute({
        name: req.body.name,
        type: req.body.type,
        description: req.body.description,
        gitUrl: req.body.gitUrl,
        path: req.body.path,
        tags: req.body.tags,
        createdBy,
      });
      res.status(201).json(resource);
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
      const resources = await this.listResourcesUseCase.execute();
      res.status(200).json(resources);
    } catch (error) {
      next(error);
    }
  };

  myStarred = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { sub: userId } = (req as AuthenticatedRequest).user;
      const resources = await this.getMyStarredResourcesUseCase.execute(userId);
      res.status(200).json(resources);
    } catch (error) {
      next(error);
    }
  };

  summary = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const summary = await this.getResourceSummaryUseCase.execute();
      res.status(200).json(summary);
    } catch (error) {
      next(error);
    }
  };

  highlights = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const highlights = await this.getResourceHighlightsUseCase.execute();
      res.status(200).json(highlights);
    } catch (error) {
      next(error);
    }
  };

  search = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const rawTag = req.query.tag;
      const tags = rawTag
        ? Array.isArray(rawTag)
          ? (rawTag as string[])
          : [rawTag as string]
        : undefined;

      const result = await this.searchResourcesUseCase.execute({
        type: req.query.type as ResourceType | undefined,
        search: req.query.search as string | undefined,
        tags,
        page: req.query.page ? Number(req.query.page) : undefined,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await this.getResourceByIdUseCase.execute(
        req.params.id as string,
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  toggleStar = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { sub: userId } = (req as AuthenticatedRequest).user;
      const result = await this.toggleStarUseCase.execute(
        req.params.id as string,
        userId,
      );
      res.status(200).json(result);
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
      const { sub: userId, isAdmin } = (req as AuthenticatedRequest).user;
      const result = await this.updateResourceUseCase.execute(
        req.params.id as string,
        userId,
        isAdmin,
        {
          name: req.body.name,
          description: req.body.description,
          tags: req.body.tags,
        },
      );
      res.status(200).json(result);
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
      const { sub: userId, isAdmin } = (req as AuthenticatedRequest).user;
      await this.deleteResourceUseCase.execute(
        req.params.id as string,
        userId,
        isAdmin,
      );
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  download = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { buffer, filename } = await this.downloadResourceUseCase.execute(
        req.params.id as string,
      );
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
