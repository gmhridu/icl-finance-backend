import * as t from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { referralLevelEnum } from "./referrals.schema";
import { index } from "drizzle-orm/pg-core";

export const taskManagementBonuses = pgTable(
  "task_management_bonuses",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    userId: t
      .uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subordinateId: t
      .uuid("subordinate_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    subordinateLevel: referralLevelEnum("subordinate_level").notNull(),
    bonusAmount: t.integer("bonus_amount").notNull(),
    taskDate: t.timestamp("task_date").notNull(),
    taskIncome: t.integer("task_income"),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_task_bonuses_user_id").on(table.userId),
    index("idx_task_bonuses_subordinate_id").on(table.subordinateId),
    index("idx_task_bonuses_task_date").on(table.taskDate),
  ]
);
