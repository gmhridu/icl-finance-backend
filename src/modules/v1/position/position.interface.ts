// Position type definitions
export type TPosition = {
  id: string;
  name: string;
  level: number;
  deposit: number;
  tasksPerDay: number;
  unitPrice: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export interface PositionIncomeCalculation {
  dailyIncome: number;
  monthlyIncome: number;
  annualIncome: number;
}

export interface UserPositionInfo {
  user: {
    id: string;
    positionStartDate: Date | null;
    positionEndDate: Date | null;
    depositPaid: number;
    isIntern: boolean;
  };
  position: TPosition | null;
  isExpired: boolean;
  daysRemaining: number;
}

export interface PositionUpgradeResult {
  success: boolean;
  message: string;
  newPosition?: TPosition;
  previousPosition?: TPosition;
}

export interface TaskCompletionInfo {
  canComplete: boolean;
  tasksRemaining?: number;
  reason?: string;
}