import * as t from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { index } from "drizzle-orm/pg-core";
import { adminUsers } from "./adminUsers.schema";

export const activityLogs = pgTable(
  "activity_logs",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    activity: t.varchar("activity", { length: 255 }),
    description: t.text("description"),
    metadata: t.jsonb("metadata"),
    ipAddress: t.varchar("ip_address", { length: 100 }),
    sessionId: t.varchar("session_id", { length: 255 }),
    userAgent: t.text("user_agent"),
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
    index("idx_activity_logs_user_id").on(table.userId),
    index("idx_activity_logs_admin_id").on(table.adminId),
    index("idx_activity_logs_created_at").on(table.createdAt),
    index("idx_activity_logs_activity").on(table.activity),
  ]
);
