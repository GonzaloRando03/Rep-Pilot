import { Router } from "express";
import { ChatController } from "../controllers/ChatController";
import { authenticate } from "../middlewares/authenticate";
import { validateChat } from "../validators/chatValidators";

export function buildChatRoutes(controller: ChatController): Router {
  const router = Router();

  router.use(authenticate);

  router.post("/", validateChat, controller.chat);

  return router;
}
