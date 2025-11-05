import { authControllers } from "@/controllers/auth/auth.controller";
import validateRequest from "@/middlewares/validateRequest.middleware";
import {
  loginUserValidationSchema,
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

export const authRouter = router;
