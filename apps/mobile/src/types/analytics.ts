// Analytics types
export interface AnalyticsSummary {
  bookingCount: number;
  payrollTotal: number;
  benefitsTotal: number;
}

export interface MonthlyData {
  month: string;
  count?: number;
  total?: number;
}
