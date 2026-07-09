import { Request, Response, NextFunction } from "express";

export function validateUpsertConfig(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const errors: string[] = [];

  const { gitInstances, openaiConfig, ldapConfig, enableTwoFactor } = req.body ?? {};

  if (gitInstances !== undefined) {
    if (!Array.isArray(gitInstances)) {
      errors.push("gitInstances must be an array");
    } else {
      gitInstances.forEach((item: unknown, index: number) => {
        if (typeof item !== "object" || item === null) {
          errors.push(`gitInstances[${index}] must be an object`);
          return;
        }
        const g = item as Record<string, unknown>;
        if (typeof g.id !== "string" || !g.id.trim()) {
          errors.push(
            `gitInstances[${index}].id is required and must be a non-empty string`,
          );
        }
        if (typeof g.url !== "string" || !g.url.trim()) {
          errors.push(
            `gitInstances[${index}].url is required and must be a non-empty string`,
          );
        }
        if (typeof g.username !== "string" || !g.username.trim()) {
          errors.push(
            `gitInstances[${index}].username is required and must be a non-empty string`,
          );
        }
        if (typeof g.token !== "string" || !g.token.trim()) {
          errors.push(
            `gitInstances[${index}].token is required and must be a non-empty string`,
          );
        }
      });
    }
  }

  if (openaiConfig !== undefined) {
    if (
      typeof openaiConfig !== "object" ||
      openaiConfig === null ||
      Array.isArray(openaiConfig)
    ) {
      errors.push("openaiConfig must be an object");
    } else {
      const oc = openaiConfig as Record<string, unknown>;
      if (oc.url !== undefined && typeof oc.url !== "string") {
        errors.push("openaiConfig.url must be a string");
      }
      if (oc.token !== undefined && typeof oc.token !== "string") {
        errors.push("openaiConfig.token must be a string");
      }
    }
  }

  if (ldapConfig !== undefined) {
    if (
      typeof ldapConfig !== "object" ||
      ldapConfig === null ||
      Array.isArray(ldapConfig)
    ) {
      errors.push("ldapConfig must be an object");
    } else {
      const lc = ldapConfig as Record<string, unknown>;
      if (lc.url !== undefined && typeof lc.url !== "string") {
        errors.push("ldapConfig.url must be a string");
      }
      if (lc.bindDn !== undefined && typeof lc.bindDn !== "string") {
        errors.push("ldapConfig.bindDn must be a string");
      }
    }
  }

  if (enableTwoFactor !== undefined && typeof enableTwoFactor !== "boolean") {
    errors.push("enableTwoFactor must be a boolean");
  }

  if (errors.length > 0) {
    res.status(400).json({ message: "Invalid payload", details: errors });
    return;
  }

  next();
}

export function validateUpsertLdapConfig(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const errors: string[] = [];

  const ldapConfig = req.body;

  if (
    typeof ldapConfig !== "object" ||
    ldapConfig === null ||
    Array.isArray(ldapConfig)
  ) {
    res.status(400).json({
      message: "Invalid payload",
      details: ["Body must be a JSON object with url and bindDn"],
    });
    return;
  }

  const lc = ldapConfig as Record<string, unknown>;

  if (typeof lc.url !== "string" || !lc.url.trim()) {
    errors.push("url is required and must be a non-empty string");
  }
  if (typeof lc.bindDn !== "string" || !lc.bindDn.trim()) {
    errors.push("bindDn is required and must be a non-empty string");
  }

  if (errors.length > 0) {
    res.status(400).json({ message: "Invalid payload", details: errors });
    return;
  }

  next();
}
