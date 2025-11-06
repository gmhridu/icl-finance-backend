import { Env } from "@/config/env.config";
import { HTTPSTATUS } from "@/config/http.config";
import { asyncHandler } from "@/middlewares/asyncHandler.middleware";
import { AuthServices } from "@/modules/Auth/auth.service";
import { IJwtPayload } from "@/modules/Auth/auth.utils";
import { UnauthorizedException } from "@/utils/app-error";
import sendResponse from "@/utils/sendResponse";
import Logger from "@/utils/logger";

const registerUser = asyncHandler(async (req, res) => {
  Logger.info("User registration attempt", { email: req.body.email });
  
  const result = await AuthServices.registerUser(req.body);

  Logger.info("User registered successfully", { userId: result.id, email: req.body.email });

  sendResponse(res, {
    status: HTTPSTATUS.CREATED,
    success: true,
    message: "User Registered Successfully",
    data: result,
  });
});

const loginUser = asyncHandler(async (req, res) => {
  Logger.info("User login attempt", { email: req.body.email });
  
  const result = await AuthServices.loginUser(req.body);

  const { refreshToken, accessToken } = result;

  res.cookie("refreshToken", refreshToken, {
    secure: Env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: Env.JWT_REFRESH_EXPIRES_IN_MS,
  });

  Logger.info("User logged in successfully");

  sendResponse(res, {
    status: HTTPSTATUS.OK,
    success: true,
    message: "User Logged In Successfully",
    data: {
      accessToken,
    },
  });
});

const refreshToken = asyncHandler(async (req, res) => {
  const oldToken = req.cookies.refreshToken;

  if (!oldToken) throw new UnauthorizedException("No refresh token");

  Logger.info("Refresh token attempt");

  const { accessToken, refreshToken: newRefreshToken } =
    await AuthServices.refreshToken(oldToken);

  res.cookie("refreshToken", newRefreshToken, {
    secure: Env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: Env.JWT_REFRESH_EXPIRES_IN_MS,
  });

  Logger.info("Token refreshed successfully");

  sendResponse(res, {
    status: HTTPSTATUS.OK,
    success: true,
    message: "Access token is retrieved succesfully!",
    data: { accessToken },
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { ...passwordData } = req.body;

  Logger.info("Password change attempt");

  const result = await AuthServices.changePassword(req.user! as IJwtPayload, passwordData);

  Logger.info("Password changed successfully");

  sendResponse(res, {
    status: HTTPSTATUS.OK,
    success: true,
    message: "Password updated successfully!",
    data: result,
  });
});

export const AuthControllers = {
  registerUser,
  loginUser,
  refreshToken,
  changePassword,
};