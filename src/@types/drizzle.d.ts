import * as schema from '@/drizzle/schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { IJwtPayload } from '@/modules/v1/auth/auth.utils';

export type DrizzleDB = PostgresJsDatabase<typeof schema>;

declare global {
  namespace Express {
    export interface Request {
      user?: IJwtPayload;
    }
  }
}