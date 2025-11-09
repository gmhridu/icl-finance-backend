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

export const BankCardsValidations = {
  bankCardSchema,
};
