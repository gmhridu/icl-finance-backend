import * as jwt from "jsonwebtoken";
import type { JwtPayload, SignOptions, Secret } from "jsonwebtoken";

export const createToken = (
  jwtPayload: { userId: string; number: string },
  secret: Secret,
  expiresIn: SignOptions["expiresIn"]
) => {
  const options: SignOptions = {
    expiresIn,
  };
  return jwt.sign(jwtPayload, secret, options);
};

export const verifyToken = (token: string, secret: Secret) => {
  return jwt.verify(token, secret) as JwtPayload;
};
