import { Request, Response, NextFunction } from "express";

export function validateGenerateKit(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const errors: string[] = [];

  if (!req.body?.specs || typeof req.body.specs !== "string") {
    errors.push("specs is required and must be a non-empty string");
  } else if (req.body.specs.trim().length === 0) {
    errors.push("specs must not be empty");
  }

  if (
    !req.body?.questionsAndAnswers ||
    !Array.isArray(req.body.questionsAndAnswers)
  ) {
    errors.push("questionsAndAnswers is required and must be an array");
  } else {
    for (let i = 0; i < req.body.questionsAndAnswers.length; i++) {
      const qa = req.body.questionsAndAnswers[i];
      if (
        !qa.question ||
        typeof qa.question !== "string" ||
        qa.question.trim().length === 0
      ) {
        errors.push(
          `questionsAndAnswers[${i}].question is required and must be a non-empty string`,
        );
      }
      if (
        !qa.answer ||
        typeof qa.answer !== "string" ||
        qa.answer.trim().length === 0
      ) {
        errors.push(
          `questionsAndAnswers[${i}].answer is required and must be a non-empty string`,
        );
      }
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ message: "Invalid payload", details: errors });
    return;
  }

  next();
}
