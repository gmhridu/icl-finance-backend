import "dotenv/config";
import path from "path";
import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Env } from "./config/env.config";
import { HTTPSTATUS } from "./config/http.config";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import helmet from "helmet";
import morgan from "morgan";
import { db } from "./config/db";
import { sql } from "drizzle-orm";
import { setupApiRoutes } from "@/routes";
import {
  errorHandler,
  requestIdMiddleware,
} from "./middlewares/errorHandler.middleware";
import { notFoundHandler } from "./middlewares/notFound.middleware";

const app = express();

app.use(requestIdMiddleware);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  cors({
    origin: Env.FRONTEND_ORIGIN!,
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan(Env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/", (_req: Request, res: Response) => {
  res.status(HTTPSTATUS.OK).json({
    status: "OK",
    message: "🚀 Welcome to ICL FINANCE API!",
    environment: Env.NODE_ENV,
    timestamp: new Date().toUTCString(),
  });
});

app.get(
  "/health",
  asyncHandler(async (_req, res) => {
    res.status(HTTPSTATUS.OK).json({
      status: "OK",
      message: "API is healthy!",
      environment: Env.NODE_ENV,
      timestamp: new Date().toUTCString(),
    });
  })
);

// applications routes
setupApiRoutes(app);

// 404 Handler (after all routes)
app.use(notFoundHandler);

// Global Error Handler (last)
app.use(errorHandler);

app.listen(Env.PORT, async () => {
  await db.execute(sql`SELECT 1`);
  console.log("🟢 Database connected successfully");

  console.log(
    `🚀 Server running at http://localhost:${Env.PORT} in ${Env.NODE_ENV} mode`
  );
});
