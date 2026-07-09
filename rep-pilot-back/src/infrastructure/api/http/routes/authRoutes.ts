import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { validateLogin } from "../validators/authValidators";

export function buildAuthRoutes(controller: AuthController): Router {
  const router = Router();

  router.post("/login", validateLogin, controller.login);

  return router;
}
