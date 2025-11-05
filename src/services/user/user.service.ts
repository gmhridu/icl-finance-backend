import { TRegisterUser } from "@/@types/auth/auth.interface";
import { db } from "@/config/db";
import { users } from "@/drizzle";
import { eq, or } from "drizzle-orm";

const getUserFromDB = async (phone: string, email?: string) => {
  if (email) {
    return await db.query.users.findFirst({
      where: (u) => or(eq(u.phone, phone), eq(u.email, email)),
    });
  }

  return await db.query.users.findFirst({
    where: (u) => eq(u.phone, phone),
  });
};

const createUser = async (payload: TRegisterUser) => {
  return await db.insert(users).values(payload).returning();
};

export const userServices = {
  getUserFromDB,
  createUser,
};
