import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authenticate } from "../middlewares/authenticate";
import { requireAdmin } from "../middlewares/requireAdmin";
import { validateCreateUser } from "../validators/userValidators";
import { validateUpdateLanguage } from "../validators/userLanguageValidators";
import { validateUpdateUser } from "../validators/updateUserValidators";

export function buildUserRoutes(controller: UserController): Router {
  const router = Router();

  router.use(authenticate);

  router.get("/me", controller.me);
  router.patch(
    "/me/language",
    validateUpdateLanguage,
    controller.updateLanguage,
  );
  router.post("/", requireAdmin, validateCreateUser, controller.create);

  router.get("/", requireAdmin, controller.list);
  router.patch("/:id", requireAdmin, validateUpdateUser, controller.update);

  return router;
}
