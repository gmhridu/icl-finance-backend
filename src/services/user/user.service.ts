import { TRegisterUser } from "@/@types/auth/auth.interface";
import { db } from "@/config/db";
import { users } from "@/drizzle";
import { eq, or } from "drizzle-orm";

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

export const userServices = {
  getUserFromDB,
  getUserById,
  createUser,
};
