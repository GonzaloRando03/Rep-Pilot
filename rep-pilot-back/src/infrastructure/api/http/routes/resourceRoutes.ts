import { Router } from "express";
import { ResourceController } from "../controllers/ResourceController";
import { authenticate } from "../middlewares/authenticate";
import {
  validateCreateResource,
  validateSearchResources,
  validateUpdateResource,
} from "../validators/resourceValidators";

export function buildResourceRoutes(controller: ResourceController): Router {
  const router = Router();

  router.use(authenticate);

  router.get("/", controller.list);
  router.get("/starred", controller.myStarred);
  router.get("/summary", controller.summary);
  router.get("/highlights", controller.highlights);
  router.get("/search", validateSearchResources, controller.search);
  router.get("/:id", controller.getById);
  router.get("/:id/download", controller.download);
  router.post("/", validateCreateResource, controller.create);
  router.patch("/:id/star", controller.toggleStar);
  router.patch("/:id", validateUpdateResource, controller.update);
  router.delete("/:id", controller.delete);

  return router;
}
