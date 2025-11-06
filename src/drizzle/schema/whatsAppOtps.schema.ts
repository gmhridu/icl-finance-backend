import * as t from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { index } from "drizzle-orm/pg-core";

export const whatsappOtps = pgTable(
  "whatsapp_otps",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    userId: t
      .uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    phone: t.varchar("phone", { length: 30 }).notNull(),
    otp: t.varchar("otp", { length: 16 }).notNull(),
    expiresAt: t.timestamp("expires_at").notNull(),
    used: t.boolean("used").notNull().default(false),
    usedAt: t.timestamp("used_at"),
    attempts: t.integer("attempts").notNull().default(0),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
    updatedAt: t
      .timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_whatsapp_otps_phone").on(table.phone),
    index("idx_whatsapp_otps_user_id").on(table.userId),
    index("idx_whatsapp_otps_expires_at").on(table.expiresAt),
  ]
);
