export type BudgetCycle = "weekly" | "biweekly" | "monthly";

export interface ProfileFormData {
  fullName: string;
  email: string;
  currency: string;
  occupation: string;
  cycle: BudgetCycle;
}
