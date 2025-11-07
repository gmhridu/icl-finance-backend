import { pgTable } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { positionLevels } from "./positionLevels.schema";
import { users } from "./users.schema";
import { index } from "drizzle-orm/pg-core";
import { unique } from "drizzle-orm/pg-core";

export const videos = pgTable(
  "videos",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    title: t.varchar("title", { length: 500 }).notNull(),
    description: t.text("description"),
    url: t.varchar("url", { length: 1024 }).notNull(),
    thumbnailUrl: t.varchar("thumbnail_url", { length: 1024 }),
    duration: t.integer("duration").notNull(), // in seconds
    rewardAmount: t.integer("reward_amount"),
    isActive: t.boolean("is_active").notNull().default(true),
    availableFrom: t.timestamp("available_from"),
    availableTo: t.timestamp("available_to"),
    positionLevelId: t
      .uuid("position_level_id")
      .references(() => positionLevels.id, { onDelete: "set null" }),
    cloudinaryPublicId: t.varchar("cloudinary_public_id", { length: 255 }),
    tags: t.text("tags"),
    uploadMethod: t.varchar("upload_method", { length: 50 }).notNull().default("file"),
    viewCount: t.integer("view_count").notNull().default(0),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
    updatedAt: t
      .timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_videos_active").on(table.isActive),
    index("idx_videos_position_level").on(table.positionLevelId),
    index("idx_videos_available_from").on(table.availableFrom),
  ]
);

export const videoTasks = pgTable(
  "video_tasks",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    userId: t
      .uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    videoId: t
      .uuid("video_id")
      .notNull()
      .references(() => videos.id, { onDelete: "cascade" }),
    watchedAt: t.timestamp("watched_at").notNull().defaultNow(),
    watchDuration: t.integer("watch_duration"), // in seconds
    rewardEarned: t.integer("reward_earned"),
    positionLevel: t.varchar("position_level", { length: 100 }),
    ipAddress: t.varchar("ip_address", { length: 100 }),
    deviceId: t.varchar("device_id", { length: 255 }),
    isVerified: t.boolean("is_verified").notNull().default(false),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
    updatedAt: t
      .timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique("uq_video_tasks_user_video").on(table.userId, table.videoId),
    index("idx_video_tasks_user_id").on(table.userId),
    index("idx_video_tasks_video_id").on(table.videoId),
    index("idx_video_tasks_watched_at").on(table.watchedAt),
  ]
);
