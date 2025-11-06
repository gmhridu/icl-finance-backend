import * as t from "drizzle-orm/pg-core";
import { index } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

export const sliderImages = pgTable(
  "slider_images",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    url: t.varchar("url", { length: 1024 }).notNull(),
    altText: t.varchar("alt_text", { length: 255 }),
    order: t.integer("order").notNull().default(0),
    isActive: t.boolean("is_active").notNull().default(true),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
    updatedAt: t
      .timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_slider_images_active").on(table.isActive),
    index("idx_slider_images_order").on(table.order),
  ]
);
