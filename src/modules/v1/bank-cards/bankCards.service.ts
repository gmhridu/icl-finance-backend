import { db } from "@/config/db";
import { TBankCard, TBankCardWithUser } from "./bankCards.interface";
import { and, eq, ilike } from "drizzle-orm";
import { ConflictException } from "@/utils/app-error";
import { bankCards, users } from "@/drizzle";
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

const getUserBankCards = async (
  userId: string
): Promise<TBankCardWithUser[]> => {
  const cards = await db
    .select({
      id: bankCards.id,
      userId: bankCards.userId,
      cardHolderName: bankCards.cardHolderName,
      bankName: bankCards.bankName,
      accountNumber: bankCards.accountNumber,
      isActive: bankCards.isActive,
      isPrimary: bankCards.isPrimary,
      createdAt: bankCards.createdAt,
      updatedAt: bankCards.updatedAt,
      userName: users.name,
      userPhone: users.phone,
    })
    .from(bankCards)
    .leftJoin(users, eq(bankCards.userId, users.id))
    .where(and(eq(bankCards.userId, userId), eq(bankCards.isActive, true)));

  return cards.map((card) => ({
    ...card,
    accountNumber: maskAccountNumber(card.accountNumber, card.bankName),
  }));
};

const getBankAccountById = async (payload: {
  userId: string;
  cardId: string;
}): Promise<TBankCardWithUser | null> => {
  const result = await db
    .select({
      id: bankCards.id,
      userId: bankCards.userId,
      cardHolderName: bankCards.cardHolderName,
      bankName: bankCards.bankName,
      accountNumber: bankCards.accountNumber,
      isActive: bankCards.isActive,
      isPrimary: bankCards.isPrimary,
      createdAt: bankCards.createdAt,
      updatedAt: bankCards.updatedAt,
      userName: users.name,
      userPhone: users.phone,
    })
    .from(bankCards)
    .leftJoin(users, eq(bankCards.userId, users.id))
    .where(
      and(
        eq(bankCards.id, payload.cardId),
        eq(bankCards.userId, payload.userId),
        eq(bankCards.isActive, true)
      )
    )
    .limit(1)
    .then((rows) => rows[0] || null);

  if (!result) {
    return null;
  }

  return {
    ...result,
    accountNumber: maskAccountNumber(result.accountNumber, result.bankName),
  };
};

export const BankCardsServices = {
  addBankCard,
  getUserBankCards,
  getBankAccountById,
};
