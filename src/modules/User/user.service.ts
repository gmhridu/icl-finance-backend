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

export const UserServices = {
  getUserFromDB,
  getUserById,
  createUser,
  changeUserPassword,
};
