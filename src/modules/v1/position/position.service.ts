import { db } from "@/config/db";
import { eq, and, gte, sql, lt } from "drizzle-orm";
import {
  TPosition,
  PositionIncomeCalculation,
  UserPositionInfo,
  PositionUpgradeResult,
  TaskCompletionInfo,
} from "./position.interface";
import {
  InternalServerException,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from "@/utils/app-error";

import { videoTasks } from "@/drizzle/schema/videos.schema";
import { users } from "@/drizzle/schema/users.schema";
import { walletTransactions } from "@/drizzle/schema/walletTansactions.schema";
import { transactionTypeEnum } from "@/drizzle/schema/walletTansactions.schema";

const getAllPositions = async (): Promise<TPosition[]> => {
  try {
    return (await db.query.positionLevels.findMany({
      where: (position) => eq(position.isActive, true),
      orderBy: (position) => [position.level],
    })) as TPosition[];
  } catch (error) {
    throw new InternalServerException("Failed to fetch positions");
  }
};

const getPositionByName = async (name: string): Promise<TPosition | null> => { 
  try {
    return (await db.query.positionLevels.findFirst({
      where: (position) => eq(position.name, name),
    })) as TPosition | null;
  } catch (error) {
    throw new InternalServerException("Failed to fetch position");
  }
};

const calculateIncome = (position: TPosition): PositionIncomeCalculation => {
  const dailyIncome = position.tasksPerDay * position.unitPrice;
  const monthlyIncome = dailyIncome * 30;
  const annualIncome = dailyIncome * 365;

  return {
    dailyIncome,
    monthlyIncome,
    annualIncome,
  };
};

const getUserCurrentPosition = async (
  userId: string
): Promise<UserPositionInfo | null> => {
  try {
    const user = await db.query.users.findFirst({
      where: (user) => eq(user.id, userId),
      with: {
        currentPosition: true,
      },
    });

    if (!user) return null;

    // Check if user is intern and has exceeded the 4-day limit
    if (user.isIntern && user.positionStartDate) {
      const startDate = new Date(user.positionStartDate);
      const currentDate = new Date();

      // Calculate the difference in days
      const timeDiff = currentDate.getTime() - startDate.getTime();
      const daysSinceStart = Math.floor(timeDiff / (1000 * 3600 * 24));

      // Intern position expires after 4 days (from day 5 onward, no tasks)
      if (daysSinceStart >= 4) {
        return {
          user: {
            id: user.id,
            positionStartDate: user.positionStartDate,
            positionEndDate: user.positionEndDate,
            depositPaid: user.depositPaid,
            isIntern: user.isIntern,
          },
          position: user.currentPosition
            ? (user.currentPosition as unknown as TPosition)
            : null,
          isExpired: true,
          daysRemaining: 0,
        };
      } else {
        return {
          user: {
            id: user.id,
            positionStartDate: user.positionStartDate,
            positionEndDate: user.positionEndDate,
            depositPaid: user.depositPaid,
            isIntern: user.isIntern,
          },
          position: user.currentPosition
            ? (user.currentPosition as unknown as TPosition)
            : null,
          isExpired: false,
          daysRemaining: 4 - daysSinceStart,
        };
      }
    }

    // For non-intern positions, they don't expire
    const isExpired = false;
    const daysRemaining = Infinity;

    return {
      user: {
        id: user.id,
        positionStartDate: user.positionStartDate,
        positionEndDate: user.positionEndDate,
        depositPaid: user.depositPaid,
        isIntern: user.isIntern,
      },
      position: user.currentPosition
        ? (user.currentPosition as unknown as TPosition)
        : null,
      isExpired,
      daysRemaining,
    };
  } catch (error) {
    throw new InternalServerException("Failed to fetch user position");
  }
};

const getDailyTasksCompleted = async (userId: string): Promise<number> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const result = await db
      .select({
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(videoTasks)
      .where(
        and(
          eq(videoTasks.userId, userId),
          gte(videoTasks.watchedAt, today),
          lt(videoTasks.watchedAt, tomorrow)
        )
      );

    return result[0]?.count || 0;
  } catch (error) {
    throw new InternalServerException("Failed to fetch daily tasks");
  }
};

const canCompleteTask = async (userId: string): Promise<TaskCompletionInfo> => {
  try {
    const userPosition = await getUserCurrentPosition(userId);

    if (!userPosition) {
      return {
        canComplete: false,
        reason: "User not found",
      };
    }

    if (!userPosition.position) {
      return {
        canComplete: false,
        reason: "No active position",
      };
    }

    if (userPosition.isExpired) {
      return {
        canComplete: false,
        reason: "Position expired",
      };
    }

    const tasksCompletedToday = await getDailyTasksCompleted(userId);

    if (tasksCompletedToday >= userPosition.position.tasksPerDay) {
      return {
        canComplete: false,
        tasksRemaining: 0,
        reason: "Daily task limit reached",
      };
    }

    return {
      canComplete: true,
      tasksRemaining: userPosition.position.tasksPerDay - tasksCompletedToday,
    };
  } catch (error) {
    throw new InternalServerException(
      "Failed to check task completion eligibility"
    );
  }
};

const upgradePosition = async (
  userId: string,
  targetPositionId: string,
  depositAmount: number
): Promise<PositionUpgradeResult> => {
  try {
    // Get user with current position
    const user = await db.query.users.findFirst({
      where: (user) => eq(user.id, userId),
      with: {
        currentPosition: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Get target position
    const targetPosition = await db.query.positionLevels.findFirst({
      where: (position) => eq(position.id, targetPositionId),
    });

    if (!targetPosition) {
      throw new NotFoundException("Target position not found");
    }

    // Validate deposit amount
    if (depositAmount < targetPosition.deposit) {
      throw new BadRequestException(
        `Insufficient deposit. Required: ${targetPosition.deposit} PKR`
      );
    }

    // Check if user can upgrade (must be to a higher or same level)
    const currentLevel = (user.currentPosition as any)?.level || 0;
    if (targetPosition.level < currentLevel) {
      throw new ForbiddenException(
        "Cannot downgrade position levels. You can only upgrade to the same or a higher position level."
      );
    }

    // Check wallet balance for deposit
    if (user.walletBalance < targetPosition.deposit) {
      throw new BadRequestException(
        "Insufficient wallet balance for deposit"
      );
    }

    const startDate = new Date();
    const endDate = null;

    // Perform the upgrade in a transaction
    const result = await db.transaction(async (tx) => {
      // Update user position
      const updatedUser = await tx
        .update(users)
        .set({
          walletBalance: user.walletBalance - targetPosition.deposit,
          currentPositionId: targetPosition.id,
          previousPositionId: user.currentPositionId,
          positionStartDate: startDate,
          positionEndDate: endDate,
          depositPaid: user.depositPaid + targetPosition.deposit,
          isIntern: targetPosition.name === "Intern",
        })
        .where(eq(users.id, userId))
        .returning();

      // Record deposit transaction
      const transaction = await tx
        .insert(walletTransactions)
        .values({
          userId,
          type: transactionTypeEnum.enumValues[2], // POSITION_DEPOSIT
          amount: -targetPosition.deposit,
          balanceAfter: user.walletBalance - targetPosition.deposit,
          description: `Position upgrade to ${targetPosition.name}`,
          referenceId: `POSITION_UPGRADE_${
            targetPosition.name
          }_${userId}_${Date.now()}`,
          status: "completed",
          metadata: JSON.stringify({
            positionId: targetPosition.id,
            positionName: targetPosition.name,
            previousPositionId: user.currentPositionId,
          }),
        })
        .returning();

      return {
        updatedUser: updatedUser[0],
        transaction: transaction[0],
      };
    });

    return {
      success: true,
      message: `Successfully upgraded to ${targetPosition.name}`,
      newPosition: targetPosition as unknown as TPosition,
      previousPosition: user.currentPosition as unknown as
        | TPosition
        | undefined,
    };
  } catch (error) {
    throw new InternalServerException("Failed to upgrade position");
  }
};

export const positionService = {
  getAllPositions,
  getPositionByName,
  calculateIncome,
  getUserCurrentPosition,
  getDailyTasksCompleted,
  canCompleteTask,
  upgradePosition,
};