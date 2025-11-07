import { AuthControllers } from "@/modules/v1/auth/auth.controller";
import validateRequest from "@/middlewares/validateRequest.middleware";
import { Router } from "express";
import { UserValidations } from "../user/user.validation";
import auth from "@/middlewares/auth.middleware";

const router: Router = Router();

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

router.get("/refresh-access-token", AuthControllers.refreshAccessToken);

router.post(
  "/change-password",
  auth(),
  validateRequest(UserValidations.changePasswordValidationSchema),
  AuthControllers.changePassword
);

router.post("/logout", AuthControllers.logout);

export default router;
