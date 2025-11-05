import { index } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import * as t from "drizzle-orm/pg-core";

export const positionLevels = pgTable(
  "position_levels",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    name: t.varchar("name", { length: 250 }).notNull().unique(),
    level: t.integer("level").unique().notNull(),
    deposit: t.integer("deposit").notNull(),
    tasksPerDay: t.integer("tasks_per_day").notNull(),
    unitPrice: t.integer("unit_price").notNull(),
    isActive: t.boolean("is_active").notNull().default(true),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
    updatedAt: t
      .timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_position_levels_level").on(table.level),
    index("idx_position_levels_active").on(table.isActive),
  ]
);
