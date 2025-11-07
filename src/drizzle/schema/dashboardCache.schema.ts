import * as t from "drizzle-orm/pg-core";
import { index } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

export const dashboardCache = pgTable(
  "dashboard_cache",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    cacheKey: t.varchar("cache_key", { length: 255 }).notNull().unique(),
    data: t.jsonb("data").notNull(),
    expiresAt: t.timestamp("expires_at").notNull(),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
    updatedAt: t
      .timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_dashboard_cache_key").on(table.cacheKey),
    index("idx_dashboard_cache_expires_at").on(table.expiresAt),
  ]
);

