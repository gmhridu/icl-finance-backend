import { ZodType, ZodError } from "zod";
import { asyncHandler } from "./asyncHandler.middleware";
import { NextFunction, Request, Response } from "express";
import { ValidationException } from "../utils/app-error";
import Logger from "../utils/logger";

const validateRequest = <T = any>(schema: ZodType<T>) => {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    try {
      // Create input object that matches the Zod schema structure
      const input = {
        body: req.body || {},
        query: req.query || {},
        params: req.params || {},
        cookies: req.cookies || {},
      };

      await schema.parseAsync(input);
      next();
    } catch (error) {
      Logger.warn("Validation error", {
        url: req.url,
        method: req.method,
        body: req.body,
        error: error instanceof ZodError ? error.issues : error,
      });

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