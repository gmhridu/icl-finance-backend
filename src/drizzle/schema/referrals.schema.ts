import { pgTable } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { index } from "drizzle-orm/pg-core";
import { unique } from "drizzle-orm/pg-core";

export const referralLevelEnum = pgEnum("referral_level", [
  "A_LEVEL",
  "B_LEVEL",
  "C_LEVEL",
]);

export const referralActivities = pgTable(
  "referral_activities",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    referrerId: t
      .uuid("referrer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    referredUserId: t
      .uuid("referred_user_id")
      .references(() => users.id, { onDelete: "cascade" }),
    referralCode: t.varchar("referral_code", { length: 64 }),
    ipAddress: t.varchar("ip_address", { length: 100 }),
    userAgent: t.text("user_agent"),
    source: t.varchar("source", { length: 100 }),
    rewardAmount: t.integer("reward_amount").default(0),
    rewardPaidAt: t.timestamp("reward_paid_at"),
    qualifiedAt: t.timestamp("qualified_at"),
    metadata: t.jsonb("metadata"),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
    updatedAt: t
      .timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_referral_activities_referrer").on(table.referrerId),
    index("idx_referral_activities_referred").on(table.referredUserId),
    index("idx_referral_activities_code").on(table.referralCode),
  ]
);

export const referralHierarchy = pgTable(
  "referral_hierarchy",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    level: referralLevelEnum("level").notNull(),
    referrerActivityId: t
      .uuid("referrer_activity_id")
      .notNull()
      .references(() => referralActivities.id, { onDelete: "cascade" }),
    userId: t
      .uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    unique("uq_referral_hierarchy_referrer_user").on(
      table.referrerActivityId,
      table.userId
    ),
    index("idx_referral_hierarchy_user").on(table.userId),
    index("idx_referral_hierarchy_activity").on(table.referrerActivityId),
  ]
);
