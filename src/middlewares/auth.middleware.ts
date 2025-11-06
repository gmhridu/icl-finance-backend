import jwt, { VerifyOptions } from "jsonwebtoken";
import { asyncHandler } from "@/middlewares/asyncHandler.middleware";
import { UnauthorizedException } from "@/utils/app-error";
import { Env } from "@/config/env.config";
import { UserServices } from "@/modules/User/user.service";
import { IJwtPayload } from "@/modules/Auth/auth.utils";

const auth = () => {
  return asyncHandler(async (req, _res, next) => {
    const token = req.headers.authorization;

    if (!token) throw new UnauthorizedException("You are not authorized!");

    let decoded: IJwtPayload;

    try {
      decoded = jwt.verify(token, Env.JWT_ACCESS_SECRET, {
        algorithms: ["HS256"],
      } as VerifyOptions) as IJwtPayload;
    } catch (error) {
      throw new UnauthorizedException("Invalid token!");
    }

    const { userId } = decoded;

    const user = await UserServices.getUserById(userId);

    if (!user) {
      throw new UnauthorizedException("User not found!");
    }

    req.user = decoded;

    return next();
  });
};

export default auth;
