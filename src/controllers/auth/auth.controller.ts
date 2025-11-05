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

  sendResponse(res, {
    status: HTTPSTATUS.OK,
    success: true,
    message: "User Logged In Successfully",
    data: result,
  });
});

export const authControllers = {
  registerUser,
  loginUser,
};
