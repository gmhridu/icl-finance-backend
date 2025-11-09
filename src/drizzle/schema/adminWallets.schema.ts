import * as t from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";
import { index } from "drizzle-orm/pg-core";
import { bankTypeEnum } from "./bankCards.schema";

export const adminWallets = pgTable(
  "admin_wallets",
  {
    id: t.uuid("id").defaultRandom().primaryKey(),
    walletType: bankTypeEnum("wallet_type").notNull(),
    walletNumber: t.varchar("wallet_number", { length: 100 }),
    walletHolderName: t.varchar("wallet_holder_name", { length: 255 }),
    usdtWalletAddress: t.varchar("usdt_wallet_address", { length: 255 }),
    qrCodeUrl: t.varchar("qr_code_url", { length: 512 }),
    isActive: t.boolean("is_active").notNull().default(true),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
    updatedAt: t
      .timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_admin_wallets_type").on(table.walletType),
    index("idx_admin_wallets_active").on(table.isActive),
  ]
);
