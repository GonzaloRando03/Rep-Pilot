import cors from "cors";
import express, { Express } from "express";
import { Logger } from "../../../application/ports/out/Logger";
import { getCorsOrigin } from "../../../shared/config/env";
import { AuthController } from "./controllers/AuthController";
import { ChatController } from "./controllers/ChatController";
import { ConfigController } from "./controllers/ConfigController";
import { ProjectSetupController } from "./controllers/ProjectSetupController";
import { GenerateKitController } from "./controllers/GenerateKitController";
import { RepositoryController } from "./controllers/RepositoryController";
import { ResourceController } from "./controllers/ResourceController";
import { TagController } from "./controllers/TagController";
import { UserController } from "./controllers/UserController";
import { TwoFactorController } from "./controllers/TwoFactorController";
import { buildErrorHandler } from "./middlewares/errorHandler";
import { buildAuthRoutes } from "./routes/authRoutes";
import { buildChatRoutes } from "./routes/chatRoutes";
import { buildConfigRoutes } from "./routes/configRoutes";
import { buildProjectSetupRoutes } from "./routes/projectSetupRoutes";
import { buildGenerateKitRoutes } from "./routes/generateKitRoutes";
import { buildRepositoryRoutes } from "./routes/repositoryRoutes";
import { buildResourceRoutes } from "./routes/resourceRoutes";
import { buildTagRoutes } from "./routes/tagRoutes";
import { buildUserRoutes } from "./routes/userRoutes";
import { buildTwoFactorRoutes } from "./routes/twoFactorRoutes";

export function createApp(
  resourceController: ResourceController,
  userController: UserController,
  authController: AuthController,
  tagController: TagController,
  configController: ConfigController,
  repositoryController: RepositoryController,
  chatController: ChatController,
  projectSetupController: ProjectSetupController,
  generateKitController: GenerateKitController,
  twoFactorController: TwoFactorController,
  logger: Logger,
): Express {
  const app = express();

  app.use(cors({ origin: getCorsOrigin() }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", service: "rep-pilot-back" });
  });

  app.get("/", (_req, res) => {
    res.send("Hexagonal TypeScript backend running");
  });

  app.use("/api/resources", buildResourceRoutes(resourceController));
  app.use("/api/users", buildUserRoutes(userController));
  app.use("/api/auth", buildAuthRoutes(authController));
  app.use("/api/tags", buildTagRoutes(tagController));
  app.use("/api/config", buildConfigRoutes(configController));
  app.use("/api/repository", buildRepositoryRoutes(repositoryController));
  app.use("/api/chat", buildChatRoutes(chatController));
  app.use(
    "/api/project-setup",
    buildProjectSetupRoutes(projectSetupController),
  );
  app.use("/api/generate-kit", buildGenerateKitRoutes(generateKitController));
  app.use("/api/me/2fa", buildTwoFactorRoutes(twoFactorController));

  app.use(buildErrorHandler(logger));

  return app;
}
