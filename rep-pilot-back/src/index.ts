import "dotenv/config";
import { buildHttpApp } from "./infrastructure/composition/container";
import { connectToMongoDB } from "./infrastructure/persistence/mongodb/MongoConnection";
import { getMongoUri, getPort } from "./shared/config/env";

async function bootstrap() {
  await connectToMongoDB(getMongoUri());

  const app = buildHttpApp();
  const port = getPort();

  app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
