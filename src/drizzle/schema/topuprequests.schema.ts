import { pgEnum } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { adminWallets } from "./adminWallets.schema";
import { adminUsers } from "./adminUsers.schema";
import { index } from "drizzle-orm/pg-core";

export const topupRequestStatusEnum = pgEnum("topup_request_status", [
  "pending",
  "approved",
  "rejected",
]);

export const topupRequests = pgTable(
  "topup_requests",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    userId: t
      .uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    amount: t.integer("amount").notNull(),
    selectedWalletId: t.uuid("selected_wallet_id").references(
      () => adminWallets.id,
      { onDelete: "set null" }
    ),
    paymentProof: t.varchar("payment_proof", { length: 1024 }),
    status: topupRequestStatusEnum("status").notNull().default("pending"),
    adminNotes: t.text("admin_notes"),
    processedBy: t
      .uuid("processed_by")
      .references(() => adminUsers.id, { onDelete: "set null" }),
    processedAt: t.timestamp("processed_at"),
    transactionId: t.varchar("transaction_id", { length: 128 }).unique(),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
    updatedAt: t
      .timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_topup_requests_user_id").on(table.userId),
    index("idx_topup_requests_status").on(table.status),
    index("idx_topup_requests_processed_at").on(table.processedAt),
  ]
);
