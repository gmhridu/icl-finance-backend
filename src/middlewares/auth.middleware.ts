import jwt, { VerifyOptions } from "jsonwebtoken";
import { asyncHandler } from "@/middlewares/asyncHandler.middleware";
import { UnauthorizedException, ForbiddenException } from "@/utils/app-error";
import { Env } from "@/config/env.config";
import { UserServices } from "@/modules/v1/user/user.service";
import { IJwtPayload } from "@/modules/v1/token/token.interface";
import { tokenService } from "@/modules/v1/token/token.service";

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: IJwtPayload;
    }
  }
}

const auth = () => {
  return asyncHandler(async (req, _res, next) => {
    const accessToken = req.cookies?.__iclat__ || req.header("x-access-token");
    
    if (!accessToken) {
      throw new UnauthorizedException("Access token is required");
    }

    // Verify token
    let decoded: IJwtPayload;
    try {
      decoded = tokenService.verifyToken(accessToken, Env.JWT_ACCESS_SECRET) as IJwtPayload;
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        throw new UnauthorizedException("Access token has expired");
      }
      if (error.name === "JsonWebTokenError") {
        throw new UnauthorizedException("Invalid access token");
      }
      throw new UnauthorizedException("Authentication failed");
    }

    // Extract user ID from token
    const { userId } = decoded;

    // Fetch user from database
    const user = await UserServices.getUserById(userId);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    // Check if user account is active
    if (user.status === "suspended") {
      throw new ForbiddenException("This user account is suspended");
    }
    if (user.status === "banned") {
      throw new ForbiddenException("This user account is banned");
    }

    req.user = {
      userId,
      name: user.name,
      phone: user.phone,
      email: user.email,
      status: user.status,
    };

    return next();
  });
};

export default auth;