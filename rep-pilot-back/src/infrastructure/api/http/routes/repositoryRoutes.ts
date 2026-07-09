import { Router } from "express";
import { RepositoryController } from "../controllers/RepositoryController";
import { authenticate } from "../middlewares/authenticate";
import { validateScanRepository } from "../validators/repositoryValidators";

export function buildRepositoryRoutes(
  controller: RepositoryController,
): Router {
  const router = Router();

  router.use(authenticate);

  router.post("/scan", validateScanRepository, controller.scan);

  return router;
}
