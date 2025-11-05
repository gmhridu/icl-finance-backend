import { ZodError, ZodType, ZodSchema } from "zod";
import { asyncHandler } from "./asyncHandler.middleware";
import { NextFunction, Request, Response } from "express";
import { BadRequestException } from "../utils/app-error";

const validateRequest = (schema: ZodType | ZodSchema) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await schema.parseAsync({
          ...req.body,
          ...req.cookies,
          refreshToken: req.cookies.refreshToken,
        });
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          const errorMessages = error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          }));
          throw new BadRequestException(`Validation Error: ${errorMessages.map(e => `${e.field}: ${e.message}`).join(", ")}`);
        }
        throw error;
      }
    }
  );
};

export default validateRequest;
