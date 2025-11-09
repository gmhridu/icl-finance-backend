import { asyncHandler } from "@/middlewares/asyncHandler.middleware";
import { UserServices } from "@/modules/v1/user/user.service";
import { HTTPSTATUS } from "@/config/http.config";
import sendResponse from "@/utils/sendResponse";
import Logger from "@/utils/logger";
import { NotFoundException } from "@/utils/app-error";
import { Request } from "express";
import { IJwtPayload } from "../token/token.interface";

interface CustomRequest extends Request {
  user?: IJwtPayload;
}

const getProfile = asyncHandler(async (req: CustomRequest, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new NotFoundException("User not found");
  }

  Logger.info("Fetching user profile", { userId });

  const result = await UserServices.getUserProfile(userId);

  if (!result) {
    throw new NotFoundException("User not found");
  }

  sendResponse(res, {
    status: HTTPSTATUS.OK,
    success: true,
    message: "User profile retrieved successfully",
    data: result,
  });
});

const updateProfile = asyncHandler(async (req: CustomRequest, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new NotFoundException("User not found");
  }

  Logger.info("Updating user profile", { userId });

  const result = await UserServices.updateUser(userId, req.body);
  const user = result[0]; // Get the first item from the returning array

  sendResponse(res, {
    status: HTTPSTATUS.OK,
    success: true,
    message: "User profile updated successfully",
    data: user,
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  Logger.info("Fetching user by ID", { userId: id });

  const result = await UserServices.getUserProfile(id);

  if (!result) {
    throw new NotFoundException("User not found");
  }

  sendResponse(res, {
    status: HTTPSTATUS.OK,
    success: true,
    message: "User retrieved successfully",
    data: result,
  });
});

const getAllUsers = asyncHandler(async (req, res) => {
  Logger.info("Fetching all users");

  const result = await UserServices.getAllUsers();

  sendResponse(res, {
    status: HTTPSTATUS.OK,
    success: true,
    message: "Users retrieved successfully",
    data: result,
  });
});

export const UserControllers = {
  getProfile,
  updateProfile,
  getUserById,
  getAllUsers,
};
