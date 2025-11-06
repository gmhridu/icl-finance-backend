import { getEnv } from "../utils/get-env";
import ms, { type StringValue } from "ms";

const validateMs = (key: string, value: string): number => {
  const milliseconds = ms(value as StringValue);
  if (isNaN(milliseconds)) {
    throw new Error(
      `Invalid ${key}: "${value}" is not a valid duration (e.g. 5m, 7d)`
    );
  }
  return milliseconds;
};

export const Env = {
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: getEnv("PORT", "5000"),
  DATABASE_URL: getEnv("DATABASE_URL"),
  JWT_ISSUER: getEnv("JWT_ISSUER", "iclfinance"),
  JWT_AUDIENCE: getEnv("JWT_AUDIENCE", "iclfinanceapi"),
  JWT_ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),

  // Store raw strings
  JWT_ACCESS_EXPIRES_IN: getEnv("JWT_ACCESS_EXPIRES_IN", "15m"),
  JWT_REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN", "7d"),

  FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN", "http://localhost:3000"),

  // Convert to ms **once**
  JWT_ACCESS_EXPIRES_IN_MS: validateMs(
    "JWT_ACCESS_EXPIRES_IN",
    getEnv("JWT_ACCESS_EXPIRES_IN", "15m")
  ),
  JWT_REFRESH_EXPIRES_IN_MS: validateMs(
    "JWT_REFRESH_EXPIRES_IN",
    getEnv("JWT_REFRESH_EXPIRES_IN", "7d")
  ),
  BACKEND_URL: getEnv("BACKEND_URL", "http://localhost:5000"),

  RESEND_API_KEY: getEnv("RESEND_API_KEY", "re_xxxxxxxxx"),
} as const;
