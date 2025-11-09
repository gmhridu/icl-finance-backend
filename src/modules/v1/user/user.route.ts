import { UserControllers } from "./user.controller";
import validateRequest from "@/middlewares/validateRequest.middleware";
import { Router } from "express";
import { UserValidations } from "./user.validation";
import auth from "@/middlewares/auth.middleware";

const router: Router = Router();

// Protected routes
router.get("/profile", auth(), UserControllers.getProfile);

router.put(
  "/profile",
  auth(),
  validateRequest(UserValidations.updateProfileValidationSchema),
  UserControllers.updateProfile
);

router.get("/:id", auth(), UserControllers.getUserById);

router.get("/", auth(), UserControllers.getAllUsers);

export default router;
