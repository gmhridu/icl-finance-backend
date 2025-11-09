import { db } from "@/config/db";
import { TBankCard } from "./bankCards.interface";
import { and, eq, ilike } from "drizzle-orm";
import { ConflictException } from "@/utils/app-error";
import { bankCards } from "@/drizzle";
import { maskAccountNumber, normalizeAccount } from "./bankCard.utils";

const addBankCard = async (payload: TBankCard) => {
  const normalized = normalizeAccount(payload.accountNumber);

  const existingCard = await db
    .select()
    .from(bankCards)
    .where(
      and(
        eq(bankCards.userId, payload.userId),
        eq(bankCards.bankName, payload.bankName),
        ilike(bankCards.accountNumber, normalized),
        eq(bankCards.isActive, true)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (existingCard) {
    throw new ConflictException(
      "This account number already exists for this bank type!"
    );
  }


  const bankCard = await db
    .insert(bankCards)
    .values({
      ...payload,
      accountNumber: normalized,
    })
    .returning()
    .then((r) => r[0]);

  const maskedBankCard = {
    ...bankCard,
    accountNumber: maskAccountNumber(bankCard.accountNumber, bankCard.bankName),
  };

  return maskedBankCard;
};

export const BankCardsServices = {
  addBankCard,
};


