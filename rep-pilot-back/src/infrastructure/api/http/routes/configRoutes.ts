import { Router } from "express";
import { ConfigController } from "../controllers/ConfigController";
import { authenticate } from "../middlewares/authenticate";
import { requireAdmin } from "../middlewares/requireAdmin";
import {
  validateUpsertConfig,
  validateUpsertLdapConfig,
} from "../validators/configValidators";

export function buildConfigRoutes(controller: ConfigController): Router {
  const router = Router();

  router.use(authenticate);
  router.use(requireAdmin);

  router.put("/", validateUpsertConfig, controller.upsert);
  router.get("/", controller.get);

  router.put("/ldap", validateUpsertLdapConfig, controller.upsertLdap);
  router.get("/ldap", controller.getLdap);

  return router;
}
