import AuthRouter  from "@/modules/Auth/auth.route";
import { Router, Express } from "express";

const router = Router();

const getApiRoutes = () => {
  router.use("/auth", AuthRouter);

  return router;
};

export const setupApiRoutes = (app: Express): void => {
  app.use("/api/v1", getApiRoutes());
};
