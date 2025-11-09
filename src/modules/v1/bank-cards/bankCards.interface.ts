export type TBankCard = {
  id: string;
  userId: string;
  cardHolderName: string;
  bankName: "JAZZCASH" | "EASYPaisa" | "USDT_TRC20";
  accountNumber: string;
  isActive: boolean;
  isPrimary: boolean;
};

export type TMaskAccountNumber = {
  accountNumber: string;
  bankName: string;
};

export type TBankCardWithUser = {
  id: string;
  userId: string;
  cardHolderName: string;
  bankName: "JAZZCASH" | "EASYPaisa" | "USDT_TRC20";
  accountNumber: string;
  isActive: boolean;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
  // From users table
  userName: string | null;
  userPhone: string | null;
};

export type TEditBankCardPayload = {
  cardId: string;
  userId: string;
  cardHolderName?: string;
  accountNumber?: string;
};
