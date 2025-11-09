import { Env } from "@/config/env.config";
import { HTTPSTATUS } from "@/config/http.config";
import { asyncHandler } from "@/middlewares/asyncHandler.middleware";
import { AuthServices } from "@/modules/v1/auth/auth.service";
import { UnauthorizedException } from "@/utils/app-error";
import sendResponse from "@/utils/sendResponse";
import Logger from "@/utils/logger";
import { IJwtPayload } from "../token/token.interface";

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
  Logger.info("User login attempt", { phone: req.body.phone });
  
  // Get IP address and user agent
  const ipAddress = req.ip || req.connection.remoteAddress || '';
  const userAgent = req.get('User-Agent') || '';

  const result = await AuthServices.loginUser(req.body, ipAddress, userAgent);

  const { refreshToken, accessToken } = result;

  res.cookie("__iclat__", accessToken, {
    secure: Env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: Env.JWT_ACCESS_EXPIRES_IN_MS,
  });

  res.cookie("__iclrt__", refreshToken, {
    secure: Env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: Env.JWT_REFRESH_EXPIRES_IN_MS,
  });

  Logger.info("User logged in successfully", { userId: result.user.id });

  sendResponse(res, {
    status: HTTPSTATUS.OK,
    success: true,
    message: "User Logged In Successfully",
    data: {
      accessToken,
      refreshToken,
    },
  });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const oldRefreshToken = req.cookies.__iclrt__;

  if (!oldRefreshToken) throw new UnauthorizedException("No refresh token");

  Logger.info("Refresh token attempt");

  // Get IP address and user agent
  const ipAddress = req.ip || req.connection.remoteAddress || '';
  const userAgent = req.get('User-Agent') || '';

  const { accessToken, refreshToken: newRefreshToken } =
    await AuthServices.refreshAccessToken(oldRefreshToken, ipAddress, userAgent);

  res.cookie("__iclat__", accessToken, {
    secure: Env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: Env.JWT_ACCESS_EXPIRES_IN_MS,
  });

  res.cookie("__iclrt__", newRefreshToken, {
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

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.__iclrt__;

  if (refreshToken) {
    await AuthServices.logout(refreshToken);
  }

  res.clearCookie("__iclrt__");
  res.clearCookie("__iclat__");

  Logger.info("User logged out successfully");

  sendResponse(res, {
    status: HTTPSTATUS.OK,
    success: true,
    message: "Logged out successfully",
    data: null,
  });
});

export const AuthControllers = {
  registerUser,
  loginUser,
  refreshAccessToken,
  changePassword,
  logout,
};