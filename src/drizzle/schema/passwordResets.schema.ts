import * as t from "drizzle-orm/pg-core";

import { pgTable } from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { index } from "drizzle-orm/pg-core";

export const passwordResets = pgTable(
  "password_resets",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    userId: t
      .uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: t.varchar("token", { length: 255 }).notNull().unique(),
    expiresAt: t.timestamp("expires_at").notNull(),
    used: t.boolean("used").notNull().default(false),
    usedAt: t.timestamp("used_at"),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
    updatedAt: t
      .timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_password_resets_user_id").on(table.userId),
    index("idx_password_resets_token").on(table.token),
    index("idx_password_resets_expires_at").on(table.expiresAt),
  ]
);
