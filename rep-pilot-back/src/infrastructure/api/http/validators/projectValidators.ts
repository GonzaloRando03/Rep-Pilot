import { Request, Response, NextFunction } from "express";

const MAX_TOTAL_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB

export function validateCreateProject(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const errors: string[] = [];

  const name = req.body?.name;
  if (typeof name !== "string" || name.trim().length === 0) {
    errors.push("name is required and must be a non-empty string");
  }

  const rootFolderName = req.body?.rootFolderName;
  if (
    typeof rootFolderName !== "string" ||
    rootFolderName.trim().length === 0
  ) {
    errors.push("rootFolderName is required and must be a non-empty string");
  }

  const members = req.body?.members;
  if (!Array.isArray(members)) {
    errors.push("members must be an array of user IDs");
  } else {
    for (const m of members) {
      if (typeof m !== "string" || m.trim().length === 0) {
        errors.push("each member must be a non-empty string");
        break;
      }
    }
  }

  const files = req.body?.files;
  if (!Array.isArray(files)) {
    errors.push("files must be an array");
  } else {
    let totalSize = 0;
    for (const f of files) {
      if (typeof f.path !== "string" || f.path.trim().length === 0) {
        errors.push("each file must have a non-empty path");
        break;
      }
      if (typeof f.content !== "string") {
        errors.push("each file must have a content string");
        break;
      }
      totalSize += Buffer.byteLength(f.content, "utf-8");
    }

    if (totalSize > MAX_TOTAL_SIZE_BYTES) {
      errors.push(
        `total file size (${(totalSize / (1024 * 1024)).toFixed(1)} MB) exceeds the maximum allowed (500 MB)`,
      );
    }
  }

  const group = req.body?.group;
  if (
    group !== undefined &&
    (typeof group !== "string" || group.trim().length === 0)
  ) {
    errors.push("group must be a non-empty string if provided");
  }

  if (errors.length > 0) {
    res.status(400).json({ message: "Invalid payload", details: errors });
    return;
  }

  next();
}
