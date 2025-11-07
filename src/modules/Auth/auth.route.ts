import { AuthControllers } from "@/modules/Auth/auth.controller";
import validateRequest from "@/middlewares/validateRequest.middleware";
import { Router } from "express";
import { UserValidations } from "../User/user.validation";
import auth from "@/middlewares/auth.middleware";

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

router.post(
  "/change-password",
  auth(),
  validateRequest(UserValidations.changePasswordValidationSchema),
  AuthControllers.changePassword
);

router.post(
  "/forget-password",
  validateRequest(UserValidations.forgetPasswordValidationSchema),
  AuthControllers.forgetPassword
);

router.post(
  "/reset-password",
  validateRequest(UserValidations.resetPasswordValidation),
  AuthControllers.resetPassword
);

router.post("/me", auth(), AuthControllers.getMe);

router.post("/logout", auth(), AuthControllers.logout);

export const AuthRouter = router;
