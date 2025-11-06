import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import { Env } from "@/config/env.config";
import { handleJwtError } from "@/utils/app-error";
import { encrypt } from "@/utils/encrypt";

/* ---------- Payload ----------
   state = encrypted lastUsed timestamp (string)
*/
export interface IJwtPayload {
  userId: string;
  number: string;
  state: string;         // encrypted timestamp
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

/* ---------- Create Token (with encrypted state) ---------- */
export const createToken = (
  payload: Omit<IJwtPayload, "state">,
  secret: string,
  expiresIn: number | string,
  extra: Partial<SignOptions> = {},
  lastUsed: number = 0
): string => {
  const state = encrypt(lastUsed.toString()); // lastUsed timestamp

  return jwt.sign(
    { ...payload, state },
    secret,
    {
      algorithm: "HS256",
      issuer: Env.JWT_ISSUER,
      audience: Env.JWT_AUDIENCE,
      expiresIn,
      ...extra,
    } as SignOptions
  );
};

/* ---------- Verify Token (throws AppError) ---------- */
export const verifyToken = (
  token: string,
  secret: string,
  options: VerifyOptions = {}
): IJwtPayload => {
  try {
    const verifyOpts: VerifyOptions = {
      algorithms: ["HS256"],
      issuer: Env.JWT_ISSUER,
      audience: Env.JWT_AUDIENCE,
      ...options,
    };

    return jwt.verify(token, secret, verifyOpts) as IJwtPayload;
  } catch (err) {
    throw handleJwtError(err);
  }
};
