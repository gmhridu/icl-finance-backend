import * as t from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { pgEnum } from "drizzle-orm/pg-core";
import { adminUsers } from "./adminUsers.schema";
import { index } from "drizzle-orm/pg-core";

export const securityRefundStatusEnum = pgEnum("security_refund_status", [
  "pending",
  "approved",
  "rejected",
]);

export const securityRefundRequests = pgTable(
  "security_refund_requests",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    userId: t
      .uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    fromLevel: t.integer("from_level").notNull(),
    toLevel: t.integer("to_level").notNull(),
    refundAmount: t.integer("refund_amount").notNull(),
    status: securityRefundStatusEnum("status").notNull().default("pending"),
    requestNote: t.text("request_note"),
    adminNotes: t.text("admin_notes"),
    processedBy: t
      .uuid("processed_by")
      .references(() => adminUsers.id, { onDelete: "set null" }),
    processedAt: t.timestamp("processed_at"),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
    updatedAt: t
      .timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_security_refund_user_id").on(table.userId),
    index("idx_security_refund_status").on(table.status),
  ]
);
