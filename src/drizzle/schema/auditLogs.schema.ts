import * as t from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { adminUsers } from "./adminUsers.schema";
import { pgEnum } from "drizzle-orm/pg-core";
import { index } from "drizzle-orm/pg-core";

export const auditActionEnum = pgEnum("audit_action", [
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "LOGOUT",
  "SYSTEM_CHANGE",
]);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    action: auditActionEnum("action").notNull(),
    description: t.text("description").notNull(),
    details: t.jsonb("details"),
    adminId: t
      .uuid("admin_id")
      .references(() => adminUsers.id, { onDelete: "set null" }),
    targetId: t.uuid("target_id"),
    targetType: t.varchar("target_type", { length: 100 }),
    ipAddress: t.varchar("ip_address", { length: 100 }),
    userAgent: t.text("user_agent"),
    createdAt: t
      .timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_audit_logs_admin_id").on(table.adminId),
    index("idx_audit_logs_action").on(table.action),
    index("idx_audit_logs_created_at").on(table.createdAt),
    index("idx_audit_logs_target").on(table.targetType, table.targetId),
  ]
);
