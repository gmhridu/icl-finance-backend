import bcrypt from "bcrypt";
import { TLoginUser, TRegisterUser } from "@/@types/auth/auth.interface";
import {
  AppError,
  ConflictException,
  ForbiddenException,
  InternalServerException,
  NotFoundException,
} from "@/utils/app-error";
import { userServices } from "../user/user.service";
import { HTTPSTATUS } from "@/config/http.config";
import { createToken, verifyToken } from "@/utils/auth.utils";
import { Env } from "@/config/env.config";
import { SignOptions } from "jsonwebtoken";

const registerUser = async (payload: TRegisterUser) => {
  try {
    const user = await userServices.getUserFromDB(payload.phone);

    if (user) {
      throw new ConflictException("Email or Phone Number already exists!");
    }

    const saltRound = 10;
    const hashPassword = await bcrypt.hash(payload.password, saltRound);

    const [newUser] = await userServices.createUser({
      ...payload,
      password: hashPassword,
    });

    return newUser;
  } catch (error) {
    throw new InternalServerException("Internal server error");
  }
};

const loginUser = async (payload: TLoginUser) => {
  const user = await userServices.getUserFromDB(payload.phone as string);

  if (!user) {
    throw new NotFoundException("This user is not found!");
  }

  const isSuspended = user.status;
  const isBanned = user.status;

  if (isSuspended === "suspended") {
    throw new ForbiddenException("This user is suspended");
  }

  if (isBanned === "banned") {
    throw new ForbiddenException("This user is banned");
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordValid) {
    throw new ForbiddenException("Password do not matched!");
  }

  // create token and send to the client
  const jwtPayload = {
    userId: user.id,
    number: user.phone,
  };

  const accessToken = createToken(
    jwtPayload,
    Env.JWT_ACCESS_SECRET,
    Env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"]
  );

  const refreshToken = createToken(
    jwtPayload,
    Env.JWT_REFRESH_SECRET,
    Env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"]
  );

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string) => {
  // checking if the given token is valid
  const decoded = verifyToken(token, Env.JWT_REFRESH_SECRET);

  const { userId } = decoded;

  const user = await userServices.getUserById(userId);

  if (!user) {
    throw new NotFoundException("This user is not found!");
  }

  const isSuspended = user.status;
  const isBanned = user.status;

  if (isSuspended === "suspended") {
    throw new ForbiddenException("This user is suspended");
  }

  if (isBanned === "banned") {
    throw new ForbiddenException("This user is banned");
  }

  const jwtPayload = {
    userId: user.id,
    number: user.phone,
  };

  const accessToken = createToken(
    jwtPayload,
    Env.JWT_ACCESS_SECRET,
    Env.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"]
  );

  return {
    accessToken,
  };
};

export const authServices = {
  registerUser,
  loginUser,
  refreshToken,
};
