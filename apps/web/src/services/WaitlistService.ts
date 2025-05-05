import { PrismaClient, WaitlistStatus } from '@prisma/client';

import { NotificationService } from './notification-service';

import { logger } from '@/lib/logger';

const prisma = new PrismaClient();

interface WaitlistEntry {
  serviceId: string;
  customerId: string;
  businessId: string;
  requestedDate: Date;
export class WaitlistService {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
/**
   * Add customer to waitlist
   */
  async addToWaitlist(entry: WaitlistEntry) {
    try {
      const waitlistEntry = await prisma.waitlist.create({
        data: {
          ...entry,
          status: WaitlistStatus.PENDING,
          expiresAt: new Date(entry.requestedDate.getTime() + 24 * 60 * 60 * 1000), // 24 hours expiry
include: {
          service: true,
          customer: true,
// Notify customer
      await this.notificationService.notifyUser(waitlistEntry.customer.userId, {
        type: 'SYSTEM',
        title: 'Added to Waitlist',
        message: `You've been added to the waitlist for ${waitlistEntry.service.name}`,
return waitlistEntry;
catch (error) {
      logger.error('Error adding to waitlist', error);
      throw error;
/**
   * Process waitlist when slot becomes available
   */
  async processWaitlist(serviceId: string, availableDate: Date) {
    try {
      // Find eligible waitlist entries
      const entries = await prisma.waitlist.findMany({
        where: {
          serviceId,
          status: WaitlistStatus.PENDING,
          requestedDate: {
            lte: availableDate,
expiresAt: {
            gt: new Date(),
orderBy: {
          createdAt: 'asc',
include: {
          service: true,
          customer: true,
take: 5, // Process top 5 entries
for (const entry of entries) {
        // Update status and notification time
        await prisma.waitlist.update({
          where: { id: entry.id },
          data: {
            status: WaitlistStatus.NOTIFIED,
            notifiedAt: new Date(),
// Notify customer
        await this.notificationService.notifyUser(entry.customer.userId, {
          type: 'SYSTEM',
          title: 'Slot Available',
          message: `A slot is now available for ${entry.service.name}. Please book within 24 hours.`,
return entries;
catch (error) {
      logger.error('Error processing waitlist', error);
      throw error;
/**
   * Handle waitlist response
   */
  async handleWaitlistResponse(entryId: string, accepted: boolean) {
    try {
      const entry = await prisma.waitlist.update({
        where: { id: entryId },
        data: {
          status: accepted ? WaitlistStatus.ACCEPTED : WaitlistStatus.DECLINED,
include: {
          service: true,
          customer: true,
if (!accepted) {
        // Process next person in waitlist
        await this.processWaitlist(entry.serviceId, entry.requestedDate);
return entry;
catch (error) {
      logger.error('Error handling waitlist response', error);
      throw error;
/**
   * Clean up expired waitlist entries
   */
  async cleanupExpiredEntries() {
    try {
      const expiredEntries = await prisma.waitlist.updateMany({
        where: {
          status: WaitlistStatus.PENDING,
          expiresAt: {
            lt: new Date(),
data: {
          status: WaitlistStatus.EXPIRED,
return expiredEntries;
catch (error) {
      logger.error('Error cleaning up expired waitlist entries', error);
      throw error;
/**
   * Get waitlist analytics
   */
  async getWaitlistAnalytics(businessId: string) {
    try {
      const [totalEntries, acceptedEntries, conversionRate] = await Promise.all([
        prisma.waitlist.count({
          where: { businessId },
),
        prisma.waitlist.count({
          where: {
            businessId,
            status: WaitlistStatus.ACCEPTED,
),
        this.calculateConversionRate(businessId),
      ]);

      return {
        totalEntries,
        acceptedEntries,
        conversionRate,
        averageWaitTime: await this.calculateAverageWaitTime(businessId),
catch (error) {
      logger.error('Error getting waitlist analytics', error);
      throw error;
private async calculateConversionRate(businessId: string): Promise<number> {
    const [accepted, total] = await Promise.all([
      prisma.waitlist.count({
        where: {
          businessId,
          status: WaitlistStatus.ACCEPTED,
),
      prisma.waitlist.count({
        where: {
          businessId,
          status: {
            in: [WaitlistStatus.ACCEPTED, WaitlistStatus.DECLINED, WaitlistStatus.EXPIRED],
),
    ]);


    return total > 0 ? (accepted / total) * 100 : 0;
private async calculateAverageWaitTime(businessId: string): Promise<number> {
    const entries = await prisma.waitlist.findMany({
      where: {
        businessId,
        status: WaitlistStatus.ACCEPTED,
        notifiedAt: { not: null },
select: {
        createdAt: true,
        notifiedAt: true,
if (entries.length === 0) return 0;

    const totalWaitTime = entries.reduce((sum, entry) => {
      return sum + (entry.notifiedAt!.getTime() - entry.createdAt.getTime());
0);


    return totalWaitTime / entries.length / (1000 * 60 * 60); // Convert to hours
