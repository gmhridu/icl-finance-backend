import bcrypt from "bcrypt";
import {
  AppError,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerException,
  NotFoundException,
  UnauthorizedException,
} from "@/utils/app-error";
import { Env } from "@/config/env.config";
import { UserServices } from "@/modules/v1/user/user.service";
import { TLoginUser, TRegisterUser } from "@/modules/v1/auth/auth.interface";
import {
tokenService
} from "@/modules/v1/token/token.service";
import { users } from "@/drizzle/schema/users.schema";
import { eq } from "drizzle-orm";
import { db } from "@/config/db";
import { decrypt } from "@/utils/encrypt";
import { IJwtPayload } from "../token/token.interface";

const registerUser = async (payload: TRegisterUser) => {
  try {
    // Check if user already exists
    const existingUser = await UserServices.getUserFromDB(payload.phone);

    if (existingUser) {
      throw new ConflictException("Phone number already in use.");
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(payload.password, saltRounds);

    // Create user
    const [newUser] = await UserServices.createUser({
      ...payload,
      password: hashedPassword,
    });

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      status: newUser.status,
      createdAt: newUser.createdAt,
    };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new InternalServerException("Failed to register user");
  }
};

const loginUser = async (payload: TLoginUser, ipAddress?: string, userAgent?: string) => {
  // Validate input
  if (!payload.phone && !payload.email) {
    throw new BadRequestException("Phone or email is required");
  }

  // Find user
  let user;
  if (payload.phone) {
    user = await UserServices.getUserFromDB(payload.phone);
  } else if (payload.email) {
    user = await db.query.users.findFirst({
      where: (u) => eq(u.email, payload.email as string),
    });
  }

  if (!user) {
    throw new NotFoundException("Invalid credentials");
  }

  // Check user status
  if (user.status === "suspended") {
    throw new ForbiddenException("This user account is suspended");
  }
  if (user.status === "banned") {
    throw new ForbiddenException("This user account is banned");
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedException("Invalid credentials");
  }

  // Update last login timestamp
  await db
    .update(users)
    .set({
      lastLoginAt: new Date(),
      failedLoginAttempts: 0,
      lockedUntil: null,
    })
    .where(eq(users.id, user.id));

  // Create tokens
  const jwtPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
  };

  const accessToken = tokenService.createToken(
    jwtPayload,
    Env.JWT_ACCESS_SECRET,
    Env.JWT_ACCESS_EXPIRES_IN
  );

  const refreshToken = tokenService.createToken(
    jwtPayload,
    Env.JWT_REFRESH_SECRET,
    Env.JWT_REFRESH_EXPIRES_IN
  );

  // Store refresh token in database
  const refreshTokenExpiresAt = new Date(Date.now() + Env.JWT_REFRESH_EXPIRES_IN_MS);
  await tokenService.storeRefreshToken(
    user.id,
    refreshToken,
    refreshTokenExpiresAt,
    ipAddress,
    userAgent
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
    },
    accessToken,
    refreshToken,
  };
};

const refreshAccessToken = async (token: string, ipAddress?: string, userAgent?: string) => {
  // Verify refresh token
  let decoded: IJwtPayload;
  try {
    decoded = tokenService.verifyToken(token, Env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw new UnauthorizedException("Invalid or expired refresh token");
  }

  // Validate refresh token against database
  const isValid = await tokenService.validateRefreshToken(token, decoded.userId);
  if (!isValid) {
    throw new UnauthorizedException("Invalid or expired refresh token");
  }

  // Get user
  const user = await UserServices.getUserById(decoded.userId);
  if (!user) {
    throw new NotFoundException("User not found");
  }

  // Check user status again
  if (user.status === "suspended") {
    throw new ForbiddenException("This user account is suspended");
  }
  if (user.status === "banned") {
    throw new ForbiddenException("This user account is banned");
  }

  // Mark current refresh token as used
  await tokenService.markRefreshTokenAsUsed(token);

  // Create new tokens
  const newPayload = {
    userId: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
  };

  const accessToken = tokenService.createToken(
    newPayload,
    Env.JWT_ACCESS_SECRET,
    Env.JWT_ACCESS_EXPIRES_IN
  );

  const refreshToken = tokenService.createToken(
    newPayload,
    Env.JWT_REFRESH_SECRET,
    Env.JWT_REFRESH_EXPIRES_IN
  );

  // Store new refresh token in database
  const refreshTokenExpiresAt = new Date(Date.now() + Env.JWT_REFRESH_EXPIRES_IN_MS);
  await tokenService.storeRefreshToken(
    user.id,
    refreshToken,
    refreshTokenExpiresAt,
    ipAddress,
    userAgent
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
    },
    accessToken,
    refreshToken,
  };
};

const changePassword = async (
  userData: IJwtPayload,
  payload: {
    oldPassword: string;
    newPassword: string;
  }
) => {
  // Validate input
  if (payload.newPassword.length < 6) {
    throw new BadRequestException(
      "Password must be at least 6 characters long"
    );
  }

  // Get user
  const user = await UserServices.getUserById(userData.userId);
  if (!user) throw new NotFoundException("User not found");

  // Check user status
  if (user.status === "suspended") {
    throw new ForbiddenException("This user account is suspended");
  }
  if (user.status === "banned") {
    throw new ForbiddenException("This user account is banned");
  }

  // Verify old password
  const isOldPasswordValid = await bcrypt.compare(
    payload.oldPassword,
    user.password
  );
  if (!isOldPasswordValid) {
    throw new ForbiddenException("Current password is incorrect");
  }

  // Check if new password is different from old password
  if (await bcrypt.compare(payload.newPassword, user.password)) {
    throw new BadRequestException(
      "New password must be different from current password"
    );
  }

  // Hash new password
  const saltRounds = 12;
  const newHashedPassword = await bcrypt.hash(payload.newPassword, saltRounds);

  // Update password
  await UserServices.changeUserPassword(userData.userId, newHashedPassword);

  return { message: "Password changed successfully" };
};

// Add logout function to blacklist tokens
const logout = async (refreshToken: string) => {
  await tokenService.markRefreshTokenAsUsed(refreshToken);
  await tokenService.deleteRefreshToken(refreshToken);
  return { message: "Logged out successfully" };
};

export const AuthServices = {
  registerUser,
  loginUser,
  refreshAccessToken,
  changePassword,
  logout,
};