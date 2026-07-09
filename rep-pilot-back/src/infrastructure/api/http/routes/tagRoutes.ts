import { Router } from "express";
import { TagController } from "../controllers/TagController";
import { authenticate } from "../middlewares/authenticate";
import { validateCreateTag } from "../validators/tagValidators";

export function buildTagRoutes(controller: TagController): Router {
  const router = Router();

  router.use(authenticate);

  router.get("/", controller.list);
  router.post("/", validateCreateTag, controller.create);

  return router;
}
