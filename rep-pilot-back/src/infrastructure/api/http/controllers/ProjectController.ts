import { Request, Response, NextFunction } from "express";
import { CreateProjectUseCase } from "../../../../application/ports/in/CreateProjectUseCase";
import { GetProjectByIdUseCase } from "../../../../application/ports/in/GetProjectByIdUseCase";
import { ListProjectsUseCase } from "../../../../application/ports/in/ListProjectsUseCase";
import { GetProjectFileUseCase } from "../../../../application/ports/in/GetProjectFileUseCase";
import { ListProjectGroupsUseCase } from "../../../../application/ports/in/ListProjectGroupsUseCase";
import { GetAllProjectFilesUseCase } from "../../../../application/ports/in/GetAllProjectFilesUseCase";
import { SyncProjectFilesUseCase } from "../../../../application/ports/in/SyncProjectFilesUseCase";
import { UpdateProjectUseCase } from "../../../../application/ports/in/UpdateProjectUseCase";
import { DeleteProjectUseCase } from "../../../../application/ports/in/DeleteProjectUseCase";
import { AuthenticatedRequest } from "../types/express.d";

export class ProjectController {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly getProjectByIdUseCase: GetProjectByIdUseCase,
    private readonly listProjectsUseCase: ListProjectsUseCase,
    private readonly getProjectFileUseCase: GetProjectFileUseCase,
    private readonly listProjectGroupsUseCase: ListProjectGroupsUseCase,
    private readonly getAllProjectFilesUseCase: GetAllProjectFilesUseCase,
    private readonly syncProjectFilesUseCase: SyncProjectFilesUseCase,
    private readonly updateProjectUseCase: UpdateProjectUseCase,
    private readonly deleteProjectUseCase: DeleteProjectUseCase,
  ) {}

  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { sub: createdBy } = (req as AuthenticatedRequest).user;
      const project = await this.createProjectUseCase.execute({
        name: req.body.name,
        members: req.body.members,
        rootFolderName: req.body.rootFolderName,
        files: req.body.files,
        group: req.body.group,
        createdBy,
      });
      res.status(201).json(project);
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
      const id = req.params.id as string;
      const project = await this.getProjectByIdUseCase.execute(id);
      res.status(200).json(project);
    } catch (error) {
      next(error);
    }
  };

  list = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { sub: userId, isAdmin } = (req as AuthenticatedRequest).user;
      const group = req.query.group as string | undefined;
      const projects = await this.listProjectsUseCase.execute({
        userId,
        isAdmin,
        group,
      });
      res.status(200).json(projects);
    } catch (error) {
      next(error);
    }
  };

  getFile = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = req.params.id as string;
      const filePath = (req.query.path as string) ?? "";

      if (!filePath.trim()) {
        res.status(400).json({
          message: "Invalid query parameter",
          details: ["path query parameter is required"],
        });
        return;
      }

      const file = await this.getProjectFileUseCase.execute(
        id,
        filePath.trim(),
      );
      res.status(200).json(file);
    } catch (error) {
      next(error);
    }
  };

  groups = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const groups = await this.listProjectGroupsUseCase.execute();
      res.status(200).json(groups);
    } catch (error) {
      next(error);
    }
  };

  // ─── Sync endpoints ───────────────────────────────────────

  /**
   * GET /api/projects/:id/files/all
   * Descarga todos los archivos con sus timestamps de modificación.
   */
  getAllFiles = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = req.params.id as string;
      const files = await this.getAllProjectFilesUseCase.execute(id);
      res.status(200).json(files);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/projects/:id/sync
   * Sincronización bidireccional.
   */
  sync = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = req.params.id as string;
      const { sub } = (req as AuthenticatedRequest).user;

      const { files, lastSyncAt } = req.body;

      if (!Array.isArray(files)) {
        res.status(400).json({
          message: "Invalid request body",
          details: ["files must be an array"],
        });
        return;
      }

      const result = await this.syncProjectFilesUseCase.execute(id, sub, {
        files,
        lastSyncAt: lastSyncAt ?? null,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/projects/:id
   * Actualiza metadatos, miembros y archivos del proyecto.
   */
  update = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = req.params.id as string;
      const { sub: userId, isAdmin } = (req as AuthenticatedRequest).user;

      const result = await this.updateProjectUseCase.execute(
        id,
        userId,
        isAdmin,
        {
          name: req.body.name,
          group: req.body.group,
          members: req.body.members,
          files: req.body.files,
          removedFiles: req.body.removedFiles,
        },
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/projects/:id
   * Elimina el proyecto y todos sus archivos.
   */
  delete = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = req.params.id as string;
      const { sub: userId, isAdmin } = (req as AuthenticatedRequest).user;

      await this.deleteProjectUseCase.execute(id, userId, isAdmin);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
