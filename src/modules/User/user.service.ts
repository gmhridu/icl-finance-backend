import { db } from "@/config/db";
import { users } from "@/drizzle";
import { eq } from "drizzle-orm";
import { TRegisterUser } from "@/modules/Auth/auth.interface";

const getUserFromDB = async (phone: string) => {
  return await db.query.users.findFirst({
    where: (u) => eq(u.phone, phone),
  });
};

const getUserById = async (id: string) => {
  return await db.query.users.findFirst({
    where: (u) => eq(u.id, id),
  });
};

const createUser = async (payload: TRegisterUser) => {
  return await db.insert(users).values(payload).returning();
};

const changeUserPassword = async (userId: string, password: string) => {
  return await db
    .update(users)
    .set({ password })
    .where(eq(users.id, userId))
    .returning();
};

const getMe = async (userId: string) => {
  return await db.query.users.findFirst({
    where: (u) => eq(u.id, userId),
    columns: {
      id: true,
      name: true,
      email: true,
      phone: true,
      emailVerified: true,
      phoneVerified: true,
      referralCode: true,
      referredBy: true,
      status: true,
      walletBalance: true,
      totalEarnings: true,
      commissionBalance: true,
      securityRefund: true,
      depositPaid: true,
      positionLevelId: true,
      currentPositionId: true,
      previousPositionId: true,
      positionStartDate: true,
      positionEndDate: true,
      isIntern: true,
      fundPassword: true,
      referredByActivityId: true,
      isActive: true,
    },
  });
};

export const UserServices = {
  getUserFromDB,
  getUserById,
  createUser,
  changeUserPassword,
  getMe,
};
