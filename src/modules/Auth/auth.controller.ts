import { Env } from "@/config/env.config";
import { HTTPSTATUS } from "@/config/http.config";
import { asyncHandler } from "@/middlewares/asyncHandler.middleware";
import { AuthServices } from "@/modules/Auth/auth.service";
import { UnauthorizedException } from "@/utils/app-error";
import sendResponse from "@/utils/sendResponse";
import ms from "ms";

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

export const AuthControllers = {
  registerUser,
  loginUser,
  refreshToken,
};
