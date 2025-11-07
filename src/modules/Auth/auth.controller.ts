import { Env } from "@/config/env.config";
import { HTTPSTATUS } from "@/config/http.config";
import { asyncHandler } from "@/middlewares/asyncHandler.middleware";
import { AuthServices } from "@/modules/Auth/auth.service";
import { IJwtPayload } from "@/modules/Auth/auth.utils";
import { UnauthorizedException } from "@/utils/app-error";
import sendResponse from "@/utils/sendResponse";

const registerUser = asyncHandler(async (req, res) => {
  const result = await AuthServices.registerUser(req.body);

  sendResponse(res, {
    status: HTTPSTATUS.CREATED,
    success: true,
    message: "User Registered Successfully",
    data: result,
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const result = await AuthServices.loginUser(req.body);

  const { refreshToken, accessToken } = result;

  res.cookie("refreshToken", refreshToken, {
    secure: Env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: Env.JWT_REFRESH_EXPIRES_IN_MS,
  });

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

  const { accessToken, refreshToken: newRefreshToken } =
    await AuthServices.refreshToken(oldToken);

  res.cookie("refreshToken", newRefreshToken, {
    secure: Env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: Env.JWT_REFRESH_EXPIRES_IN_MS,
  });

  sendResponse(res, {
    status: HTTPSTATUS.OK,
    success: true,
    message: "Access token is retrieved succesfully!",
    data: { accessToken },
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { ...passwordData } = req.body;

  const result = await AuthServices.changePassword(
    req.user! as IJwtPayload,
    passwordData
  );

  sendResponse(res, {
    status: HTTPSTATUS.OK,
    success: true,
    message: "Password updated successfully!",
    data: result,
  });
});

const forgetPassword = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  const result = await AuthServices.forgetPassword(phone);

  sendResponse(res, {
    status: HTTPSTATUS.OK,
    success: true,
    message: "Password reset link is sent to your email!",
    data: result,
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const token = req.headers.authorization;

  const result = await AuthServices.resetPassword(req.body, token as string);

  sendResponse(res, {
    status: HTTPSTATUS.OK,
    success: true,
    message: "Password reset successfully!",
    data: result,
  });
});

const getMe = asyncHandler(async (req, res) => {
  const id = (req.user! as IJwtPayload)?.userId;

  const result = await AuthServices.getMe(id as string);

  sendResponse(res, {
    status: HTTPSTATUS.OK,
    success: true,
    message: "User Details retrieved successfully!",
    data: result,
  });
});

const logout = asyncHandler(async (req, res) => {
  const id = (req.user! as IJwtPayload)?.userId;
  await AuthServices.logout(id as string);

  res.clearCookie("refreshToken", {
    secure: Env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  });

  sendResponse(res, {
    status: HTTPSTATUS.OK,
    success: true,
    message: "User logged out successfully!",
    data: null,
  });
});

export const AuthControllers = {
  registerUser,
  loginUser,
  refreshToken,
  changePassword,
  forgetPassword,
  resetPassword,
  getMe,
  logout,
};
