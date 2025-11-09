export type TRegisterUser = {
  phone: string;
  name: string | undefined;
  email: string | null;
  password: string;
  referralCode: string;
  referredBy: string | null;
  ipAddress: string;
  deviceId: string;
  currentPositionId: string;
  positionStartDate: Date;
  positionEndDate: Date;
  isIntern: true;
  depositPaid: number;
};

export type TLoginUser = {
  email?: string;
  phone?: string;
  password: string;
};
