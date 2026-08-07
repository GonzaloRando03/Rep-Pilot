import { Router } from "express";
import { ProjectController } from "../controllers/ProjectController";
import { authenticate } from "../middlewares/authenticate";
import { validateCreateProject } from "../validators/projectValidators";

export function buildProjectRoutes(controller: ProjectController): Router {
  const router = Router();

  router.use(authenticate);

  router.get("/", controller.list);
  router.get("/groups", controller.groups);
  router.get("/:id/files/all", controller.getAllFiles);
  router.get("/:id/files", controller.getFile);
  router.get("/:id", controller.getById);
  router.post("/:id/sync", controller.sync);
  router.post("/", validateCreateProject, controller.create);
  router.patch("/:id", controller.update);
  router.delete("/:id", controller.delete);

  return router;
}
