export type TBankCard = {
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
