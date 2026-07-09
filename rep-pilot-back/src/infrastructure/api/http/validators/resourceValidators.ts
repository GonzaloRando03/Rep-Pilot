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
