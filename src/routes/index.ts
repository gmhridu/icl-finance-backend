import AuthRouter from "@/modules/v1/auth/auth.route";
import UserRouter from "@/modules/v1/user/user.route";
import PositionRouter from "@/modules/v1/position/position.route";
import { Router, Express } from "express";

const router = Router();

const getApiRoutes = () => {
  router.use("/auth", AuthRouter);
  router.use("/user", UserRouter);
  router.use("/positions", PositionRouter);

  return router;
};

export const setupApiRoutes = (app: Express): void => {
  app.use("/api/v1", getApiRoutes());
};