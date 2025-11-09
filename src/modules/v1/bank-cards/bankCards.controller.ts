import { asyncHandler } from "@/middlewares/asyncHandler.middleware";
import { NotFoundException } from "@/utils/app-error";
import { BankCardsServices } from "./bankCards.service";
import sendResponse from "@/utils/sendResponse";
import { HTTPSTATUS } from "@/config/http.config";

const addBankCard = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new NotFoundException("User not found");
  }

  const payload = {
    ...req.body,
    userId,
  };

  const result = await BankCardsServices.addBankCard(payload);

  sendResponse(res, {
    status: HTTPSTATUS.OK,
    success: true,
    message: "Bank card added successfully",
    data: result,
  });
});

const getUserBankCards = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  const result = await BankCardsServices.getUserBankCards(userId as string);

  sendResponse(res, {
    status: HTTPSTATUS.OK,
    success: true,
    message: "Bank cards retrieved successfully",
    data: result,
  });
});

const getBankAccountById = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  if(!userId) throw new NotFoundException("User not found");

  const { cardId } = req.params;

  const result = await BankCardsServices.getBankAccountById({
    userId,
    cardId,
  });

  sendResponse(res, {
    status: HTTPSTATUS.OK,
    success: true,
    message: "Bank account retrieved successfully",
    data: result,
  });
});

export const BankCardsControllers = {
  addBankCard,
  getUserBankCards,
  getBankAccountById,
};
