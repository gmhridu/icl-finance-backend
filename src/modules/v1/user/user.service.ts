import { db } from "@/config/db";
import { users } from "@/drizzle";
import { eq } from "drizzle-orm";
import { TRegisterUser } from "@/modules/v1/auth/auth.interface";
import { InferSelectModel } from "drizzle-orm";

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

const getAllUsers = async () => {
  return await db.query.users.findMany({
    columns: {
      password: false,
    },
  });
};

const createUser = async (payload: TRegisterUser) => {
  return await db.insert(users).values(payload).returning();
};

const updateUser = async (id: string, payload: Partial<TRegisterUser>) => {
  return await db
    .update(users)
    .set(payload)
    .where(eq(users.id, id))
    .returning();
};

const changeUserPassword = async (userId: string, password: string) => {
  return await db
    .update(users)
    .set({ password })
    .where(eq(users.id, userId))
    .returning();
};

export const UserServices = {
  getUserFromDB,
  getUserById,
  getAllUsers,
  createUser,
  updateUser,
  changeUserPassword,
};

export type TUser = InferSelectModel<typeof users>;
