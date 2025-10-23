import postgres from "postgres";
import { Env } from "../env.config";
import { drizzle } from "drizzle-orm/postgres-js";

const queryClient = postgres(Env.DATABASE_URL!);
export const db = drizzle({ client: queryClient });
