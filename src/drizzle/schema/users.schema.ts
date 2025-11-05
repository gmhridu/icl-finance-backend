import { pgEnum } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { positionLevels } from "./positionLevels.schema";
import { referralActivities } from "./referrals.schema";
import { announcements } from "./announcements.schema";
import { plans } from "./plans.schema";
import { index } from "drizzle-orm/pg-core";

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "suspended",
  "banned",
]);

export const planStatusEnum = pgEnum("plan_status", [
  "active",
  "expired",
  "cancelled",
]);

// ---------------- USERS ---------------- //

export const users = pgTable(
  "users",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    email: t.varchar("email", { length: 255 }).unique(),
    name: t.varchar("name", { length: 150 }),
    phone: t.varchar("phone", { length: 20 }).notNull().unique(),
    password: t.varchar("password", { length: 255 }).notNull(),
    emailVerified: t.boolean("email_verified").notNull().default(false),
    phoneVerified: t.boolean("phone_verified").notNull().default(false),
    referralCode: t.varchar("referral_code", { length: 64 }).unique(),
    referredBy: t.uuid("referred_by").references(() => users.id, {
      onDelete: "set null",
    }),
    status: userStatusEnum("status").notNull().default("active"),
    ipAddress: t.varchar("ip_address", { length: 100 }),
    deviceId: t.varchar("device_id", { length: 255 }),

    // Financial fields
    walletBalance: t.integer("wallet_balance").notNull().default(0),
    totalEarnings: t.integer("total_earnings").notNull().default(0),
    commissionBalance: t.integer("commission_balance").notNull().default(0),
    securityRefund: t.integer("security_refund").notNull().default(0),
    depositPaid: t.integer("deposit_paid").notNull().default(0),

    // Position fields
    positionLevelId: t
      .uuid("position_level_id")
      .references(() => positionLevels.id, { onDelete: "set null" }),
    currentPositionId: t
      .uuid("current_position_id")
      .references(() => positionLevels.id, { onDelete: "set null" }),
    previousPositionId: t
      .uuid("previous_position_id")
      .references(() => positionLevels.id, { onDelete: "set null" }),
    positionStartDate: t.timestamp("position_start_date"),
    positionEndDate: t.timestamp("position_end_date"),
    isIntern: t.boolean("is_intern").notNull().default(true),

    // Security fields
    fundPassword: t.varchar("fund_password", { length: 255 }),
    failedLoginAttempts: t
      .integer("failed_login_attempts")
      .notNull()
      .default(0),
    lastFailedLogin: t.timestamp("last_failed_login"),
    lockedUntil: t.timestamp("locked_until"),
    lastLoginAt: t.timestamp("last_login_at"),

    // Referral tracking
    referredByActivityId: t
      .uuid("referred_by_activity_id")
      .references(() => referralActivities.id, { onDelete: "set null" }),

    // Status
    isActive: t.boolean("is_active").notNull().default(true),

    // Timestamps
    signUpAt: t.timestamp("sign_up_at").notNull().defaultNow(),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
    updatedAt: t
      .timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_users_phone").on(table.phone),
    index("idx_users_email").on(table.email),
    index("idx_users_status").on(table.status),
    index("idx_users_referral_code").on(table.referralCode),
    index("idx_users_referred_by").on(table.referredBy),
    index("idx_users_position_level").on(table.positionLevelId),
  ]
);

export const userProfiles = pgTable(
  "user_profiles",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    userId: t
      .uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    realName: t.varchar("real_name", { length: 255 }),
    avatarUrl: t.varchar("avatar_url", { length: 512 }),
    bio: t.text("bio"),
    dateOfBirth: t.date("date_of_birth"),
    country: t.varchar("country", { length: 100 }),
    city: t.varchar("city", { length: 100 }),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
    updatedAt: t
      .timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("idx_user_profiles_user_id").on(table.userId)]
);

export const userOffers = pgTable(
  "user_offers",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    userId: t
      .uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    announcementId: t
      .uuid("announcement_id")
      .references(() => announcements.id, { onDelete: "set null" }),
    offerType: t.varchar("offer_type", { length: 100 }),
    offerValue: t.varchar("offer_value", { length: 255 }),
    offerCode: t.varchar("offer_code", { length: 100 }),
    description: t.text("description"),
    isRedeemed: t.boolean("is_redeemed").notNull().default(false),
    redeemedAt: t.timestamp("redeemed_at"),
    expiresAt: t.timestamp("expires_at"),
    scheduledAt: t.timestamp("scheduled_at"),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
    updatedAt: t
      .timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_user_offers_user_id").on(table.userId),
    index("idx_user_offers_expires_at").on(table.expiresAt),
    index("idx_user_offers_redeemed").on(table.isRedeemed),
  ]
);

export const userPlans = pgTable(
  "user_plans",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    userId: t
      .uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    planId: t
      .uuid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    amountPaid: t.integer("amount_paid").notNull(),
    startDate: t.timestamp("start_date").notNull(),
    endDate: t.timestamp("end_date").notNull(),
    status: planStatusEnum("status").notNull().default("active"),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
    updatedAt: t
      .timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_user_plans_user_id").on(table.userId),
    index("idx_user_plans_plan_id").on(table.planId),
    index("idx_user_plans_status").on(table.status),
  ]
);
