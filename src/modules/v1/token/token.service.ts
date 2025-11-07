import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import { Env } from "@/config/env.config";
import { handleJwtError } from "@/utils/app-error";
import { encrypt, decrypt } from "@/utils/encrypt";
import { db } from "@/config/db";
import { refreshTokens } from "@/drizzle/schema/refreshTokens.schema";
import { eq } from "drizzle-orm";
import { IJwtPayload } from "./token.interface";

/* ---------- Create Token (with encrypted state) ---------- */
const createToken = (
  payload: Omit<IJwtPayload, "state">,
  secret: string,
  expiresIn: number | string,
  extra: Partial<SignOptions> = {},
  lastUsed: number = 0
): string => {
  const state = encrypt(lastUsed.toString()); // lastUsed timestamp

  return jwt.sign({ ...payload, state }, secret, {
    algorithm: "HS256",
    issuer: Env.JWT_ISSUER,
    audience: Env.JWT_AUDIENCE,
    expiresIn,
    ...extra,
  } as SignOptions);
};

/* ---------- Verify Token (throws AppError) ---------- */
const verifyToken = (
  token: string,
  secret: string,
  options: VerifyOptions = {}
): IJwtPayload => {
  try {
    const verifyOpts: VerifyOptions = {
      algorithms: ["HS256"],
      issuer: Env.JWT_ISSUER,
      audience: Env.JWT_AUDIENCE,
      ...options,
    };

    return jwt.verify(token, secret, verifyOpts) as IJwtPayload;
  } catch (err) {
    throw handleJwtError(err);
  }
};

const storeRefreshToken = async (
  userId: string,
  token: string,
  expiresAt: Date,
  ipAddress?: string,
  userAgent?: string
) => {
  return await db
    .insert(refreshTokens)
    .values({
      userId,
      token,
      expiresAt,
      ipAddress,
      userAgent,
    })
    .returning();
};

/* ---------- Validate Refresh Token ---------- */
const validateRefreshToken = async (
  token: string,
  userId: string
): Promise<boolean> => {
  // Get refresh token where token and userId match
  const refreshToken = await db.query.refreshTokens.findFirst({
    where: (rt) => eq(rt.userId, userId) && eq(rt.token, token),
  });

  // Check if token exists
  if (!refreshToken) {
    return false;
  }

  // Check if token belongs to the user
  if (refreshToken.userId !== userId) {
    return false;
  }

  // Check if token is expired
  if (refreshToken.expiresAt < new Date()) {
    return false;
  }

  // Check if token is already used
  if (refreshToken.used) {
    await db
      .update(refreshTokens)
      .set({ used: true, usedAt: new Date() })
      .where(eq(refreshTokens.userId, userId));
    return false;
  }

  return true;
};

/* ---------- Mark Refresh Token as Used ---------- */
const markRefreshTokenAsUsed = async (token: string) => {
  return await db
    .update(refreshTokens)
    .set({ used: true, usedAt: new Date(), updatedAt: new Date() })
    .where(eq(refreshTokens.token, token))
    .returning();
};

const deleteRefreshToken = async (token: string) => {
  return await db
    .delete(refreshTokens)
    .where(eq(refreshTokens.token, token))
    .returning();
};

export const tokenService = {
  createToken,
  verifyToken,
  storeRefreshToken,
  validateRefreshToken,
  markRefreshTokenAsUsed,
  deleteRefreshToken,
};
