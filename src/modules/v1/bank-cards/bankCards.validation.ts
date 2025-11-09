import z from "zod";

const bankCardSchema = z.object({
  body: z.object({
    cardHolderName: z
      .string()
      .min(3, { message: "Name must be at least 3 characters long!" }),
    bankName: z.enum(["JAZZCASH", "EASYPaisa", "USDT_TRC20"]),
    accountNumber: z.string().min(10, {
      message: "Account number must be at least 10 characters long!",
    }),
  }),
});

const editBankCardSchema = z.object({
  body: z.object({
    cardId: z.string().optional(),
    cardHolderName: z
      .string()
      .min(3, { message: "Name must be at least 3 characters long!" })
      .optional(),
    accountNumber: z
      .string()
      .min(10, {
        message: "Account number must be at least 10 characters long!",
      })
      .optional(),
  }),
});

export const BankCardsValidations = {
  bankCardSchema,
  editBankCardSchema,
};
