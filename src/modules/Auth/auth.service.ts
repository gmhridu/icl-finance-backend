import bcrypt from "bcrypt";
import {
  AppError,
  ConflictException,
  ForbiddenException,
  InternalServerException,
  NotFoundException,
  UnauthorizedException,
} from "@/utils/app-error";
import { Env } from "@/config/env.config";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserServices } from "@/modules/User/user.service";
import { TLoginUser, TRegisterUser } from "@/modules/Auth/auth.interface";
import {
  createToken,
  IJwtPayload,
  passwordResetEmailTemplate,
  verifyToken,
} from "@/modules/Auth/auth.utils";
import { sendEmail } from "@/utils/sendEmail";

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
    Env.JWT_ACCESS_EXPIRES_IN
  );

  const refreshToken = createToken(
    jwtPayload,
    Env.JWT_REFRESH_SECRET,
    Env.JWT_REFRESH_EXPIRES_IN
  );

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string) => {
  let decoded: IJwtPayload;

  try {
    decoded = verifyToken(token, Env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw error;
  }

  let lastUsed: number;

  try {
    lastUsed = parseInt(decoded.state, 10);
  } catch {
    throw new UnauthorizedException("Corrupted token state");
  }

  if (decoded.iat! <= lastUsed) {
    throw new UnauthorizedException("Refresh token already used");
  }

  const user = await UserServices.getUserById(decoded.userId);

  if (!user) {
    throw new NotFoundException("This user is not found!");
  }

  const newPayload = { userId: user.id, number: user.phone };
  const accessToken = createToken(
    newPayload,
    Env.JWT_ACCESS_SECRET,
    Env.JWT_ACCESS_EXPIRES_IN
  );
  const refreshToken = createToken(
    newPayload,
    Env.JWT_REFRESH_SECRET,
    Env.JWT_REFRESH_EXPIRES_IN,
    {},
    decoded.iat!
  );

  return {
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
  // checking if the user is exists
  const user = await UserServices.getUserById(userData.userId);

  if (!user) throw new NotFoundException("This user is not found!");

  const { status } = user;

  if (status === "suspended")
    throw new ForbiddenException("This user is suspended");
  if (status === "banned") throw new ForbiddenException("This user is banned");

  if (!(await bcrypt.compare(payload.oldPassword, user.password))) {
    throw new ForbiddenException("Password do not matched!");
  }

  // updating the password
  const saltRound = 10;
  const newHashPassword = await bcrypt.hash(payload.newPassword, saltRound);

  await UserServices.changeUserPassword(userData.userId, newHashPassword);

  return null;
};

const forgetPassword = async (phone: string) => {
  const user = await UserServices.getUserFromDB(phone);

  if (!user) throw new NotFoundException("This user is not found!");

  const { status } = user;

  if (status === "suspended")
    throw new ForbiddenException("This user is suspended");
  if (status === "banned") throw new ForbiddenException("This user is banned");

  if (!user.email)
    throw new UnauthorizedException("Email is not set for this user!");

  const jwtPayload = {
    userId: user.id,
    number: user.phone,
  };

  const resetToken = createToken(jwtPayload, Env.JWT_ACCESS_SECRET, "10m");

  const resetPasswordLink = `${Env.FRONTEND_ORIGIN}?id=${user.id}&token=${resetToken}`;

  sendEmail({
    to: user.email,
    subject: "Reset Your Password – ICL Finance",
    html: passwordResetEmailTemplate(resetPasswordLink, user.email),
    from: "ICL FINANCE <support@icl.finance>",
  });
};

const resetPassword = async (
  payload: { id: string; newPassword: string },
  token: string
) => {
  const user = await UserServices.getUserById(payload.id);

  if (!user) throw new NotFoundException("This user is not found!");

  const { status } = user;

  if (status === "suspended")
    throw new ForbiddenException("This user is suspended");
  if (status === "banned") throw new ForbiddenException("This user is banned");

  const decoded = jwt.verify(token, Env.JWT_ACCESS_SECRET) as JwtPayload;

  if (payload.id !== decoded?.userId)
    throw new UnauthorizedException(
      "Your are not authorized to reset password"
    );

  const saltRounds = 10;

  const newHashPassword = await bcrypt.hash(payload.newPassword, saltRounds);

  await UserServices.changeUserPassword(user.id, newHashPassword);
};

export const AuthServices = {
  registerUser,
  loginUser,
  refreshToken,
  changePassword,
  forgetPassword,
  resetPassword,
};
