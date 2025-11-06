import { AuthControllers } from "@/modules/Auth/auth.controller";
import validateRequest from "@/middlewares/validateRequest.middleware";
import { Router } from "express";
import { UserValidations } from "../User/user.validation";

const router = Router();

router.post(
  "/register",
  validateRequest(UserValidations.registerUserValidationSchema),
  AuthControllers.registerUser
);

router.post(
  "/login",
  validateRequest(UserValidations.loginUserValidationSchema),
  AuthControllers.loginUser
);

router.post(
  "/refresh-token",
  validateRequest(UserValidations.refreshTokenValidationSchema),
  AuthControllers.refreshToken
);

export const AuthRouter = router;
