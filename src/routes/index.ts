import AuthRouter from "@/modules/v1/auth/auth.route";
import { BankCardRouter } from "@/modules/v1/bank-cards/bankCards.routes";
import UserRouter from "@/modules/v1/user/user.route";
import { Router, Express } from "express";

const router = Router();

const getApiRoutes = () => {
  router.use("/auth", AuthRouter);
  router.use("/user", UserRouter);
  router.use("/bank-card", BankCardRouter);

  return router;
};

export const setupApiRoutes = (app: Express): void => {
  app.use("/api/v1", getApiRoutes());
};
