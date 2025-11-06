import bcrypt from "bcrypt";
import {
  AppError,
  ConflictException,
  ForbiddenException,
  InternalServerException,
  NotFoundException,
} from "@/utils/app-error";
import { Env } from "@/config/env.config";
import { SignOptions } from "jsonwebtoken";
import { UserServices } from "@/modules/User/user.service";
import { TLoginUser, TRegisterUser } from "@/modules/Auth/auth.interface";
import { createToken, verifyToken } from "@/modules/Auth/auth.utils";

const registerUser = async (payload: TRegisterUser) => {
  try {
    const user = await UserServices.getUserFromDB(payload.phone);

    if (user) {
      throw new ConflictException("Phone or email already in use.");
    }

    const saltRound = 10;
    const hashPassword = await bcrypt.hash(payload.password, saltRound);

    const [newUser] = await UserServices.createUser({
      ...payload,
      password: hashPassword,
    });

    return newUser;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new InternalServerException("Failed to register user");
  }
};

const loginUser = async (payload: TLoginUser) => {
  const user = await UserServices.getUserFromDB(payload.phone as string);

  if (!user) {
    throw new NotFoundException("This user is not found!");
  }

  const { status } = user;

  if (status === "suspended") {
    throw new ForbiddenException("This user is suspended");
  }
  if (status === "banned") {
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

  const user = await UserServices.getUserById(userId);

  if (!user) {
    throw new NotFoundException("This user is not found!");
  }

  const { status } = user;

  if (status === "suspended") {
    throw new ForbiddenException("This user is suspended");
  }
  if (status === "banned") {
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

export const AuthServices = {
  registerUser,
  loginUser,
  refreshToken,
};
