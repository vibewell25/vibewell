/**
 * Analytics Data Fetching Module
 *
 * This module provides functions to fetch and process analytics data
 * for reports and dashboards.
 */

import { format, subDays } from 'date-fns';

/**
 * Fetch analytics data for a given time period
 */
export async function fetchAnalyticsData(startDate: Date, endDate: Date): Promise<any> {
  try {
    // In a real implementation, this would fetch data from an analytics API or database
    // For this demo, we'll generate mock data
    return generateMockAnalyticsData(startDate, endDate);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw new Error('Failed to fetch analytics data');
  }
}

/**
 * Generate mock analytics data for testing
 */
function generateMockAnalyticsData(startDate: Date, endDate: Date): any {
  // Calculate number of days in the period
  const dayDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Generate previous period dates
  const previousStartDate = subDays(startDate, dayDiff);
  const previousEndDate = subDays(endDate, dayDiff);

  // Generate time labels (days)
  const timeLabels = [];
  const sessionsByDay = [];
  const usersByDay = [];
  const conversionsByDay = [];

  // Base values for metrics
  const baseSessionsPerDay = 500 + Math.floor(Math.random() * 300);
  const baseUsersPerDay = 350 + Math.floor(Math.random() * 200);
  const baseConversionsPerDay = 50 + Math.floor(Math.random() * 30);

  // Generate daily data
  for (let i = 0; i < dayDiff; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    timeLabels.push(format(date, 'MMM d'));

    // Add some randomness and a slight trend
    const trendFactor = 1 + (i / dayDiff) * 0.2; // 20% increase over the period
    const randomFactor = 0.9 + Math.random() * 0.2; // ±10% randomness

    sessionsByDay.push(Math.floor(baseSessionsPerDay * trendFactor * randomFactor));
    usersByDay.push(Math.floor(baseUsersPerDay * trendFactor * randomFactor));
    conversionsByDay.push(Math.floor(baseConversionsPerDay * trendFactor * randomFactor));
  }

  // Calculate totals
  const totalSessions = sessionsByDay.reduce((sum, val) => sum + val, 0);
  const uniqueUsers = usersByDay.reduce((sum, val) => sum + val, 0);
  const totalConversions = conversionsByDay.reduce((sum, val) => sum + val, 0);
  const conversionRate = (totalConversions / totalSessions) * 100;
  const averageDuration = 120 + Math.floor(Math.random() * 180); // 2-5 minutes in seconds

  // Previous period metrics (slightly lower)
  const prevFactor = 0.85 + Math.random() * 0.2; // 15-35% lower than current
  const previousPeriod = {
    totalSessions: Math.floor(totalSessions * prevFactor),
    uniqueUsers: Math.floor(uniqueUsers * prevFactor),
    totalConversions: Math.floor(totalConversions * prevFactor),
    conversionRate:
      (Math.floor(totalConversions * prevFactor) / Math.floor(totalSessions * prevFactor)) * 100,
    averageDuration: Math.floor(averageDuration * prevFactor),
  };

  // Generate top products
  const topProducts = [
    {
      id: 'prod_1',
      name: 'Professional Makeup Kit',
      category: 'Makeup',
      views: 2500 + Math.floor(Math.random() * 1000),
      tryOns: 900 + Math.floor(Math.random() * 400),
      conversionRate: 4.5 + Math.random() * 2,
    },
    {
      id: 'prod_2',
      name: 'Smart Hair Styler',
      category: 'Hair',
      views: 2200 + Math.floor(Math.random() * 800),
      tryOns: 700 + Math.floor(Math.random() * 300),
      conversionRate: 3.8 + Math.random() * 2,
    },
    {
      id: 'prod_3',
      name: 'Luxury Spa Package',
      category: 'Spa',
      views: 1800 + Math.floor(Math.random() * 700),
      tryOns: 400 + Math.floor(Math.random() * 300),
      conversionRate: 6.2 + Math.random() * 2,
    },
    {
      id: 'prod_4',
      name: 'Wellness Retreat',
      category: 'Wellness',
      views: 1500 + Math.floor(Math.random() * 600),
      tryOns: 300 + Math.floor(Math.random() * 200),
      conversionRate: 5.1 + Math.random() * 2,
    },
    {
      id: 'prod_5',
      name: 'Advanced Skincare Set',
      category: 'Skincare',
      views: 2100 + Math.floor(Math.random() * 900),
      tryOns: 800 + Math.floor(Math.random() * 350),
      conversionRate: 4.7 + Math.random() * 2,
    },
  ];

  // Demographics data
  const demographics = {
    '18-24': 22 + Math.floor(Math.random() * 10),
    '25-34': 35 + Math.floor(Math.random() * 10),
    '35-44': 25 + Math.floor(Math.random() * 8),
    '45-54': 12 + Math.floor(Math.random() * 5),
    '55+': 6 + Math.floor(Math.random() * 3),
  };

  // Top locations
  const topLocations = [
    { name: 'New York', users: 1200 + Math.floor(Math.random() * 400) },
    { name: 'Los Angeles', users: 900 + Math.floor(Math.random() * 300) },
    { name: 'Chicago', users: 750 + Math.floor(Math.random() * 250) },
    { name: 'Miami', users: 600 + Math.floor(Math.random() * 200) },
    { name: 'Dallas', users: 500 + Math.floor(Math.random() * 200) },
  ];

  // Device breakdown
  const deviceBreakdown = {
    mobile: 65 + Math.floor(Math.random() * 10),
    desktop: 28 + Math.floor(Math.random() * 8),
    tablet: 7 + Math.floor(Math.random() * 3),
  };

  // Category breakdown
  const productCategoryBreakdown = {
    Makeup: 32 + Math.floor(Math.random() * 8),
    Hair: 24 + Math.floor(Math.random() * 6),
    Spa: 18 + Math.floor(Math.random() * 5),
    Wellness: 15 + Math.floor(Math.random() * 4),
    Skincare: 11 + Math.floor(Math.random() * 3),
  };

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    previousPeriodStart: previousStartDate.toISOString(),
    previousPeriodEnd: previousEndDate.toISOString(),
    timeLabels,
    sessionsByDay,
    usersByDay,
    conversionsByDay,
    totalSessions,
    uniqueUsers,
    totalConversions,
    conversionRate,
    averageDuration,
    previousPeriod,
    topProducts,
    demographics,
    topLocations,
    deviceBreakdown,
    productCategoryBreakdown,
    mobilePercentage: deviceBreakdown.mobile,
    summaryText: `Overall, user engagement ${conversionRate > previousPeriod.conversionRate ? 'improved' : 'declined'} during this period compared to the previous ${dayDiff} days.`,
  };
}
