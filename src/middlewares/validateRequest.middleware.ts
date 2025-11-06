import { ZodType, ZodError } from "zod";
import { asyncHandler } from "./asyncHandler.middleware";
import { NextFunction, Request, Response } from "express";
import { ValidationException } from "../utils/app-error";

const validateRequest = <T = any>(schema: ZodType<T>) => {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Safely cast to 'any' then parse — this is safe because Zod will validate
      const input = {
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
      } as any;

      await schema.parseAsync(input);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = error.issues.reduce((acc, err) => {
          const field = err.path.join(".");
          if (!acc[field]) acc[field] = [];
          acc[field].push(err.message);
          return acc;
        }, {} as Record<string, string[]>);

        throw new ValidationException("Validation failed.", fieldErrors);
      }
      throw error;
    }
  });
};

export default validateRequest;
