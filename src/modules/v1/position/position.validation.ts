import z from "zod";

const upgradePositionValidationSchema = z.object({
  body: z.object({
    targetPositionId: z.string({
      message: "Target position ID is required"
    }),
    depositAmount: z.number({
      message: "Deposit amount is required"
    }).min(0, { message: "Deposit amount must be a positive number" })
  })
});

export const PositionValidations = {
  upgradePositionValidationSchema
};