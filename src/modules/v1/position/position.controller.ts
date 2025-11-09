import { asyncHandler } from "@/middlewares/asyncHandler.middleware";
import { positionService } from "@/modules/v1/position/position.service";
import { HTTPSTATUS } from "@/config/http.config";
import sendResponse from "@/utils/sendResponse";
import Logger from "@/utils/logger";
import { NotFoundException, BadRequestException } from "@/utils/app-error";
import { Request } from "express";
import { IJwtPayload } from "../token/token.interface";

interface CustomRequest extends Request {
  user?: IJwtPayload;
}

const getAllPositions = asyncHandler(async (_req, res) => {
  Logger.info("Fetching all positions");

  const positions = await positionService.getAllPositions();

  const positionsWithIncome = positions.map(position => {
    const income = positionService.calculateIncome(position);
    return {
      ...position,
      dailyIncome: income.dailyIncome,
      monthlyIncome: income.monthlyIncome,
      annualIncome: income.annualIncome
    };
  });

  sendResponse(res, {
    status: HTTPSTATUS.OK,
    success: true,
    message: "Positions retrieved successfully",
    data: positionsWithIncome,
  });
});

const getCurrentPosition = asyncHandler(async (req: CustomRequest, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new NotFoundException("User not found");
  }

  Logger.info("Fetching user current position", { userId });

  const userPosition = await positionService.getUserCurrentPosition(userId);

  if (!userPosition) {
    throw new NotFoundException("User not found");
  }

  const tasksCompletedToday = await positionService.getDailyTasksCompleted(userId);
  const canCompleteTask = await positionService.canCompleteTask(userId);

  let positionInfo: {
    id: string;
    name: string;
    level: number;
    deposit: number;
    tasksPerDay: number;
    unitPrice: number;
    dailyIncome: number;
    monthlyIncome: number;
    annualIncome: number;
  } | null = null;
  
  if (userPosition.position) {
    const income = positionService.calculateIncome(userPosition.position);
    positionInfo = {
      id: userPosition.position.id,
      name: userPosition.position.name,
      level: userPosition.position.level,
      deposit: userPosition.position.deposit,
      tasksPerDay: userPosition.position.tasksPerDay,
      unitPrice: userPosition.position.unitPrice,
      dailyIncome: income.dailyIncome,
      monthlyIncome: income.monthlyIncome,
      annualIncome: income.annualIncome
    };
  }

  sendResponse(res, {
    status: HTTPSTATUS.OK,
    success: true,
    message: "Current position retrieved successfully",
    data: {
      currentPosition: positionInfo,
      positionStartDate: userPosition.user.positionStartDate,
      positionEndDate: userPosition.user.positionEndDate,
      depositPaid: userPosition.user.depositPaid,
      isIntern: userPosition.user.isIntern,
      isExpired: userPosition.isExpired,
      daysRemaining: userPosition.daysRemaining,
      tasksCompletedToday,
      canCompleteTask: canCompleteTask.canComplete,
      tasksRemaining: canCompleteTask.tasksRemaining || 0,
      taskCompletionReason: canCompleteTask.reason
    },
  });
});

const upgradePosition = asyncHandler(async (req: CustomRequest, res) => {
  const userId = req.user?.userId;
  const { targetPositionId, depositAmount } = req.body;

  if (!userId) {
    throw new NotFoundException("User not found");
  }

  if (!targetPositionId || depositAmount === undefined) {
    throw new BadRequestException("Target position ID and deposit amount are required");
  }

  Logger.info("Upgrading user position", { userId, targetPositionId });

  // Attempt position upgrade
  const upgradeResult = await positionService.upgradePosition(
    userId,
    targetPositionId,
    depositAmount
  );

  if (!upgradeResult.success) {
    throw new BadRequestException(upgradeResult.message);
  }

  // If upgrade successful
  if (upgradeResult.newPosition) {
    sendResponse(res, {
      status: HTTPSTATUS.OK,
      success: true,
      message: upgradeResult.message,
      data: {
        newPosition: {
          id: upgradeResult.newPosition.id,
          name: upgradeResult.newPosition.name,
          level: upgradeResult.newPosition.level,
          deposit: upgradeResult.newPosition.deposit,
          tasksPerDay: upgradeResult.newPosition.tasksPerDay,
          unitPrice: upgradeResult.newPosition.unitPrice,
        },
      },
    });
    return;
  }

  sendResponse(res, {
    status: HTTPSTATUS.OK,
    success: true,
    message: upgradeResult.message,
  });
});

export const PositionControllers = {
  getAllPositions,
  getCurrentPosition,
  upgradePosition,
};