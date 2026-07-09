import { Router } from "express";
import { ProjectSetupController } from "../controllers/ProjectSetupController";
import { authenticate } from "../middlewares/authenticate";
import { validateProjectSetup } from "../validators/projectSetupValidators";

export function buildProjectSetupRoutes(
  controller: ProjectSetupController,
): Router {
  const router = Router();

  router.use(authenticate);

  router.post("/", validateProjectSetup, controller.setup);

  return router;
}
