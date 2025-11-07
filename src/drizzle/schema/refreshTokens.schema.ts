import { pgTable } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { index } from "drizzle-orm/pg-core";

export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    userId: t
      .uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: t.text("token").notNull().unique(),
    expiresAt: t.timestamp("expires_at").notNull(),
    used: t.boolean("used").notNull().default(false),
    usedAt: t.timestamp("used_at"),
    ipAddress: t.varchar("ip_address", { length: 100 }),
    userAgent: t.text("user_agent"),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
    updatedAt: t
      .timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_refresh_tokens_user_id").on(table.userId),
    index("idx_refresh_tokens_token").on(table.token),
    index("idx_refresh_tokens_expires_at").on(table.expiresAt),
    index("idx_refresh_tokens_used").on(table.used),
  ]
);