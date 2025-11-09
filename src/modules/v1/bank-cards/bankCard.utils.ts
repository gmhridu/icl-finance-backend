import { TMaskAccountNumber } from "./bankCards.interface";

export const maskAccountNumber = (
  accountNumber: string,
  bankName: string
): string => {
  if (bankName === "USDT_TRC20") {
    if (accountNumber.length <= 12) return accountNumber;
    return `${accountNumber.slice(0, 6)}******${accountNumber.slice(-6)}`;
  }

  // Mobile numbers: show first 4, last 4
  if (accountNumber.length <= 4) return accountNumber;
  const visible = 4;
  const masked = "*".repeat(Math.max(0, accountNumber.length - visible * 2));
  return `${accountNumber.slice(0, visible)}${masked}${accountNumber.slice(-visible)}`;
};

export const normalizeAccount = (acc: string): string => {
  return acc.replace(/[\s-]/g, "").trim();
};
