import bcrypt from "bcrypt";
import { TRegisterUser } from "@/@types/auth/auth.interface";
import { ConflictException, InternalServerException } from "@/utils/app-error";
import { userServices } from "../user/user.service";

const registerUser = async (payload: TRegisterUser) => {
  try {
    const user = await userServices.getUserFromDB(payload.phone, payload.email);

    if (user) {
      throw new ConflictException("Email or Phone Number already exists!");
    }

    const saltRound = 10;
    const hashPassword = await bcrypt.hash(payload.password, saltRound);

    const [newUser] = await userServices.createUser({
      ...payload,
      password: hashPassword,
    });

    return newUser;
  } catch (error) {
    throw new InternalServerException("Internal server error");
  }
};

export const authServices = {
  registerUser,
};
