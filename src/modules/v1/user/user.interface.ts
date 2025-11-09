// User type definitions
export type TUser = {
  id: string;
  email?: string;
  name: string;
  phone: string;
  password: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  referralCode?: string;
  referredBy?: string;
  status: "active" | "suspended" | "banned";
  ipAddress?: string;
  deviceId?: string;
  walletBalance: number;
  totalEarnings: number;
  commissionBalance: number;
  securityRefund: number;
  depositPaid: number;
  positionLevelId?: string;
  currentPositionId?: string;
  previousPositionId?: string;
  positionStartDate?: Date;
  positionEndDate?: Date;
  isIntern: boolean;
  fundPassword?: string;
  failedLoginAttempts: number;
  lastFailedLogin?: Date;
  lockedUntil?: Date;
  lastLoginAt?: Date;
  referredByActivityId?: string;
  isActive: boolean;
  signUpAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

// Type for user updates (only safe fields)
export type TUserUpdate = Partial<Omit<TUser, 'id' | 'password' | 'emailVerified' | 'phoneVerified' | 'referralCode' | 'referredBy' | 'status' | 'ipAddress' | 'deviceId' | 'walletBalance' | 'totalEarnings' | 'commissionBalance' | 'securityRefund' | 'depositPaid' | 'positionLevelId' | 'currentPositionId' | 'previousPositionId' | 'positionStartDate' | 'positionEndDate' | 'isIntern' | 'fundPassword' | 'failedLoginAttempts' | 'lastFailedLogin' | 'lockedUntil' | 'lastLoginAt' | 'referredByActivityId' | 'isActive' | 'signUpAt' | 'createdAt' | 'updatedAt'>>;