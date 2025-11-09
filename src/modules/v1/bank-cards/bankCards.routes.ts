import auth from "@/middlewares/auth.middleware";
import { Router } from "express";
import { BankCardsControllers } from "./bankCards.controller";
import validateRequest from "@/middlewares/validateRequest.middleware";
import { BankCardsValidations } from "./bankCards.validation";

const router = Router();

router.post(
  "/add-bank-card",
  auth(),
  validateRequest(BankCardsValidations.bankCardSchema),
  BankCardsControllers.addBankCard
);

router.get("/", auth(), BankCardsControllers.getUserBankCards);

router.get("/:cardId", auth(), BankCardsControllers.getBankAccountById);

router.patch(
  "/:cardId",
  auth(),
  validateRequest(BankCardsValidations.editBankCardSchema),
  BankCardsControllers.editBankCard
);

export const BankCardRouter = router;
