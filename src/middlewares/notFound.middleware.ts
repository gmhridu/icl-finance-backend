import { Request, Response, NextFunction } from "express";
import { NotFoundException } from "../utils/app-error";

export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const message = `Cannot ${req.method} ${req.originalUrl}`;
  next(new NotFoundException(message));
};
