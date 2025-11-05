import { authControllers } from "@/controllers/auth/auth.controller";
import validateRequest from "@/middlewares/validateRequest.middleware";
import { registerUserValidationSchema } from "@/validators/user.validaton";
import { Router } from "express";

const router = Router();

router.post(
  "/register",
  validateRequest(registerUserValidationSchema),
  authControllers.registerUser
);

export const authRouter = router;
