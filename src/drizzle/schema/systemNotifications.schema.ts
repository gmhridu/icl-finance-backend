import * as t from "drizzle-orm/pg-core";
import { index } from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

export const notificationTypeEnum = pgEnum("notification_type", [
  "system_alert",
  "user_action",
  "withdrawal_request",
  "video_upload",
  "user_registration",
  "maintenance",
  "security_alert",
  "task_completed",
]);

export const notificationSeverityEnum = pgEnum("notification_severity", [
  "info",
  "warning",
  "error",
  "success",
]);

export const systemNotifications = pgTable(
  "system_notifications",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    type: notificationTypeEnum("type").notNull(),
    title: t.varchar("title", { length: 500 }).notNull(),
    message: t.text("message"),
    severity: notificationSeverityEnum("severity").notNull().default("info"),
    metadata: t.jsonb("metadata"),
    actionUrl: t.varchar("action_url", { length: 1024 }),
    targetId: t.varchar("target_id", { length: 255 }),
    targetType: t.varchar("target_type", { length: 100 }),
    isRead: t.boolean("is_read").notNull().default(false),
    readAt: t.timestamp("read_at"),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_system_notifications_type").on(table.type),
    index("idx_system_notifications_is_read").on(table.isRead),
    index("idx_system_notifications_created_at").on(table.createdAt),
  ]
);
