import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authenticate } from "../middlewares/authenticate";
import { requireAdmin } from "../middlewares/requireAdmin";
import { validateCreateUser } from "../validators/userValidators";
import { validateUpdateLanguage } from "../validators/userLanguageValidators";
import { validateUpdateUser } from "../validators/updateUserValidators";
import { validateChangePassword } from "../validators/changePasswordValidators";

export function buildUserRoutes(controller: UserController): Router {
  const router = Router();

  router.use(authenticate);

  // Profile
  router.get("/me", controller.me);
  router.patch(
    "/me/language",
    validateUpdateLanguage,
    controller.updateLanguage,
  );
  router.patch(
    "/me/password",
    validateChangePassword,
    controller.changePassword,
  );

  // API Tokens
  router.get("/me/tokens", controller.listTokens);
  router.post("/me/tokens", controller.createToken);
  router.delete("/me/tokens/:tokenId", controller.revokeToken);

  // Admin
  router.post("/", requireAdmin, validateCreateUser, controller.create);
  router.get("/", requireAdmin, controller.list);
  router.patch("/:id", requireAdmin, validateUpdateUser, controller.update);

  return router;
}
