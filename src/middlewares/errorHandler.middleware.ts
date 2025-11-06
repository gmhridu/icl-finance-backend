import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { Env } from "../config/env.config";
import {
  AppError,
  handleZodError,
  handlePostgresError,
  handleJwtError,
  InternalServerException,
} from "../utils/app-error";
import Logger from "../utils/logger";

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

export const requestIdMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  req.id = uuidv4();
  next();
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const requestId = req.id ?? "unknown";
  const isDev = Env.NODE_ENV !== "production";

  // Log full error
  Logger.error(`[${requestId}] ${req.method} ${req.originalUrl}`, {
    name: err.name,
    message: err.message,
    stack: err.stack,
    body: req.body,
    query: req.query,
    user: (req as any).user?.id ?? "anonymous",
  });

  let appError: AppError;

  // Order matters: specific → general
  if (err instanceof ZodError) {
    appError = handleZodError(err);
  }
  else if (err instanceof TokenExpiredError || err instanceof JsonWebTokenError) {
    appError = handleJwtError(err);
  }
  else if (err.code && typeof err.code === "string" && err.code.startsWith("23")) {
    appError = handlePostgresError(err);
  }
  else if (err instanceof AppError) {
    appError = err;
  }
  else {
    appError = new InternalServerException();
    appError.stack = err.stack;
  }

  // Send response
  res.status(appError.statusCode).json(appError.toJSON(requestId, isDev));
};