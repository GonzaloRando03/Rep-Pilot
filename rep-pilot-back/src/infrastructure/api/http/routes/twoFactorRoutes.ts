import { Router } from "express";
import { TwoFactorController } from "../controllers/TwoFactorController";
import { authenticate } from "../middlewares/authenticate";
import { validateTotpCode } from "../validators/twoFactorValidators";

export function buildTwoFactorRoutes(controller: TwoFactorController): Router {
  const router = Router();

  router.use(authenticate);

  router.post("/setup", controller.setup);
  router.post("/confirm", validateTotpCode, controller.confirm);
  router.delete("/", validateTotpCode, controller.disable);

  return router;
}
