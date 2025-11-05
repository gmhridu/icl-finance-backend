import * as schema from '@/drizzle/schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

export type DrizzleDB = PostgresJsDatabase<typeof schema>;
