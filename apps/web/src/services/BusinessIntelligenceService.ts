import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';

import { logger } from '@/lib/logger';

const prisma = new PrismaClient();

interface AnalyticsMetrics {
  revenue: number;
  bookings: number;
  customers: number;
  avgTicketValue: number;
  customerRetention: number;
  serviceUtilization: number;
interface CompetitorData {
  name: string;
  services: Array<{
    name: string;
    price: number;
>;
  ratings: number;
  reviews: number;
  location: string;
interface TrendData {
  category: string;
  trend: string;
  impact: number;
  confidence: number;
  source: string;
interface CustomerSegmentData {
  name: string;
  size: number;
  value: number;
  characteristics: Record<string, any>;
  preferences: Record<string, any>;
export class BusinessIntelligenceService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
async generateAnalytics(businessId: string, period: string, date: Date): Promise<void> {
    try {
      // Calculate metrics
      const metrics = await this.calculateMetrics(businessId, period, date);

      // Analyze trends
      const trends = await this.analyzeTrends(businessId, metrics);

      // Get competitor analysis
      const competitors = await this.analyzeCompetitors(businessId);

      // Get customer segments
      const segments = await this.analyzeCustomerSegments(businessId);

      // Generate AI recommendations
      const recommendations = await this.generateRecommendations(
        businessId,
        metrics,
        trends,
        competitors,
        segments,
// Save analytics
      await prisma.businessAnalytics.create({
        data: {
          businessId,
          period,
          date,
          metrics,
          trends,
          competitors,
          segments,
          recommendations,
logger.info('Generated business analytics', 'BusinessIntelligence', { businessId, period });
catch (error) {
      logger.error('Failed to generate analytics', 'BusinessIntelligence', { error });
      throw error;
private async calculateMetrics(
    businessId: string,
    period: string,
    date: Date,
  ): Promise<AnalyticsMetrics> {
    const [startDate, endDate] = this.getDateRange(period, date);

    const [revenue, bookings, customers, avgTicket, retention, utilization] = await Promise.all([
      this.calculateRevenue(businessId, startDate, endDate),
      this.calculateBookings(businessId, startDate, endDate),
      this.calculateUniqueCustomers(businessId, startDate, endDate),
      this.calculateAverageTicket(businessId, startDate, endDate),
      this.calculateRetention(businessId, startDate, endDate),
      this.calculateUtilization(businessId, startDate, endDate),
    ]);

    return {
      revenue,
      bookings,
      customers,
      avgTicketValue: avgTicket,
      customerRetention: retention,
      serviceUtilization: utilization,
private async analyzeTrends(businessId: string, metrics: AnalyticsMetrics): Promise<TrendData[]> {
    try {
      // Get market trends from external sources
      const marketTrends = await this.getMarketTrends();

      // Analyze internal trends
      const internalTrends = await this.analyzeInternalTrends(businessId, metrics);

      // Save trends
      const trends = [...marketTrends, ...internalTrends];
      await Promise.all(
        trends.map((trend) =>
          prisma.marketTrend.create({
            data: {
              businessId,
              ...trend,
),
        ),
return trends;
catch (error) {
      logger.error('Failed to analyze trends', 'BusinessIntelligence', { error });
      throw error;
private async analyzeCompetitors(businessId: string): Promise<CompetitorData[]> {
    try {
      // Get business location
      const business = await prisma.business.findUnique({
        where: { id: businessId },
if (!business) throw new Error('Business not found');

      // Get competitors in the area
      const competitors = await this.findLocalCompetitors(business.address);

      // Analyze each competitor
      const competitorData = await Promise.all(
        competitors.map(async (competitor) => {
          const services = await this.getCompetitorServices(competitor.id);
          const ratings = await this.getCompetitorRatings(competitor.id);

          return {
            name: competitor.name,
            services,
            ratings: ratings.average,
            reviews: ratings.count,
            location: competitor.address,
),
return competitorData;
catch (error) {
      logger.error('Failed to analyze competitors', 'BusinessIntelligence', { error });
      throw error;
private async analyzeCustomerSegments(businessId: string): Promise<CustomerSegmentData[]> {
    try {
      // Get all customers
      const customers = await prisma.user.findMany({
        where: {
          bookings: {
            some: {
              businessId,
include: {
          bookings: {
            where: { businessId },
            include: { payment: true },
reviews: {
            where: { businessId },
stylePreferences: true,
          userPreferences: true,
// Segment customers based on behavior and preferences
      const segments = this.segmentCustomers(customers);

      // Save segments
      await Promise.all(
        segments.map((segment) =>
          prisma.customerSegment.create({
            data: {
              businessId,
              name: segment.name,
              description: `${segment.name} segment with ${segment.size} customers`,
              criteria: segment.characteristics,
              size: segment.size,
              value: segment.value,
),
        ),
return segments;
catch (error) {
      logger.error('Failed to analyze customer segments', 'BusinessIntelligence', { error });
      throw error;
private async generateRecommendations(
    businessId: string,
    metrics: AnalyticsMetrics,
    trends: TrendData[],
    competitors: CompetitorData[],
    segments: CustomerSegmentData[],
  ): Promise<Record<string, any>> {
    try {
      const prompt = `Based on the following business data, provide strategic recommendations:
        
        Metrics:
        ${JSON.stringify(metrics, null, 2)}
        
        Market Trends:
        ${JSON.stringify(trends, null, 2)}
        
        Competitor Analysis:
        ${JSON.stringify(competitors, null, 2)}
        
        Customer Segments:
        ${JSON.stringify(segments, null, 2)}
        
        Provide recommendations for:
        1. Revenue optimization
        2. Customer retention
        3. Service offerings
        4. Marketing strategies
        5. Competitive positioning`;

      const response = await this.openai.chat.completions.create({

        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a business intelligence analyst providing strategic recommendations.',
{
            role: 'user',
            content: prompt,
],
        temperature: 0.7,
        max_tokens: 1000,
return JSON.parse(response.choices[0].message.content || '{}');
catch (error) {
      logger.error('Failed to generate recommendations', 'BusinessIntelligence', { error });
      throw error;
// Helper methods for metrics calculation
  private async calculateRevenue(
    businessId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await prisma.payment.aggregate({
      where: {
        businessId,
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
          lt: endDate,
_sum: {
        amount: true,
return result._sum.amount || 0;
private async calculateBookings(
    businessId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return prisma.booking.count({
      where: {
        businessId,
        status: 'COMPLETED',
        startTime: {
          gte: startDate,
          lt: endDate,
private async calculateUniqueCustomers(
    businessId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await prisma.booking.groupBy({
      by: ['userId'],
      where: {
        businessId,
        startTime: {
          gte: startDate,
          lt: endDate,
return result.length;
private async calculateAverageTicket(
    businessId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const revenue = await this.calculateRevenue(businessId, startDate, endDate);
    const bookings = await this.calculateBookings(businessId, startDate, endDate);

    return bookings > 0 ? revenue / bookings : 0;
private async calculateRetention(
    businessId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    // Calculate retention rate based on repeat customers
    const totalCustomers = await this.calculateUniqueCustomers(businessId, startDate, endDate);

    const repeatCustomers = await prisma.booking.groupBy({
      by: ['userId'],
      where: {
        businessId,
        startTime: {
          gte: startDate,
          lt: endDate,
user: {
          bookings: {
            some: {
              businessId,
              startTime: {
                lt: startDate,
return totalCustomers > 0 ? (repeatCustomers.length / totalCustomers) * 100 : 0;
private async calculateUtilization(
    businessId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    // Calculate service utilization rate
    const totalSlots = await this.calculateTotalTimeSlots(businessId, startDate, endDate);
    const bookedSlots = await this.calculateBookedTimeSlots(businessId, startDate, endDate);


    return totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0;
private getDateRange(period: string, date: Date): [Date, Date] {
    const start = new Date(date);
    const end = new Date(date);

    switch (period) {
      case 'daily':
        end.setDate(end.getDate() + 1);
        break;
      case 'weekly':
        end.setDate(end.getDate() + 7);
        break;
      case 'monthly':
        end.setMonth(end.getMonth() + 1);
        break;
      case 'yearly':
        end.setFullYear(end.getFullYear() + 1);
        break;
      default:
        throw new Error('Invalid period');
return [start, end];
private async getMarketTrends(): Promise<TrendData[]> {
    // This would integrate with external APIs or data sources
    // Placeholder implementation
    return [];
private async analyzeInternalTrends(
    businessId: string,
    metrics: AnalyticsMetrics,
  ): Promise<TrendData[]> {
    // Analyze internal data for trends
    // Placeholder implementation
    return [];
private async findLocalCompetitors(location: string): Promise<any[]> {
    // This would integrate with external APIs (e.g., Google Places)
    // Placeholder implementation
    return [];
private async getCompetitorServices(competitorId: string): Promise<any[]> {
    // This would scrape or fetch competitor service data
    // Placeholder implementation
    return [];
private async getCompetitorRatings(
    competitorId: string,
  ): Promise<{ average: number; count: number }> {
    // This would fetch competitor ratings from review platforms
    // Placeholder implementation
    return { average: 0, count: 0 };
private segmentCustomers(customers: any[]): CustomerSegmentData[] {
    // Implement customer segmentation logic
    // This is a placeholder implementation
    return [];
private async calculateTotalTimeSlots(
    businessId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    // Calculate total available time slots based on business hours
    // Placeholder implementation
    return 0;
private async calculateBookedTimeSlots(
    businessId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    // Calculate number of booked time slots
    // Placeholder implementation
    return 0;
