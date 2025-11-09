import { PositionControllers } from "@/modules/v1/position/position.controller";
import validateRequest from "@/middlewares/validateRequest.middleware";
import { Router } from "express";
import { PositionValidations } from "./position.validation";
import auth from "@/middlewares/auth.middleware";

const router: Router = Router();

// Public route
router.get("/", PositionControllers.getAllPositions);

// Protected routes
router.get("/current", auth(), PositionControllers.getCurrentPosition);

router.post(
  "/upgrade",
  auth(),
  validateRequest(PositionValidations.upgradePositionValidationSchema),
  PositionControllers.upgradePosition
);

export default router;