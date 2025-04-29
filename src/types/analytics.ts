export enum Period {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}

export interface TrendData {
  period: string;
  value: number;
}

export interface BusinessAnalyticsData {
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  popularServices: Array<{
    serviceId: string;
    count: number;
  }>;
  bookingTrends: TrendData[];
  revenueTrends: TrendData[];
} 