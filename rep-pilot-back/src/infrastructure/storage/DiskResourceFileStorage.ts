import * as fs from "fs/promises";
import * as path from "path";
import { ResourceFileEntry } from "../../application/dto/ResourceDTO";
import { ResourceFileStorage } from "../../application/ports/out/ResourceFileStorage";

const DATA_DIR = process.env.DATA_DIR ?? path.resolve("data");
const RESOURCES_BASE_DIR = path.join(DATA_DIR, "resources");

export class DiskResourceFileStorage implements ResourceFileStorage {
  async saveFiles(
    resourceId: string,
    files: ResourceFileEntry[],
  ): Promise<void> {
    const resourceDir = path.join(RESOURCES_BASE_DIR, resourceId);

    for (const file of files) {
      const fullPath = path.join(resourceDir, file.path);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, file.content, "utf-8");
    }
  }

  async getFiles(resourceId: string): Promise<ResourceFileEntry[]> {
    const resourceDir = path.join(RESOURCES_BASE_DIR, resourceId);
    return this.readDirRecursive(resourceDir, resourceDir);
  }

  async deleteFiles(resourceId: string): Promise<void> {
    const resourceDir = path.join(RESOURCES_BASE_DIR, resourceId);
    try {
      await fs.rm(resourceDir, { recursive: true, force: true });
    } catch {
      // directory may not exist, ignore
    }
  }

  private async readDirRecursive(
    baseDir: string,
    currentDir: string,
  ): Promise<ResourceFileEntry[]> {
    const result: ResourceFileEntry[] = [];

    let entries;
    try {
      entries = await fs.readdir(currentDir, { withFileTypes: true });
    } catch {
      return result;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, "/");

      if (entry.isDirectory()) {
        const nested = await this.readDirRecursive(baseDir, fullPath);
        result.push(...nested);
      } else if (entry.isFile()) {
        const content = await fs.readFile(fullPath, "utf-8");
        result.push({ path: relativePath, content });
      }
    }

    return result;
  }
}
