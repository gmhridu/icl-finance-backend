import * as schema from '@/drizzle/schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

export type DrizzleDB = PostgresJsDatabase<typeof schema>;

declare global {
  namespace Express {
    export interface Request {
      user?: typeof schema.users.$inferSelect;
    }
  }
}
