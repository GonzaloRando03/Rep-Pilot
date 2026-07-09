import { Router } from "express";
import { GenerateKitController } from "../controllers/GenerateKitController";
import { authenticate } from "../middlewares/authenticate";
import { validateGenerateKit } from "../validators/generateKitValidators";

export function buildGenerateKitRoutes(
  controller: GenerateKitController,
): Router {
  const router = Router();

  router.use(authenticate);

  router.post("/", validateGenerateKit, controller.generate);

  return router;
}
