import { pgEnum } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";
import { users } from "./users.schema";
import { index } from "drizzle-orm/pg-core";

export const bankTypeEnum = pgEnum("bank_type", [
  "JAZZCASH",
  "EASYPaisa",
  "USDT_TRC20",
]);

export const bankCards = pgTable(
  "bank_cards",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    userId: t
      .uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    cardHolderName: t.varchar("card_holder_name", { length: 255 }).notNull(),
    bankName: bankTypeEnum("bank_name").notNull(),
    accountNumber: t.varchar("account_number", { length: 100 }).notNull(),
    isActive: t.boolean("is_active").notNull().default(true),
    isPrimary: t.boolean("is_primary").notNull().default(false),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
    updatedAt: t
      .timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_bank_cards_user_id").on(table.userId),
    index("idx_bank_cards_active").on(table.isActive),
  ]
);
