import { authControllers } from "@/controllers/auth/auth.controller";
import validateRequest from "@/middlewares/validateRequest.middleware";
import {
  loginUserValidationSchema,
  refreshTokenValidationSchema,
  registerUserValidationSchema,
} from "@/validators/user.validaton";
import { Router } from "express";

const router = Router();

router.post(
  "/register",
  validateRequest(registerUserValidationSchema),
  authControllers.registerUser
);

router.post(
  "/login",
  validateRequest(loginUserValidationSchema),
  authControllers.loginUser
);

router.post(
  "/refresh-token",
  validateRequest(refreshTokenValidationSchema),
  authControllers.refreshToken
);

export const authRouter = router;
