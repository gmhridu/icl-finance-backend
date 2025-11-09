import { db } from "@/config/db";
import {
  TBankCard,
  TBankCardWithUser,
  TEditBankCardPayload,
} from "./bankCards.interface";
import { and, eq, ilike, ne } from "drizzle-orm";
import { ConflictException, NotFoundException } from "@/utils/app-error";
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

const editBankCard = async (
  payload: TEditBankCardPayload
): Promise<TBankCardWithUser> => {
  const { cardId, userId, cardHolderName, accountNumber } = payload;

  // check is card is exist
  const existingCard = await db
    .select({
      id: bankCards.id,
      userId: bankCards.userId,
      bankName: bankCards.bankName,
      currentAccountNumber: bankCards.accountNumber,
    })
    .from(bankCards)
    .where(
      and(
        eq(bankCards.id, cardId),
        eq(bankCards.userId, userId),
        eq(bankCards.isActive, true)
      )
    )
    .limit(1)
    .then((r) => r[0]);

  if (!existingCard)
    throw new NotFoundException("Bank card not found or access denied");

  const updateData: Partial<typeof bankCards.$inferInsert> = {};

  if (cardHolderName !== undefined) {
    updateData.cardHolderName = cardHolderName.trim();
  }

  let normalizedNewAccount: string | undefined;

  if (accountNumber !== undefined) {
    normalizedNewAccount = normalizeAccount(accountNumber);
  }

  // Skip conflict check if account number didn't change
  if (normalizedNewAccount !== existingCard.currentAccountNumber) {
    // Check conflict: same account + same bank + active

    const existingCardWithSameAccount = await db
      .select()
      .from(bankCards)
      .where(
        and(
          eq(bankCards.userId, userId),
          eq(bankCards.bankName, existingCard.bankName),
          ilike(bankCards.accountNumber, normalizedNewAccount as string),
          ne(bankCards.id, cardId)
        )
      )
      .limit(1)
      .then((r) => r[0]);

    if (existingCardWithSameAccount) {
      throw new ConflictException(
        `This account number is already used with ${existingCard.bankName}`
      );
    }

    updateData.accountNumber = normalizedNewAccount;
  }

  const updated = await db
    .update(bankCards)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(bankCards.id, cardId))
    .returning()
    .then((r) => r[0]);

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
    .where(eq(bankCards.id, updated.id))
    .limit(1)
    .then((r) => r[0]);

  if (!result) throw new NotFoundException("Card not found after updated");

  return {
    ...result,
    accountNumber: maskAccountNumber(result.accountNumber, result.bankName),
  };
};

const deleteBankCard = async (userId: string, cardId: string) => {
  const result = await db
    .delete(bankCards)
    .where(
      and(
        eq(bankCards.userId, userId),
        eq(bankCards.id, cardId),
        eq(bankCards.isActive, true)
      )
    )
    .returning()
    .then((r) => r[0]);

  if (!result)
    throw new NotFoundException("Bank card not found or access denied");
  return result;
};

export const BankCardsServices = {
  addBankCard,
  getUserBankCards,
  getBankAccountById,
  editBankCard,
  deleteBankCard,
};
