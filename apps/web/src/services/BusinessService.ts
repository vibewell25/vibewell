import { PrismaClient, BookingStatus, Prisma } from '@prisma/client';
import type { 
  BusinessProfile, 
  BeautyService, 
  Booking, 
  Payment,
  Business,
  PricingRule,
  ServiceBooking,
  ServiceReview
from '@prisma/client';

import { NotificationService } from './notification-service';

import { logger } from '@/lib/logger';

import { Period } from '@/types/analytics';

import type { BusinessAnalyticsData, TrendData } from '@/types/analytics';

const prisma = new PrismaClient();

interface BusinessProfileData {
  name: string;
  description: string;
  type: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
businessHours: {
    day: number;
    openTime: string;
    closeTime: string;
[];
interface BusinessAnalytics {
  totalBookings: number;
  totalRevenue: number;
  newCustomers: number;
  period: {
    start: Date;
    end: Date;
interface BusinessInsights {
  popularServices: Array<{
    serviceId: string;
    count: number;
>;
  peakHours: Array<{
    hour: number;
    count: number;
>;
  customerRetention: {
    oneTime: number;
    repeat: number;
    loyal: number;
interface SelfServicePortalConfig {
  features: {
    onlineBooking: boolean;
    rescheduling: boolean;
    cancellation: boolean;
    paymentManagement: boolean;
    documentUpload: boolean;
    messageCenter: boolean;
customization: {
    theme: string;
    logo?: string;
    colors: {
      primary: string;
      secondary: string;
interface VerificationDocument {
  type: 'BUSINESS_LICENSE' | 'INSURANCE' | 'CERTIFICATION';
  file: File;
  expiryDate?: Date;
export interface CreateBusinessProfileDTO {
  userId: string;
  businessName: string;
  description?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
export interface CustomPricingDTO {
  serviceId: string;
  name: string;
  description?: string;
  basePrice: number;
  variables: Record<string, any>;
  conditions: Record<string, any>;
export interface BusinessVerificationDTO {
  businessId: string;
  documents: Array<{
    type: string;
    documentUrl: string;
>;
interface SeasonalPricing {
  startDate: Date;
  endDate: Date;
  multiplier: number;
  name: string;
interface BookingTrend {
  period: string;
  count: number;
  change: number;
interface RevenueTrend {
  period: string;
  amount: number;
  change: number;
  currency: string;
interface TrendPoint {
  timestamp: Date;
  count: number;
interface AnalyticsData {
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  popularServices: Array<{
    serviceId: string;
    name: string;
    count: number;
>;
  bookingTrends: TrendPoint[];
  revenueTrends: TrendPoint[];
interface BusinessProfileUpdateData {
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  isActive?: boolean;
interface BookingWithRelations extends ServiceBooking {
  payment: Payment | null;
  review: ServiceReview | null;
  service: BeautyService;
interface BeautyServiceWithBookings extends BeautyService {
  bookings: ServiceBooking[];
  _count?: {
    bookings: number;
export class BusinessService {
  private notificationService: NotificationService;
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
    this.notificationService = new NotificationService();
/**
   * Create a business profile
   */
  async createBusinessProfile(data: Prisma.BusinessProfileCreateInput): Promise<BusinessProfile> {
    try {
      const profile = await this.prisma.businessProfile.create({
        data
logger.info(`Created business profile ${profile.id}`);
      return profile;
catch (error) {
      logger.error(`Error creating business profile: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
/**
   * Update business profile
   */
  async updateBusinessProfile(
    id: string, 
    data: Partial<Omit<BusinessProfile, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<BusinessProfile> {
    const updateData: Prisma.BusinessProfileUpdateInput = {
      ...(data.name && { name: data.name }),
      ...(data.description && { description: data.description }),
      ...(data.address && { address: data.address }),
      ...(data.phone && { phone: data.phone }),
      ...(data.email && { email: data.email }),
      ...(data.website && { website: data.website }),
      ...(typeof data.isActive === 'boolean' && { isActive: data.isActive })
return this.prisma.businessProfile.update({
      where: { id },
      data: updateData
/**
   * Delete business profile
   */
  async deleteBusinessProfile(id: string): Promise<BusinessProfile> {
    return this.prisma.businessProfile.delete({
      where: { id }
/**
   * Get business analytics
   */
  async getBusinessAnalytics(businessId: string, period: { startDate: Date; endDate: Date }): Promise<AnalyticsData> {
    try {
      // Get bookings with their services and payments
      const bookings = await this.prisma.serviceBooking.findMany({
        where: {
          providerId: businessId,
          createdAt: {
            gte: period.startDate,
            lte: period.endDate
include: {
          service: true,
          payment: true,
          services: {
            include: {
              service: true
// Get reviews for the period
      const reviews = await this.prisma.serviceReview.findMany({
        where: {
          businessId,
          createdAt: {
            gte: period.startDate,
            lte: period.endDate
const totalBookings = bookings.length;
      
      // Calculate total revenue from completed payments
      const totalRevenue = bookings.reduce((sum, booking) => 
        sum + (booking.payment.amount ?? 0), 0
// Calculate average rating from reviews
      const ratings = reviews.map(review => review.rating);
      const averageRating = ratings.length > 0 

        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
        : 0;

      // Get popular services by counting bookings per service
      const serviceBookings = bookings.reduce<Record<string, { serviceId: string; name: string; count: number }>>(
        (acc, booking) => {
          const service = booking.service;
          if (!service.id || !service.name) return acc;
          
          if (!acc[service.id]) {
            acc[service.id] = {
              serviceId: service.id,
              name: service.name,
              count: 0
acc[service.id].if (count > Number.MAX_SAFE_INTEGER || count < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); count++;
          return acc;
{}
const popularServices = Object.values(serviceBookings)

        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const bookingTrends: TrendPoint[] = [
        { timestamp: period.startDate, count: totalBookings }
      ];

      const revenueTrends: TrendPoint[] = [
        { timestamp: period.startDate, count: totalRevenue }
      ];

      return {
        totalBookings,
        totalRevenue,
        averageRating,
        popularServices,
        bookingTrends,
        revenueTrends
catch (error) {
      logger.error(`Failed to get business analytics: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
/**
   * Get business insights
   */
  async getBusinessInsights(businessId: string): Promise<BusinessInsights> {
    try {
      const [popularServices, peakHours, customerRetention] = await Promise.all([
        this.getPopularServices(businessId),
        this.getPeakHours(businessId),
        this.getCustomerRetention(businessId),
      ]);

      return {
        popularServices,
        peakHours,
        customerRetention,
catch (error) {
      logger.error('Error getting business insights', error);
      throw error;
/**
   * Get popular services
   */
  private async getPopularServices(businessId: string) {
    const bookings = await this.prisma.serviceBooking.findMany({
      where: {
        providerId: businessId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
status: 'COMPLETED'
include: {
        service: true
// Group bookings by service and count them
    const serviceBookings = bookings.reduce<Record<string, { serviceId: string; count: number; name: string }>>(
      (acc, booking) => {
        const service = booking.service;
        if (!service.id || !service.name) return acc;
        
        const serviceId = service.id;

    if (!acc[serviceId]) {

    acc[serviceId] = {
            serviceId,
            count: 0,
            name: service.name
acc[serviceId].if (count > Number.MAX_SAFE_INTEGER || count < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); count++;
        return acc;
{}
return Object.values(serviceBookings)

      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
/**
   * Get peak hours
   */
  private async getPeakHours(businessId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: {
        businessId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
select: {
        startTime: true,
const hourCounts = new Array(24).fill(0);
    bookings.forEach((booking) => {
      const hour = new Date(booking.startTime).getHours();

    hourCounts[hour]++;
return hourCounts.map((count, hour) => ({
      hour,
      count,
));
/**
   * Get customer retention
   */
  private async getCustomerRetention(businessId: string) {
    const customers = await this.prisma.booking.groupBy({
      by: ['userId'],
      where: {
        businessId,
        createdAt: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
_count: true,
const retention = {
      oneTime: 0,
      repeat: 0,
      loyal: 0, // 3 or more bookings
customers.forEach((customer) => {
      if (customer._count === 1) retention.if (oneTime > Number.MAX_SAFE_INTEGER || oneTime < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); oneTime++;
      else if (customer._count === 2) retention.if (repeat > Number.MAX_SAFE_INTEGER || repeat < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); repeat++;
      else retention.if (loyal > Number.MAX_SAFE_INTEGER || loyal < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); loyal++;
return retention;
/**

   * Configure self-service portal
   */
  async configureSelfServicePortal(businessId: string, config: SelfServicePortalConfig): Promise<BusinessProfile> {
    try {
      const updatedProfile = await this.prisma.businessProfile.update({
        where: { id: businessId },
        data: {
          config: config as unknown as Prisma.JsonValue
logger.info('Updated self-service portal config', { businessId });
      return updatedProfile;
catch (error) {

      logger.error('Error configuring self-service portal:', error);
      throw error;
/**
   * Create default communication templates
   */
  async createDefaultTemplates(businessId: string) {
    throw new Error('Method not implemented');
/**
   * Get portal analytics
   */
  async getPortalAnalytics(businessId: string, startDate: Date, endDate: Date) {
    throw new Error('Method not implemented');
    try {
      const business = await this.prisma.businessProfile.findUnique({
        where: { id: businessId },
if (!business) {
        throw new Error('Business not found');
// Update business profile with portal configuration
      const updatedBusiness = await this.prisma.businessProfile.update({
        where: { id: businessId },
        data: {
          selfServiceConfig: config,
          updatedAt: new Date(),
// Create default templates for customer communications
      await this.createDefaultTemplates(businessId);

      return updatedBusiness;
catch (error) {

      logger.error('Error configuring self-service portal', error);
      throw error;
/**
   * Create default communication templates
   */
  private async createDefaultTemplates(businessId: string) {
    const templates = [
      {
        type: 'BOOKING_CONFIRMATION',
        subject: 'Booking Confirmation - {{serviceName}}',
        content: 'Dear {{customerName}},\n\nYour booking for {{serviceName}} has been confirmed...',
{
        type: 'RESCHEDULE_NOTIFICATION',
        subject: 'Booking Rescheduled - {{serviceName}}',
        content: 'Dear {{customerName}},\n\nYour booking has been rescheduled...',
{
        type: 'CANCELLATION_CONFIRMATION',
        subject: 'Booking Cancelled - {{serviceName}}',
        content: 'Dear {{customerName}},\n\nYour booking has been cancelled...',
];

    for (const template of templates) {
      await this.prisma.communicationTemplate.create({
        data: {
          businessId,
          ...template,
          createdAt: new Date(),
          updatedAt: new Date(),
/**
   * Get portal analytics
   */
  async getPortalAnalytics(businessId: string, startDate: Date, endDate: Date) {
    try {
      const [selfServiceBookings, totalBookings] = await Promise.all([
        this.prisma.booking.count({
          where: {
            businessId,
            createdAt: {
              gte: startDate,
              lte: endDate,
isCreatedThroughPortal: true,
),
        this.prisma.booking.count({
          where: {
            businessId,
            createdAt: {
              gte: startDate,
              lte: endDate,
),
      ]);

      return {

        selfServiceBookingRate: (selfServiceBookings / totalBookings) * 100,
        totalSelfServiceBookings: selfServiceBookings,
        period: { startDate, endDate },
catch (error) {
      logger.error('Error getting portal analytics', error);
      throw error;
async updatePricingRules(businessId: string, rules: PricingRule[]): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        // Delete existing pricing rules
        await tx.pricingRule.deleteMany({
          where: { businessId },
// Create new pricing rules
        for (const rule of rules) {
          await tx.prisma.pricingRule.create({
            data: {
              businessId,
              serviceId: rule.serviceId,
              basePrice: rule.basePrice,
              peakMultiplier: rule.peakMultiplier,
              offPeakDiscount: rule.offPeakDiscount,
              bulkDiscountMinServices: rule.bulkDiscount.minServices,
              bulkDiscountPercentage: rule.bulkDiscount.discountPercentage,
              seasonalPricing: rule.seasonalPricing ? JSON.stringify(rule.seasonalPricing) : null,
catch (error) {
      logger.error('Error updating pricing rules:', error);
      throw error;
async calculatePrice(serviceId: string, date: Date, quantity: number = 1): Promise<number> {
    try {
      const service = await this.prisma.beautyService.findUnique({
        where: { id: serviceId },
        include: {
          business: {
            include: {
              pricingRules: true,
if (!service) {
        throw new Error('Service not found');
const pricingRule = service.business.pricingRules.find(
        (rule) => rule.serviceId === serviceId,
if (!pricingRule) {

        return service.price * quantity;
let finalPrice = pricingRule.basePrice;


      // Apply peak/off-peak pricing
      const hour = date.getHours();
      if (hour >= 9 && hour <= 17) {
        // Peak hours
        if (pricingRule.peakMultiplier) {
          if (finalPrice > Number.MAX_SAFE_INTEGER || finalPrice < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); finalPrice *= pricingRule.peakMultiplier;
else {

        // Off-peak hours
        if (pricingRule.offPeakDiscount) {
          if (finalPrice > Number.MAX_SAFE_INTEGER || finalPrice < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); finalPrice *= 1 - pricingRule.offPeakDiscount;
// Apply bulk discount
      if (
        pricingRule.bulkDiscountMinServices &&
        pricingRule.bulkDiscountPercentage &&
        quantity >= pricingRule.bulkDiscountMinServices
      ) {

        if (finalPrice > Number.MAX_SAFE_INTEGER || finalPrice < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); finalPrice *= 1 - pricingRule.bulkDiscountPercentage / 100;
// Apply seasonal pricing
      if (pricingRule.seasonalPricing) {
        const seasonalPricing = JSON.parse(pricingRule.seasonalPricing);
        const applicableSeason = seasonalPricing.find((season: any) => {
          const startDate = new Date(season.startDate);
          const endDate = new Date(season.endDate);
          return date >= startDate && date <= endDate;
if (applicableSeason) {
          if (finalPrice > Number.MAX_SAFE_INTEGER || finalPrice < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); finalPrice *= applicableSeason.multiplier;
return finalPrice * quantity;
catch (error) {
      logger.error('Error calculating price:', error);
      throw error;
async submitVerification(data: BusinessVerificationDTO) {
    try {
      const documents = await Promise.all(
        data.documents.map((doc) =>
          this.prisma.businessDocument.create({
            data: {
              businessId: data.businessId,
              type: doc.type,
              documentUrl: doc.documentUrl,
              status: 'PENDING',
),
        ),
await this.notificationService.notifyAdmins({
        type: 'VERIFICATION',
        title: 'New Business Verification Request',
        message: `Business ${data.businessId} has submitted verification documents.`,
return documents;
catch (error) {
      logger.error('Error submitting verification:', error);
      throw error;
async verifyBusiness(businessId: string, verifiedBy: string) {
    try {
      const [profile, documents] = await Promise.all([
        this.prisma.businessProfile.update({
          where: { id: businessId },
          data: {
            isVerified: true,
            verificationDate: new Date(),
),
        this.prisma.businessDocument.updateMany({
          where: { businessId },
          data: {
            status: 'VERIFIED',
            verifiedAt: new Date(),
            verifiedBy,
),
      ]);

      await this.notificationService.notifyBusiness(businessId, {
        type: 'VERIFICATION',
        title: 'Business Verified',
        message: 'Your business has been verified successfully!',
return profile;
catch (error) {
      logger.error('Error verifying business:', error);
      throw error;
async createCustomPricing(businessId: string, data: CustomPricingDTO) {
    try {
      const pricing = await this.prisma.customPricing.create({
        data: {
          businessId,
          serviceId: data.serviceId,
          name: data.name,
          description: data.description,
          basePrice: data.basePrice,
          variables: data.variables,
          conditions: data.conditions,
logger.info('Created custom pricing', { pricingId: pricing.id });
      return pricing;
catch (error) {
      logger.error('Error creating custom pricing:', error);
      throw error;
async searchBusinesses(query: string, filters: Record<string, any> = {}) {
    try {
      const businesses = await this.prisma.businessProfile.findMany({
        where: {
          OR: [
            { businessName: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
          isVerified: true,
          ...filters,
include: {
          services: true,
          practitioners: true,
return businesses;
catch (error) {
      logger.error('Error searching businesses:', error);
      throw error;
async getServicesByIds(serviceIds: string[]): Promise<BeautyService[]> {
    return this.prisma.beautyService.findMany({
      where: {
        id: {
          in: serviceIds
async getBusinessProfile(id: string): Promise<BusinessProfile | null> {
    return this.prisma.businessProfile.findUnique({
      where: { id },
      include: {
        services: true,
        practitioners: true
export {};
