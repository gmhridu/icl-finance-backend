import { index } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

export const plans = pgTable(
  "plans",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    name: t.varchar("name", { length: 255 }).notNull(),
    description: t.text("description"),
    price: t.integer("price").notNull(),
    durationDays: t.integer("duration_days").notNull(),
    dailyVideoLimit: t.integer("daily_video_limit").notNull(),
    rewardPerVideo: t.integer("reward_per_video").notNull(),
    referralBonus: t.integer("referral_bonus").notNull().default(0),
    isActive: t.boolean("is_active").notNull().default(false),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
    updatedAt: t
      .timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("idx_plans_active").on(table.isActive)]
);
