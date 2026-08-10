import { CreateResource } from "../../application/use-cases/create-resource/CreateResource";
import { CreateResourceFromUpload } from "../../application/use-cases/create-resource-from-upload/CreateResourceFromUpload";
import { CreateTag } from "../../application/use-cases/create-tag/CreateTag";
import { CreateUser } from "../../application/use-cases/create-user/CreateUser";
import { DeleteResource } from "../../application/use-cases/delete-resource/DeleteResource";
import { DownloadResource } from "../../application/use-cases/download-resource/DownloadResource";
import { GetMyStarredResources } from "../../application/use-cases/get-my-starred-resources/GetMyStarredResources";
import { GetConfig } from "../../application/use-cases/get-config/GetConfig";
import { GetMe } from "../../application/use-cases/get-me/GetMe";
import { GetResourceById } from "../../application/use-cases/get-resource-by-id/GetResourceById";
import { GetResourceHighlights } from "../../application/use-cases/get-resource-highlights/GetResourceHighlights";
import { GetResourceSummary } from "../../application/use-cases/get-resource-summary/GetResourceSummary";
import { ListResources } from "../../application/use-cases/list-resources/ListResources";
import { ListTags } from "../../application/use-cases/list-tags/ListTags";
import { ListUsers } from "../../application/use-cases/list-users/ListUsers";
import { Login } from "../../application/use-cases/login/Login";
import { ScanRepository } from "../../application/use-cases/scan-repository/ScanRepository";
import { SearchResources } from "../../application/use-cases/search-resources/SearchResources";
import { ToggleStar } from "../../application/use-cases/toggle-star/ToggleStar";
import { UpdateMyLanguage } from "../../application/use-cases/update-my-language/UpdateMyLanguage";
import { UpdateResource } from "../../application/use-cases/update-resource/UpdateResource";
import { UpdateUser } from "../../application/use-cases/update-user/UpdateUser";
import { UpsertConfig } from "../../application/use-cases/upsert-config/UpsertConfig";
import { Chat } from "../../application/use-cases/chat/Chat";
import { ProjectSetup } from "../../application/use-cases/project-setup/ProjectSetup";
import { GenerateKit } from "../../application/use-cases/generate-kit/GenerateKit";
import { SetupTwoFactor } from "../../application/use-cases/setup-two-factor/SetupTwoFactor";
import { ConfirmTwoFactor } from "../../application/use-cases/confirm-two-factor/ConfirmTwoFactor";
import { DisableTwoFactor } from "../../application/use-cases/disable-two-factor/DisableTwoFactor";
import { CreateProject } from "../../application/use-cases/create-project/CreateProject";
import { UpdateProject } from "../../application/use-cases/update-project/UpdateProject";
import { DeleteProject } from "../../application/use-cases/delete-project/DeleteProject";
import { GetProjectById } from "../../application/use-cases/get-project-by-id/GetProjectById";
import { ListProjects } from "../../application/use-cases/list-projects/ListProjects";
import { GetProjectFile } from "../../application/use-cases/get-project-file/GetProjectFile";
import { ListProjectGroups } from "../../application/use-cases/list-project-groups/ListProjectGroups";
import { CreateApiToken } from "../../application/use-cases/create-api-token/CreateApiToken";
import { ListApiTokens } from "../../application/use-cases/list-api-tokens/ListApiTokens";
import { RevokeApiToken } from "../../application/use-cases/revoke-api-token/RevokeApiToken";
import { ChangePassword } from "../../application/use-cases/change-password/ChangePassword";
import { GetAllProjectFiles } from "../../application/use-cases/get-all-project-files/GetAllProjectFiles";
import { SyncProjectFiles } from "../../application/use-cases/sync-project-files/SyncProjectFiles";
import { Language } from "../../domain/enums/Language";
import { OpenAiLlmProvider } from "../llm/OpenAiLlmProvider";
import { AuthController } from "../api/http/controllers/AuthController";
import { ChatController } from "../api/http/controllers/ChatController";
import { ProjectSetupController } from "../api/http/controllers/ProjectSetupController";
import { GenerateKitController } from "../api/http/controllers/GenerateKitController";
import { ConfigController } from "../api/http/controllers/ConfigController";
import { RepositoryController } from "../api/http/controllers/RepositoryController";
import { ResourceController } from "../api/http/controllers/ResourceController";
import { TagController } from "../api/http/controllers/TagController";
import { UserController } from "../api/http/controllers/UserController";
import { TwoFactorController } from "../api/http/controllers/TwoFactorController";
import { ProjectController } from "../api/http/controllers/ProjectController";
import { createApp } from "../api/http/createApp";
import { setAuthRepositories } from "../api/http/middlewares/authenticate";
import { GitProviderFactory } from "../git/GitProviderFactory";
import { ConsoleLogger } from "../logging/ConsoleLogger";
import { withLogging } from "../logging/withLogging";
import { MongoConfigRepository } from "../persistence/repositories/MongoConfigRepository";
import { MongoResourceRepository } from "../persistence/repositories/MongoResourceRepository";
import { MongoTagRepository } from "../persistence/repositories/MongoTagRepository";
import { MongoUserRepository } from "../persistence/repositories/MongoUserRepository";
import { MongoProjectRepository } from "../persistence/repositories/MongoProjectRepository";
import { MongoApiTokenRepository } from "../persistence/repositories/MongoApiTokenRepository";
import { DiskProjectFileStorage } from "../storage/DiskProjectFileStorage";
import { DiskResourceFileStorage } from "../storage/DiskResourceFileStorage";
import { BcryptPasswordHasher } from "../security/BcryptPasswordHasher";
import { JwtTokenService } from "../security/JwtTokenService";
import { AesTokenEncryptor } from "../security/AesTokenEncryptor";
import { OtplibTotpAdapter } from "../security/OtplibTotpAdapter";
import { LdapJsAuthProvider } from "../ldap/LdapJsAuthProvider";
import {
  getDefaultLanguage,
  getEncryptionKey,
  getJwtSecret,
} from "../../shared/config/env";

function resolveDefaultLanguage(): Language {
  const raw = getDefaultLanguage().toLowerCase();
  if (Object.values(Language).includes(raw as Language)) {
    return raw as Language;
  }
  console.warn(`Invalid DEFAULT_LANGUAGE '${raw}', falling back to 'en'`);
  return Language.EN;
}

export function buildHttpApp() {
  const logger = new ConsoleLogger();

  const tokenEncryptor = new AesTokenEncryptor(getEncryptionKey());
  const totp = new OtplibTotpAdapter();

  const resourceRepository = new MongoResourceRepository();
  const userRepository = new MongoUserRepository(tokenEncryptor);
  const tagRepository = new MongoTagRepository();
  const configRepository = new MongoConfigRepository(tokenEncryptor);
  const projectRepository = new MongoProjectRepository();
  const projectFileStorage = new DiskProjectFileStorage();
  const resourceFileStorage = new DiskResourceFileStorage();
  const apiTokenRepository = new MongoApiTokenRepository();
  const passwordHasher = new BcryptPasswordHasher();
  const tokenService = new JwtTokenService(getJwtSecret());
  const defaultLanguage = resolveDefaultLanguage();
  const ldapAuth = new LdapJsAuthProvider();

  const gitProviderFactory = new GitProviderFactory();

  const createResource = withLogging(
    new CreateResource(resourceRepository, tagRepository, userRepository),
    "CreateResource",
    logger,
  );
  const createResourceFromUpload = withLogging(
    new CreateResourceFromUpload(
      resourceRepository,
      resourceFileStorage,
      tagRepository,
      userRepository,
    ),
    "CreateResourceFromUpload",
    logger,
  );
  const listResources = withLogging(
    new ListResources(resourceRepository, tagRepository, userRepository),
    "ListResources",
    logger,
  );
  const getResourceSummary = withLogging(
    new GetResourceSummary(resourceRepository),
    "GetResourceSummary",
    logger,
  );
  const getResourceHighlights = withLogging(
    new GetResourceHighlights(
      resourceRepository,
      tagRepository,
      userRepository,
    ),
    "GetResourceHighlights",
    logger,
  );
  const searchResources = withLogging(
    new SearchResources(resourceRepository, tagRepository, userRepository),
    "SearchResources",
    logger,
  );
  const getResourceById = withLogging(
    new GetResourceById(
      resourceRepository,
      tagRepository,
      userRepository,
      configRepository,
      gitProviderFactory,
      resourceFileStorage,
    ),
    "GetResourceById",
    logger,
  );
  const toggleStar = withLogging(
    new ToggleStar(resourceRepository, tagRepository, userRepository),
    "ToggleStar",
    logger,
  );
  const downloadResource = withLogging(
    new DownloadResource(
      resourceRepository,
      configRepository,
      gitProviderFactory,
      resourceFileStorage,
    ),
    "DownloadResource",
    logger,
  );
  const getMyStarredResources = withLogging(
    new GetMyStarredResources(
      resourceRepository,
      tagRepository,
      userRepository,
    ),
    "GetMyStarredResources",
    logger,
  );
  const listTags = withLogging(new ListTags(tagRepository), "ListTags", logger);
  const createTag = withLogging(
    new CreateTag(tagRepository),
    "CreateTag",
    logger,
  );
  const createUser = withLogging(
    new CreateUser(
      userRepository,
      passwordHasher,
      defaultLanguage,
      configRepository,
    ),
    "CreateUser",
    logger,
  );
  const getMe = withLogging(new GetMe(userRepository), "GetMe", logger);
  const updateMyLanguage = withLogging(
    new UpdateMyLanguage(userRepository),
    "UpdateMyLanguage",
    logger,
  );
  const login = withLogging(
    new Login(
      userRepository,
      passwordHasher,
      tokenService,
      configRepository,
      ldapAuth,
      createUser,
      totp,
    ),
    "Login",
    logger,
  );
  const upsertConfig = withLogging(
    new UpsertConfig(configRepository),
    "UpsertConfig",
    logger,
  );
  const getConfig = withLogging(
    new GetConfig(configRepository),
    "GetConfig",
    logger,
  );
  const listUsers = withLogging(
    new ListUsers(userRepository),
    "ListUsers",
    logger,
  );
  const updateUser = withLogging(
    new UpdateUser(userRepository, passwordHasher),
    "UpdateUser",
    logger,
  );

  // API token use cases
  const createApiToken = withLogging(
    new CreateApiToken(apiTokenRepository, userRepository),
    "CreateApiToken",
    logger,
  );
  const listApiTokens = withLogging(
    new ListApiTokens(apiTokenRepository),
    "ListApiTokens",
    logger,
  );
  const revokeApiToken = withLogging(
    new RevokeApiToken(apiTokenRepository),
    "RevokeApiToken",
    logger,
  );
  const changePassword = withLogging(
    new ChangePassword(userRepository, passwordHasher),
    "ChangePassword",
    logger,
  );

  const scanRepository = withLogging(
    new ScanRepository(
      gitProviderFactory,
      configRepository,
      resourceRepository,
    ),
    "ScanRepository",
    logger,
  );

  const updateResource = withLogging(
    new UpdateResource(resourceRepository, tagRepository, userRepository),
    "UpdateResource",
    logger,
  );

  const deleteResource = withLogging(
    new DeleteResource(resourceRepository),
    "DeleteResource",
    logger,
  );

  const setupTwoFactor = withLogging(
    new SetupTwoFactor(userRepository, totp),
    "SetupTwoFactor",
    logger,
  );
  const confirmTwoFactor = withLogging(
    new ConfirmTwoFactor(userRepository, totp),
    "ConfirmTwoFactor",
    logger,
  );
  const disableTwoFactor = withLogging(
    new DisableTwoFactor(userRepository, totp),
    "DisableTwoFactor",
    logger,
  );

  const resourceController = new ResourceController(
    createResource,
    createResourceFromUpload,
    listResources,
    getResourceSummary,
    getResourceHighlights,
    searchResources,
    getResourceById,
    toggleStar,
    downloadResource,
    getMyStarredResources,
    updateResource,
    deleteResource,
  );
  const userController = new UserController(
    createUser,
    getMe,
    updateMyLanguage,
    listUsers,
    updateUser,
    createApiToken,
    listApiTokens,
    revokeApiToken,
    changePassword,
  );
  const authController = new AuthController(login);
  const tagController = new TagController(listTags, createTag);
  const twoFactorController = new TwoFactorController(
    setupTwoFactor,
    confirmTwoFactor,
    disableTwoFactor,
  );
  const llmProvider = new OpenAiLlmProvider();
  const chat = withLogging(
    new Chat(llmProvider, configRepository),
    "Chat",
    logger,
  );
  const chatController = new ChatController(chat);

  const projectSetup = withLogging(
    new ProjectSetup(
      llmProvider,
      configRepository,
      tagRepository,
      resourceRepository,
    ),
    "ProjectSetup",
    logger,
  );
  const projectSetupController = new ProjectSetupController(
    projectSetup,
    userRepository,
  );

  const generateKit = withLogging(
    new GenerateKit(
      llmProvider,
      configRepository,
      tagRepository,
      resourceRepository,
      gitProviderFactory,
    ),
    "GenerateKit",
    logger,
  );
  const generateKitController = new GenerateKitController(
    generateKit,
    userRepository,
  );

  const configController = new ConfigController(upsertConfig, getConfig);
  const repositoryController = new RepositoryController(scanRepository);

  const createProject = withLogging(
    new CreateProject(projectRepository, projectFileStorage, userRepository),
    "CreateProject",
    logger,
  );
  const getProjectById = withLogging(
    new GetProjectById(projectRepository, userRepository),
    "GetProjectById",
    logger,
  );
  const listProjects = withLogging(
    new ListProjects(projectRepository, userRepository),
    "ListProjects",
    logger,
  );
  const getProjectFile = withLogging(
    new GetProjectFile(projectRepository, projectFileStorage),
    "GetProjectFile",
    logger,
  );
  const listProjectGroups = withLogging(
    new ListProjectGroups(projectRepository),
    "ListProjectGroups",
    logger,
  );

  // Sync use cases
  const getAllProjectFiles = withLogging(
    new GetAllProjectFiles(projectRepository, projectFileStorage),
    "GetAllProjectFiles",
    logger,
  );
  const syncProjectFiles = withLogging(
    new SyncProjectFiles(projectRepository, projectFileStorage),
    "SyncProjectFiles",
    logger,
  );

  const updateProject = withLogging(
    new UpdateProject(projectRepository, projectFileStorage, userRepository),
    "UpdateProject",
    logger,
  );
  const deleteProject = withLogging(
    new DeleteProject(projectRepository, projectFileStorage),
    "DeleteProject",
    logger,
  );

  const projectController = new ProjectController(
    createProject,
    getProjectById,
    listProjects,
    getProjectFile,
    listProjectGroups,
    getAllProjectFiles,
    syncProjectFiles,
    updateProject,
    deleteProject,
  );

  // Inject API token repo into auth middleware for dual JWT + API token support
  setAuthRepositories(apiTokenRepository, userRepository);

  return createApp(
    resourceController,
    userController,
    authController,
    tagController,
    configController,
    repositoryController,
    chatController,
    projectSetupController,
    generateKitController,
    twoFactorController,
    projectController,
    logger,
  );
}
