import * as t from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { pgEnum } from "drizzle-orm/pg-core";
import { adminUsers } from "./adminUsers.schema";
import { index } from "drizzle-orm/pg-core";

export const logLevelEnum = pgEnum("log_level", [
  "debug",
  "info",
  "warn",
  "error",
  "fatal",
]);

export const systemLogs = pgTable(
  "system_logs",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    level: logLevelEnum("level").notNull(),
    component: t.varchar("component", { length: 255 }),
    message: t.text("message").notNull(),
    error: t.text("error"),
    metadata: t.jsonb("metadata"),
    description: t.text("description"),
    adminId: t
      .uuid("admin_id")
      .references(() => adminUsers.id, { onDelete: "set null" }),
    userId: t
      .uuid("user_id")
      .references(() => users.id, { onDelete: "set null" }),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
    updatedAt: t
      .timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_system_logs_level").on(table.level),
    index("idx_system_logs_component").on(table.component),
    index("idx_system_logs_user_id").on(table.userId),
    index("idx_system_logs_created_at").on(table.createdAt),
  ]
);
