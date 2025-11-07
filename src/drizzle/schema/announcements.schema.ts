import { pgTable } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { adminUsers } from "./adminUsers.schema";
import { index } from "drizzle-orm/pg-core";
import { unique } from "drizzle-orm/pg-core";

export const announcements = pgTable(
  "announcements",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    title: t.varchar("title", { length: 500 }).notNull(),
    message: t.text("message"),
    imageUrl: t.varchar("image_url", { length: 1024 }),
    targetType: t.varchar("target_type", { length: 50 }).notNull().default("all"),
    targetId: t.varchar("target_id", { length: 255 }),
    scheduleType: t.varchar("schedule_type", { length: 50 }),
    scheduledAt: t.timestamp("scheduled_at"),
    expiresAt: t.timestamp("expires_at"),
    isActive: t.boolean("is_active").notNull().default(true),
    metadata: t.jsonb("metadata"),
    createdBy: t
      .uuid("created_by")
      .references(() => adminUsers.id, { onDelete: "set null" }),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
    updatedAt: t
      .timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_announcements_active").on(table.isActive),
    index("idx_announcements_scheduled_at").on(table.scheduledAt),
    index("idx_announcements_target").on(table.targetType),
  ]
);

export const userAnnouncements = pgTable(
  "user_announcements",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    userId: t
      .uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    announcementId: t
      .uuid("announcement_id")
      .notNull()
      .references(() => announcements.id, { onDelete: "cascade" }),
    isRead: t.boolean("is_read").notNull().default(false),
    readAt: t.timestamp("read_at"),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
    updatedAt: t
      .timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique("uq_user_announcements").on(table.userId, table.announcementId),
    index("idx_user_announcements_user_id").on(table.userId),
    index("idx_user_announcements_announcement_id").on(table.announcementId),
  ]
);
