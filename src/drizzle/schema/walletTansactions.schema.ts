import { pgEnum } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { index } from "drizzle-orm/pg-core";

export const transactionTypeEnum = pgEnum("transaction_type", [
  "credit",
  "debit",
  "position_deposit",
  "referral_reward_a",
  "referral_reward_b",
  "referral_reward_c",
  "management_bonus_a",
  "management_bonus_b",
  "management_bonus_c",
  "task_income",
  "topup_bonus",
  "special_commission",
  "security_refund",
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
  "pending",
  "completed",
  "failed",
]);

export const walletTransactions = pgTable(
  "wallet_transactions",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    userId: t
      .uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: transactionTypeEnum("type").notNull(),
    amount: t.integer("amount").notNull(),
    balanceAfter: t.integer("balance_after").notNull(),
    description: t.text("description"),
    referenceId: t.varchar("reference_id", { length: 128 }).unique(),
    status: transactionStatusEnum("status").notNull().default("completed"),
    metadata: t.jsonb("metadata"),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
    updatedAt: t
      .timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_wallet_tx_user_id").on(table.userId),
    index("idx_wallet_tx_type").on(table.type),
    index("idx_wallet_tx_reference").on(table.referenceId),
    index("idx_wallet_tx_status").on(table.status),
    index("idx_wallet_tx_created_at").on(table.createdAt),
  ]
);
