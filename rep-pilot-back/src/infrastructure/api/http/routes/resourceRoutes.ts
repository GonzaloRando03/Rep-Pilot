import { Router } from "express";
import multer from "multer";
import { ResourceController } from "../controllers/ResourceController";
import { authenticate } from "../middlewares/authenticate";
import {
  validateCreateResource,
  validateCreateResourceFromUpload,
  validateSearchResources,
  validateUpdateResource,
} from "../validators/resourceValidators";

const upload = multer({ storage: multer.memoryStorage() });

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
  router.post(
    "/upload",
    upload.any(),
    validateCreateResourceFromUpload,
    controller.createFromUpload,
  );
  router.patch("/:id/star", controller.toggleStar);
  router.patch("/:id", validateUpdateResource, controller.update);
  router.delete("/:id", controller.delete);

  return router;
}
