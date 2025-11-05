import * as t from "drizzle-orm/pg-core";
import { index } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

export const settings = pgTable(
  "settings",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    key: t.varchar("key", { length: 255 }).notNull().unique(),
    value: t.text("value").notNull(),
    description: t.text("description"),
    category: t.varchar("category", { length: 100 }),
    isPublic: t.boolean("is_public").notNull().default(false),
    createdAt: t
      .timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: t
      .timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_settings_key").on(table.key),
    index("idx_settings_category").on(table.category),
  ]
);
