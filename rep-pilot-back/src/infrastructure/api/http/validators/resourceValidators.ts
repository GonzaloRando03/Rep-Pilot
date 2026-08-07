import { Request, Response, NextFunction } from "express";
import { ResourceType } from "../../../../domain/enums/ResourceType";

export function validateCreateResource(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const name = req.body?.name;
  if (typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({
      message: "Invalid payload",
      details: ["name is required and must be a non-empty string"],
    });
    return;
  }

  next();
}

export function validateCreateResourceFromUpload(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Parse metadata from the "metadata" multipart field
  let metadata: Record<string, unknown>;
  try {
    metadata = JSON.parse(req.body.metadata ?? "{}");
  } catch {
    res.status(400).json({
      message: "Invalid payload",
      details: ["metadata must be a valid JSON string"],
    });
    return;
  }

  const errors: string[] = [];

  if (typeof metadata.name !== "string" || metadata.name.trim().length === 0) {
    errors.push("metadata.name is required and must be a non-empty string");
  }

  if (
    !metadata.type ||
    !Object.values(ResourceType).includes(metadata.type as ResourceType)
  ) {
    errors.push(
      `metadata.type is required and must be one of: ${Object.values(ResourceType).join(", ")}`,
    );
  }

  if (
    typeof metadata.description !== "string" ||
    metadata.description.trim().length === 0
  ) {
    errors.push(
      "metadata.description is required and must be a non-empty string",
    );
  }

  const files = req.files as Express.Multer.File[] | undefined;
  if (!files || files.length === 0) {
    errors.push("at least one file is required");
  }

  if (errors.length > 0) {
    res.status(400).json({ message: "Invalid payload", details: errors });
    return;
  }

  next();
}

export function validateSearchResources(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const { type, page, pageSize } = req.query;

  if (
    type !== undefined &&
    !Object.values(ResourceType).includes(type as ResourceType)
  ) {
    res.status(400).json({
      message: "Invalid query parameter",
      details: [
        `type must be one of: ${Object.values(ResourceType).join(", ")}`,
      ],
    });
    return;
  }

  if (page !== undefined && (isNaN(Number(page)) || Number(page) < 1)) {
    res.status(400).json({
      message: "Invalid query parameter",
      details: ["page must be a positive integer"],
    });
    return;
  }

  if (
    pageSize !== undefined &&
    (isNaN(Number(pageSize)) || Number(pageSize) < 1)
  ) {
    res.status(400).json({
      message: "Invalid query parameter",
      details: ["pageSize must be a positive integer"],
    });
    return;
  }

  next();
}

export function validateUpdateResource(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const { name, description, tags } = req.body;

  if (
    name !== undefined &&
    (typeof name !== "string" || name.trim().length === 0)
  ) {
    res.status(400).json({
      message: "Invalid payload",
      details: ["name must be a non-empty string"],
    });
    return;
  }

  if (
    description !== undefined &&
    (typeof description !== "string" || description.trim().length === 0)
  ) {
    res.status(400).json({
      message: "Invalid payload",
      details: ["description must be a non-empty string"],
    });
    return;
  }

  if (tags !== undefined && !Array.isArray(tags)) {
    res.status(400).json({
      message: "Invalid payload",
      details: ["tags must be an array of strings"],
    });
    return;
  }

  if (tags !== undefined && tags.some((t: unknown) => typeof t !== "string")) {
    res.status(400).json({
      message: "Invalid payload",
      details: ["tags must be an array of strings"],
    });
    return;
  }

  if (name === undefined && description === undefined && tags === undefined) {
    res.status(400).json({
      message: "Invalid payload",
      details: [
        "At least one field (name, description, tags) must be provided",
      ],
    });
    return;
  }

  next();
}
