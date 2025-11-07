import { relations } from "drizzle-orm";
import { adminUsers } from "./adminUsers.schema";
import { auditLogs } from "./auditLogs.schema";
import { activityLogs } from "./activityLogs.schema";
import { systemLogs } from "./systemLogs.schema";
import { announcements, userAnnouncements } from "./announcements.schema";
import { topupRequests } from "./topuprequests.schema";
import { withdrawalRequests } from "./withdrawalRequests.schema";
import { securityRefundRequests } from "./securityRefundRequests.schema";
import { userOffers, userPlans, userProfiles, users } from "./users.schema";
import { positionLevels } from "./positionLevels.schema";
import { bankCards } from "./bankCards.schema";
import { referralActivities, referralHierarchy } from "./referrals.schema";
import { videos, videoTasks } from "./videos.schema";
import { taskManagementBonuses } from "./taskManagementBonuses.schema";
import { walletTransactions } from "./walletTansactions.schema";
import { passwordResets } from "./passwordResets.schema";
import { whatsappOtps } from "./whatsAppOtps.schema";
import { plans } from "./plans.schema";
import { adminWallets } from "./adminWallets.schema";
import { refreshTokens } from "./refreshTokens.schema";

export const adminUsersRelations = relations(adminUsers, ({ many }) => ({
  auditLogs: many(auditLogs),
  activityLogs: many(activityLogs),
  systemLogs: many(systemLogs),
  announcements: many(announcements),
  processedTopups: many(topupRequests),
  processedWithdrawals: many(withdrawalRequests),
  processedRefunds: many(securityRefundRequests),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  admin: one(adminUsers, {
    fields: [auditLogs.adminId],
    references: [adminUsers.id],
  }),
}));

// ---------------- USER RELATIONS ---------------- //

export const usersRelations = relations(users, ({ one, many }) => ({
  // Self-referential
  referrer: one(users, {
    fields: [users.referredBy],
    references: [users.id],
    relationName: "referrals",
  }),
  referrals: many(users, { relationName: "referrals" }),

  // Position levels
  positionLevel: one(positionLevels, {
    fields: [users.positionLevelId],
    references: [positionLevels.id],
    relationName: "currentPosition",
  }),
  currentPosition: one(positionLevels, {
    fields: [users.currentPositionId],
    references: [positionLevels.id],
    relationName: "userCurrentPosition",
  }),
  previousPosition: one(positionLevels, {
    fields: [users.previousPositionId],
    references: [positionLevels.id],
    relationName: "userPreviousPosition",
  }),

  // Profile and related data
  profile: one(userProfiles),
  bankCards: many(bankCards),
  userPlans: many(userPlans),

  // Referral activities
  referrerActivities: many(referralActivities, { relationName: "referrer" }),
  referredActivity: one(referralActivities, {
    fields: [users.referredByActivityId],
    references: [referralActivities.id],
    relationName: "referred",
  }),
  referralHierarchies: many(referralHierarchy),

  // Tasks and bonuses
  videoTasks: many(videoTasks),
  taskBonuses: many(taskManagementBonuses, { relationName: "user" }),
  subordinateBonuses: many(taskManagementBonuses, {
    relationName: "subordinate",
  }),

  // Financial
  walletTransactions: many(walletTransactions),
  topupRequests: many(topupRequests),
  withdrawalRequests: many(withdrawalRequests),
  securityRefundRequests: many(securityRefundRequests),

  // Announcements and offers
  userAnnouncements: many(userAnnouncements),
  userOffers: many(userOffers),

  // Security
  passwordResets: many(passwordResets),
  whatsappOtps: many(whatsappOtps),
  refreshTokens: many(refreshTokens),

  // Logs
  activityLogs: many(activityLogs),
  systemLogs: many(systemLogs),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

// ---------------- POSITION LEVEL RELATIONS ---------------- //

export const positionLevelsRelations = relations(
  positionLevels,
  ({ many }) => ({
    users: many(users, { relationName: "currentPosition" }),
    currentPositionUsers: many(users, { relationName: "userCurrentPosition" }),
    previousPositionUsers: many(users, {
      relationName: "userPreviousPosition",
    }),
    videos: many(videos),
  })
);

// ---------------- PLAN RELATIONS ---------------- //

export const plansRelations = relations(plans, ({ many }) => ({
  userPlans: many(userPlans),
}));

export const userPlansRelations = relations(userPlans, ({ one }) => ({
  user: one(users, {
    fields: [userPlans.userId],
    references: [users.id],
  }),
  plan: one(plans, {
    fields: [userPlans.planId],
    references: [plans.id],
  }),
}));

// ---------------- REFERRAL RELATIONS ---------------- //

export const referralActivitiesRelations = relations(
  referralActivities,
  ({ one, many }) => ({
    referrer: one(users, {
      fields: [referralActivities.referrerId],
      references: [users.id],
      relationName: "referrer",
    }),
    referredUser: one(users, {
      fields: [referralActivities.referredUserId],
      references: [users.id],
      relationName: "referred",
    }),
    hierarchies: many(referralHierarchy),
  })
);

export const referralHierarchyRelations = relations(
  referralHierarchy,
  ({ one }) => ({
    referrerActivity: one(referralActivities, {
      fields: [referralHierarchy.referrerActivityId],
      references: [referralActivities.id],
    }),
    user: one(users, {
      fields: [referralHierarchy.userId],
      references: [users.id],
    }),
  })
);

// ---------------- VIDEO RELATIONS ---------------- //

export const videosRelations = relations(videos, ({ one, many }) => ({
  positionLevel: one(positionLevels, {
    fields: [videos.positionLevelId],
    references: [positionLevels.id],
  }),
  videoTasks: many(videoTasks),
}));

export const videoTasksRelations = relations(videoTasks, ({ one }) => ({
  user: one(users, {
    fields: [videoTasks.userId],
    references: [users.id],
  }),
  video: one(videos, {
    fields: [videoTasks.videoId],
    references: [videos.id],
  }),
}));

// ---------------- TASK BONUS RELATIONS ---------------- //

export const taskManagementBonusesRelations = relations(
  taskManagementBonuses,
  ({ one }) => ({
    user: one(users, {
      fields: [taskManagementBonuses.userId],
      references: [users.id],
      relationName: "user",
    }),
    subordinate: one(users, {
      fields: [taskManagementBonuses.subordinateId],
      references: [users.id],
      relationName: "subordinate",
    }),
  })
);

// ---------------- FINANCIAL RELATIONS ---------------- //

export const walletTransactionsRelations = relations(
  walletTransactions,
  ({ one }) => ({
    user: one(users, {
      fields: [walletTransactions.userId],
      references: [users.id],
    }),
  })
);

export const topupRequestsRelations = relations(topupRequests, ({ one }) => ({
  user: one(users, {
    fields: [topupRequests.userId],
    references: [users.id],
  }),
  selectedWallet: one(adminWallets, {
    fields: [topupRequests.selectedWalletId],
    references: [adminWallets.id],
  }),
  processedBy: one(adminUsers, {
    fields: [topupRequests.processedBy],
    references: [adminUsers.id],
  }),
}));

export const withdrawalRequestsRelations = relations(
  withdrawalRequests,
  ({ one }) => ({
    user: one(users, {
      fields: [withdrawalRequests.userId],
      references: [users.id],
    }),
    bankCard: one(bankCards, {
      fields: [withdrawalRequests.bankCardId],
      references: [bankCards.id],
    }),
    processedBy: one(adminUsers, {
      fields: [withdrawalRequests.processedBy],
      references: [adminUsers.id],
    }),
  })
);

export const securityRefundRequestsRelations = relations(
  securityRefundRequests,
  ({ one }) => ({
    user: one(users, {
      fields: [securityRefundRequests.userId],
      references: [users.id],
    }),
    processedBy: one(adminUsers, {
      fields: [securityRefundRequests.processedBy],
      references: [adminUsers.id],
    }),
  })
);

// ---------------- BANK CARD RELATIONS ---------------- //

export const bankCardsRelations = relations(bankCards, ({ one, many }) => ({
  user: one(users, {
    fields: [bankCards.userId],
    references: [users.id],
  }),
  withdrawalRequests: many(withdrawalRequests),
}));

export const adminWalletsRelations = relations(adminWallets, ({ many }) => ({
  topupRequests: many(topupRequests),
}));

// ---------------- ANNOUNCEMENT RELATIONS ---------------- //

export const announcementsRelations = relations(
  announcements,
  ({ one, many }) => ({
    createdBy: one(adminUsers, {
      fields: [announcements.createdBy],
      references: [adminUsers.id],
    }),
    userAnnouncements: many(userAnnouncements),
    userOffers: many(userOffers),
  })
);

export const userAnnouncementsRelations = relations(
  userAnnouncements,
  ({ one }) => ({
    user: one(users, {
      fields: [userAnnouncements.userId],
      references: [users.id],
    }),
    announcement: one(announcements, {
      fields: [userAnnouncements.announcementId],
      references: [announcements.id],
    }),
  })
);

export const userOffersRelations = relations(userOffers, ({ one }) => ({
  user: one(users, {
    fields: [userOffers.userId],
    references: [users.id],
  }),
  announcement: one(announcements, {
    fields: [userOffers.announcementId],
    references: [announcements.id],
  }),
}));

// ---------------- SECURITY RELATIONS ---------------- //

export const passwordResetsRelations = relations(passwordResets, ({ one }) => ({
  user: one(users, {
    fields: [passwordResets.userId],
    references: [users.id],
  }),
}));

export const whatsappOtpsRelations = relations(whatsappOtps, ({ one }) => ({
  user: one(users, {
    fields: [whatsappOtps.userId],
    references: [users.id],
  }),
}));

// ---------------- REFRESH TOKEN RELATIONS ---------------- //

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));

// ---------------- LOG RELATIONS ---------------- //

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
  admin: one(adminUsers, {
    fields: [activityLogs.adminId],
    references: [adminUsers.id],
  }),
}));

export const systemLogsRelations = relations(systemLogs, ({ one }) => ({
  user: one(users, {
    fields: [systemLogs.userId],
    references: [users.id],
  }),
  admin: one(adminUsers, {
    fields: [systemLogs.adminId],
    references: [adminUsers.id],
  }),
}));