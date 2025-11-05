import { relations } from "drizzle-orm";
import * as t from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { auditLogs } from "./auditLogs.schema";
import { index } from "drizzle-orm/pg-core";

export const adminRoleEnum = pgEnum("admin_role_enum", [
  "ADMIN",
  "SUPER_ADMIN",
]);

export const adminUsers = pgTable(
  "admin_users",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    name: t.varchar("name", { length: 255 }).notNull(),
    email: t.varchar("email", { length: 255 }).notNull().unique(),
    password: t.text("password").notNull(),
    role: adminRoleEnum("role").notNull().default("ADMIN"),
    phone: t.varchar("phone", { length: 20 }).notNull().unique(),
    isActive: t.boolean("is_active").notNull().default(true),
    lastLogin: t.timestamp("last_login", { withTimezone: true }),
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
    index("idx_admin_users_email").on(table.email),
    index("idx_admin_users_role").on(table.role),
  ]
);

