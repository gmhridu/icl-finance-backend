import { Env } from "@/config/env.config";
import { HTTPSTATUS } from "@/config/http.config";
import { asyncHandler } from "@/middlewares/asyncHandler.middleware";
import { authServices } from "@/services/auth/auth.service";
import sendResponse from "@/utils/sendResponse";

const registerUser = asyncHandler(async (req, res) => {
  const result = await authServices.registerUser(req.body);

  sendResponse(res, {
    status: HTTPSTATUS.CREATED,
    success: true,
    message: "User Registered Successfully",
    data: result,
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const result = await authServices.loginUser(req.body);

  const { refreshToken, accessToken } = result;

  res.cookie("refreshToken", refreshToken, {
    secure: Env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
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
  const { refreshToken } = req.cookies;

  const result = await authServices.refreshToken(refreshToken);

  sendResponse(res, {
    status: HTTPSTATUS.OK,
    success: true,
    message: "Access token is retrieved succesfully!",
    data: result,
  });
});

export const authControllers = {
  registerUser,
  loginUser,
  refreshToken,
};
