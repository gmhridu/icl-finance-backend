import { defineConfig } from "drizzle-kit";
import { Env } from "./src/config/env.config";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schemas/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: Env.DATABASE_URL!,
  },
});
