import * as t from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { pgEnum } from "drizzle-orm/pg-core";
import { bankCards } from "./bankCards.schema";
import { adminUsers } from "./adminUsers.schema";
import { index } from "drizzle-orm/pg-core";

export const withdrawalRequestStatusEnum = pgEnum(
  "withdrawal_request_status",
  ["pending", "approved", "rejected", "processed", "cancelled", "refunded"]
);

export const withdrawalRequests = pgTable(
  "withdrawal_requests",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    userId: t
      .uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    amount: t.integer("amount").notNull(),
    bankCardId: t
      .uuid("bank_card_id")
      .references(() => bankCards.id, { onDelete: "set null" }),
    paymentMethod: t.varchar("payment_method", { length: 100 }),
    status: withdrawalRequestStatusEnum("status")
      .notNull()
      .default("pending"),
    adminNotes: t.text("admin_notes"),
    processedBy: t
      .uuid("processed_by")
      .references(() => adminUsers.id, { onDelete: "set null" }),
    processedAt: t.timestamp("processed_at"),
    transactionId: t.varchar("transaction_id", { length: 128 }),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
    updatedAt: t
      .timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_withdrawal_requests_user_id").on(table.userId),
    index("idx_withdrawal_requests_status").on(table.status),
    index("idx_withdrawal_requests_processed_at").on(table.processedAt),
  ]
);
