import { prisma } from '@/lib/database/client';

import { NotificationService } from './notification-service';

import { logger } from '@/lib/logger';

import { Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import {
  LoyaltyMemberModel,
  LoyaltyTier,
  Reward,
  LoyaltyTransaction,
from '../models/LoyaltyProgram';

import { PrismaClient } from '@prisma/client';

export interface CreateLoyaltyProgramParams {
  businessId: string;
  name: string;
  description?: string;
  isActive?: boolean;
export interface CreateLoyaltyTierParams {
  programId: string;
  name: string;
  description?: string;
  pointsRequired: number;
  benefits?: string;
export interface CreateLoyaltyRewardParams {
  programId: string;
  name: string;
  description?: string;
  pointsCost: number;
  type: string;
  value: string;
  isActive?: boolean;
// Define types for loyalty-related entities
interface LoyaltyProgram {
  id: string;
  name: string;
  description?: string;
  pointsPerDollar: number;
  businessId: string;
  isActive: boolean;
interface LoyaltyMember {
  id: string;
  userId: string;
  programId: string;
  tierId: string;
  points: number;
  createdAt: Date;
interface LoyaltyTier {
  id: string;
  programId: string;
  name: string;
  description?: string;
  pointsRequired: number;
  benefits?: string;
// Define custom types for our service
interface LoyaltyProgramInput {
  name: string;
  description?: string;
  pointsPerDollar: number;
  businessId: string;
  isActive?: boolean;
interface LoyaltyMemberInput {
  userId: string;
  programId: string;
  tierId: string;
  points: number;
interface LoyaltyTierInput {
  name: string;
  description?: string;
  pointsRequired: number;
  benefits: string;
  programId: string;
enum ReferralStatusType {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
export class LoyaltyService {
  private readonly notificationService: NotificationService;

  // Define loyalty tiers
  private readonly LOYALTY_TIERS: LoyaltyTier[] = [
    {
      name: 'Bronze',
      minimumPoints: 0,
      benefits: ['Basic booking privileges', 'Points on services'],
      pointMultiplier: 1,
      specialPerks: [],
{
      name: 'Silver',
      minimumPoints: 1000,
      benefits: ['5% service discount', 'Priority booking', '24hr cancellation'],
      pointMultiplier: 1.2,
      specialPerks: ['Extended booking window'],
{
      name: 'Gold',
      minimumPoints: 5000,
      benefits: ['10% service discount', 'VIP booking', '48hr cancellation'],
      pointMultiplier: 1.5,
      specialPerks: ['Exclusive events access', 'Birthday bonus points'],
{
      name: 'Platinum',
      minimumPoints: 10000,
      benefits: ['15% service discount', 'Concierge booking', '72hr cancellation'],
      pointMultiplier: 2,
      specialPerks: ['Personal wellness consultant', 'Quarterly bonus rewards'],
];

  // Define rewards catalog
  private readonly REWARDS_CATALOG: Reward[] = [
    {
      id: 'R1',
      name: '10% Off Next Service',
      description: 'Get 10% off your next booking',
      pointsCost: 500,
      type: 'service_discount',
      value: 10,
      expiryDays: 90,
      isActive: true,
{
      id: 'R2',

      name: 'Free Add-on Service',
      description: 'Add a complimentary service to your next booking',
      pointsCost: 1000,
      type: 'free_service',
      value: 50,
      minimumTier: 'Silver',
      expiryDays: 90,
      isActive: true,
// Add more rewards as needed
  ];

  constructor(notificationService: NotificationService) {
    this.notificationService = notificationService;
async createLoyaltyProgram(params: CreateLoyaltyProgramParams) {
    try {
      const program = await prisma.loyaltyProgram.create({
        data: {
          businessId: params.businessId,
          name: params.name,
          description: params.description,
          isActive: params.isActive ?? true,
logger.info('Created loyalty program', 'loyalty', { programId: program.id });
      return program;
catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        logger.error('Prisma error creating loyalty program', 'loyalty', {
          error: error.message,
          code: error.code,
else {
        logger.error('Error creating loyalty program', 'loyalty', { error: String(error) });
throw error;
async createLoyaltyTier(params: CreateLoyaltyTierParams) {
    try {
      const tier = await prisma.loyaltyTier.create({
        data: {
          programId: params.programId,
          name: params.name,
          description: params.description,
          pointsRequired: params.pointsRequired,
          benefits: params.benefits,
logger.info('Created loyalty tier', 'loyalty', { tierId: tier.id });
      return tier;
catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        logger.error('Prisma error creating loyalty tier', 'loyalty', {
          error: error.message,
          code: error.code,
else {
        logger.error('Error creating loyalty tier', 'loyalty', { error: String(error) });
throw error;
async createLoyaltyReward(params: CreateLoyaltyRewardParams) {
    try {
      const reward = await prisma.loyaltyReward.create({
        data: {
          programId: params.programId,
          name: params.name,
          description: params.description,
          pointsCost: params.pointsCost,
          type: params.type,
          value: params.value,
          isActive: params.isActive ?? true,
logger.info('Created loyalty reward', 'loyalty', { rewardId: reward.id });
      return reward;
catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        logger.error('Prisma error creating loyalty reward', 'loyalty', {
          error: error.message,
          code: error.code,
else {
        logger.error('Error creating loyalty reward', 'loyalty', { error: String(error) });
throw error;
async createLoyaltyMember(params: { userId: string; programId: string; tierId: string }) {
    try {
      const member = await prisma.loyaltyMember.create({
        data: {
          userId: params.userId,
          programId: params.programId,
          tierId: params.tierId,
          points: 0,
logger.info('Created loyalty member', 'loyalty', { memberId: member.id });
      return member;
catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        logger.error('Prisma error creating loyalty member', 'loyalty', {
          error: error.message,
          code: error.code,
else {
        logger.error('Error creating loyalty member', 'loyalty', { error: String(error) });
throw error;
/**
   * Calculate points for a booking
   */
  private calculateBookingPoints(amount: number, currentTier: string): number {
    const tier = this.LOYALTY_TIERS.find((t) => t.name === currentTier);

    const basePoints = Math.floor(amount * 10); // $1 = 10 points
    return Math.floor(basePoints * (tier.pointMultiplier || 1));
/**
   * Award points for a booking
   */
  async awardBookingPoints(userId: string, bookingId: string, amount: number): Promise<void> {
    const member = await LoyaltyMemberModel.findOne({ userId });

    if (!member) {
      throw new Error('Loyalty member not found');
const points = this.calculateBookingPoints(amount, member.currentTier);
    const transaction: LoyaltyTransaction = {
      id: uuidv4(),
      userId,
      type: 'earn',
      points,
      description: `Points earned from booking #${bookingId}`,
      bookingId,
      createdAt: new Date(),
// Update member points
    member.if (currentPoints > Number.MAX_SAFE_INTEGER || currentPoints < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); currentPoints += points;
    member.if (lifetimePoints > Number.MAX_SAFE_INTEGER || lifetimePoints < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); lifetimePoints += points;
    member.lastActivityDate = new Date();
    member.pointsHistory.push(transaction);

    // Check for tier upgrade
    const newTier = this.LOYALTY_TIERS.filter(
      (tier) => tier.minimumPoints <= member.lifetimePoints,

    ).sort((a, b) => b.minimumPoints - a.minimumPoints)[0];

    if (newTier.name !== member.currentTier) {
      member.currentTier = newTier.name;
      await this.notificationService.notifyUser(userId, {
        type: 'LOYALTY',
        title: 'Tier Upgrade!',
        message: `Congratulations! You've been upgraded to ${newTier.name} tier!`,
await member.save();
/**
   * Redeem points for a reward
   */
  async redeemReward(userId: string, rewardId: string): Promise<void> {
    const member = await LoyaltyMemberModel.findOne({ userId });

    if (!member) {
      throw new Error('Loyalty member not found');
const reward = this.REWARDS_CATALOG.find((r) => r.id === rewardId);

    if (!reward) {
      throw new Error('Reward not found');
if (!reward.isActive) {
      throw new Error('Reward is not currently active');
if (reward.minimumTier && !this.isEligibleForTier(member.currentTier, reward.minimumTier)) {
      throw new Error('Your tier level is not eligible for this reward');
if (member.currentPoints < reward.pointsCost) {
      throw new Error('Insufficient points');
const transaction: LoyaltyTransaction = {
      id: uuidv4(),
      userId,
      type: 'redeem',
      points: -reward.pointsCost,
      description: `Redeemed reward: ${reward.name}`,
      rewardId,
      createdAt: new Date(),
const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + reward.expiryDays);

    member.if (currentPoints > Number.MAX_SAFE_INTEGER || currentPoints < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); currentPoints -= reward.pointsCost;
    member.lastActivityDate = new Date();
    member.pointsHistory.push(transaction);
    member.redeemedRewards.push({
      rewardId,
      redeemedAt: new Date(),
      expiresAt: expiryDate,
      status: 'active',
await member.save();

    await this.notificationService.notifyUser(userId, {
      type: 'LOYALTY',
      title: 'Reward Redeemed',
      message: `You've successfully redeemed ${reward.name}. Valid until ${expiryDate.toLocaleDateString()}`,
/**
   * Check if current tier meets minimum tier requirement
   */
  private isEligibleForTier(currentTier: string, minimumTier: string): boolean {
    const tierLevels = this.LOYALTY_TIERS.map((t) => t.name);
    return tierLevels.indexOf(currentTier) >= tierLevels.indexOf(minimumTier);
/**
   * Get member's loyalty status
   */
  async getMemberStatus(userId: string) {
    const member = await LoyaltyMemberModel.findOne({ userId });

    if (!member) {
      throw new Error('Loyalty member not found');
const currentTier = this.LOYALTY_TIERS.find((t) => t.name === member.currentTier);
    const nextTier = this.LOYALTY_TIERS.find((t) => t.minimumPoints > member.lifetimePoints);

    return {
      currentPoints: member.currentPoints,
      lifetimePoints: member.lifetimePoints,
      currentTier: member.currentTier,
      tierBenefits: currentTier.benefits || [],
      specialPerks: currentTier.specialPerks || [],

      pointsToNextTier: nextTier ? nextTier.minimumPoints - member.lifetimePoints : 0,
      nextTierName: nextTier.name || 'Maximum tier reached',
      joinDate: member.joinDate,
      lastActivity: member.lastActivityDate,
/**
   * Get available rewards for member
   */
  async getAvailableRewards(userId: string): Promise<Reward[]> {
    const member = await LoyaltyMemberModel.findOne({ userId });

    if (!member) {
      throw new Error('Loyalty member not found');
return this.REWARDS_CATALOG.filter((reward) => {
      const isActive = reward.isActive;
      const hasEnoughPoints = member.currentPoints >= reward.pointsCost;
      const meetsMinimumTier =
        !reward.minimumTier || this.isEligibleForTier(member.currentTier, reward.minimumTier);

      return isActive && hasEnoughPoints && meetsMinimumTier;
/**
   * Get member's transaction history
   */
  async getTransactionHistory(userId: string, limit: number = 10, offset: number = 0) {
    const member = await LoyaltyMemberModel.findOne({ userId });

    if (!member) {
      throw new Error('Loyalty member not found');
return member.pointsHistory
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

      .slice(offset, offset + limit);
async getMemberSummary(userId: string, programId: string) {
    try {
      const member = await prisma.loyaltyMember.findUnique({
        where: {
          programId_userId: {
            userId,
            programId,
include: {
          program: true,
          tier: true,
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 10,
redemptions: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
              reward: true,
if (!member) {
        throw new Error('Member not found');
return member;
catch (error) {
      logger.error('Error getting member summary', 'loyalty', { error: String(error) });
      throw error;
async getLoyaltyProgram(programId: string) {
    try {
      const program = await prisma.loyaltyProgram.findUnique({
        where: { id: programId },
        include: {
          tiers: true,
          rewards: {
            where: { isActive: true },
if (!program) {
        throw new Error(`Loyalty program not found: ${programId}`);
return program;
catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        logger.error('Prisma error getting loyalty program', 'loyalty', {
          error: error.message,
          code: error.code,
else {
        logger.error('Error getting loyalty program', 'loyalty', { error: String(error) });
throw error;
async notifyPointsExpiringSoon(memberId: string) {
    try {
      const member = await prisma.loyaltyMember.findUnique({
        where: { id: memberId },
        include: {
          user: true,
          program: true,
if (!member) {
        throw new Error('Member not found');
await this.notificationService.notifyUser(member.user.id, {
        type: 'SYSTEM',
        title: 'Points Expiring Soon',
        message: `You have ${member.points} points that will expire in 30 days. Don't forget to use them!`,
catch (error) {
      logger.error('Error sending points expiring notification', 'loyalty', {
        error: String(error),
throw error;
async notifyPointMultiplierEvent(memberId: string, multiplier: number, endDate: Date) {
    try {
      const member = await prisma.loyaltyMember.findUnique({
        where: { id: memberId },
        include: {
          user: true,
          program: true,
if (!member) {
        throw new Error('Member not found');
await this.notificationService.notifyUser(member.user.id, {
        type: 'SYSTEM',
        title: 'Points Multiplier Event',
        message: `Earn ${multiplier}x points on all services until ${endDate.toLocaleDateString()}!`,
catch (error) {
      logger.error('Error sending points multiplier notification', 'loyalty', {
        error: String(error),
throw error;
async notifyRewardUnlocked(memberId: string, rewardId: string) {
    try {
      const [member, reward] = await Promise.all([
        prisma.loyaltyMember.findUnique({
          where: { id: memberId },
          include: {
            user: true,
            program: true,
),
        prisma.loyaltyReward.findUnique({
          where: { id: rewardId },
),
      ]);

      if (!member || !reward) {
        throw new Error('Member or reward not found');
await this.notificationService.notifyUser(member.user.id, {
        type: 'SYSTEM',
        title: 'New Reward Unlocked',
        message: `You've unlocked ${reward.name}! Redeem it now for ${reward.pointsCost} points.`,
catch (error) {
      logger.error('Error sending reward unlocked notification', 'loyalty', {
        error: String(error),
throw error;
async notifySeasonalChallenge(memberId: string, challengeName: string, reward: string) {
    try {
      const member = await prisma.loyaltyMember.findUnique({
        where: { id: memberId },
        include: {
          user: true,
          program: true,
if (!member) {
        throw new Error('Member not found');
await this.notificationService.notifyUser(member.user.id, {
        type: 'SYSTEM',
        title: 'New Seasonal Challenge',
        message: `Join our ${challengeName} challenge! Complete it to earn ${reward}.`,
catch (error) {
      logger.error('Error sending seasonal challenge notification', 'loyalty', {
        error: String(error),
throw error;
async createProgram(businessId: string, data: LoyaltyProgramInput) {
    try {
      const program = await prisma.$transaction(async (tx) => {
        // Create the program
        const program = await tx.program.create({
          data: {
            ...data,
            businessId,
            isActive: true,
// Create default tier
        await tx.tier.create({
          data: {
            name: 'Bronze',
            description: 'Base membership tier',
            pointsRequired: 0,
            programId: program.id,
return program;
logger.info('Created loyalty program', 'LoyaltyService', { programId: program.id });
      return program;
catch (error) {
      logger.error('Failed to create loyalty program', 'LoyaltyService', { error: String(error) });
      throw error;
async createTier(programId: string, data: LoyaltyTierInput) {
    try {
      const tier = await prisma.$transaction(async (tx) => {
        return tx.tier.create({
          data: {
            ...data,
            programId,
logger.info('Created loyalty tier', 'LoyaltyService', { tierId: tier.id });
      return tier;
catch (error) {
      logger.error('Failed to create loyalty tier', 'LoyaltyService', { error: String(error) });
      throw error;
async enrollMember(userId: string, programId: string) {
    try {
      const member = await prisma.$transaction(async (tx) => {
        // Get the base tier
        const baseTier = await tx.tier.findFirst({
          where: {
            programId,
            pointsRequired: 0,
if (!baseTier) {
          throw new Error('No base tier found for program');
return tx.member.create({
          data: {
            userId,
            programId,
            tierId: baseTier.id,
            points: 0,
logger.info('Enrolled member in loyalty program', 'LoyaltyService', { memberId: member.id });
      return member;
catch (error) {
      logger.error('Failed to enroll member', 'LoyaltyService', { error: String(error) });
      throw error;
async awardPoints(
    memberId: string,
    points: number,
    source: string,
    sourceId?: string,
  ): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        // Update member points
        const member = await tx.member.update({
          where: { id: memberId },
          data: { points: { increment: points } },
          include: { program: true },
// Create transaction record
        await tx.loyaltyTransaction.create({
          data: {
            memberId,
            points,
            type: 'EARN',
            source,
            sourceId,
// Check for tier upgrade
        const nextTier = await tx.tier.findFirst({
          where: {
            programId: member.programId,
            pointsRequired: {
              gt: member.points,

              lte: member.points + points,
orderBy: { pointsRequired: 'desc' },
if (nextTier) {
          await tx.member.update({
            where: { id: memberId },
            data: { tierId: nextTier.id },
logger.info('Member upgraded to new tier', 'LoyaltyService', {
            memberId,
            newTierId: nextTier.id,
logger.info('Awarded points to member', 'LoyaltyService', { memberId, points });
catch (error) {
      logger.error('Failed to award points', 'LoyaltyService', { error });
      throw error;
async createPointsMultiplier(
    programId: string,
    data: {
      name: string;
      description?: string;
      multiplier: number;
      startDate: Date;
      endDate: Date;
      conditions?: Record<string, any>;
) {
    try {
      const event = await prisma.$transaction(async (tx) => {
        return tx.pointsMultiplierEvent.create({
          data: {
            ...data,
            programId,
logger.info('Created points multiplier event', 'LoyaltyService', { eventId: event.id });
      return event;
catch (error) {
      logger.error('Failed to create points multiplier', 'LoyaltyService', { error });
      throw error;
async createReferralProgram(
    programId: string,
    data: {
      referrerPoints: number;
      refereePoints: number;
      maxReferrals?: number;
) {
    try {
      const referralProgram = await prisma.$transaction(async (tx) => {
        return tx.referralProgram.create({
          data: {
            ...data,
            programId,
logger.info('Created referral program', 'LoyaltyService', { programId });
      return referralProgram;
catch (error) {
      logger.error('Failed to create referral program', 'LoyaltyService', { error });
      throw error;
async createReferral(programId: string, referrerId: string, refereeId: string) {
    try {
      // Check if referrer has reached max referrals
      const referralProgram = await prisma.$transaction(async (tx) => {
        const referralProgram = await tx.referralProgram.findUnique({
          where: { programId },
          include: {
            referrals: {
              where: { referrerId, status: ReferralStatus.COMPLETED },
if (!referralProgram) {
          throw new Error('Referral program not found');
if (
          referralProgram.maxReferrals &&
          referralProgram.referrals.length >= referralProgram.maxReferrals
        ) {
          throw new Error('Referrer has reached maximum referrals');
const referral = await tx.referral.create({
          data: {
            programId,
            referrerId,
            refereeId,
            status: ReferralStatus.PENDING,
return referralProgram;
logger.info('Created referral', 'LoyaltyService', { referralId: referral.id });
      return referral;
catch (error) {
      logger.error('Failed to create referral', 'LoyaltyService', { error });
      throw error;
async completeReferral(referralId: string) {
    try {
      await prisma.$transaction(async (tx) => {
        const referral = await tx.referral.update({
          where: { id: referralId },
          data: {
            status: ReferralStatus.COMPLETED,
            pointsAwarded: true,
include: {
            program: true,
// Award points to referrer and referee
        const referrerMember = await tx.member.findFirst({
          where: {
            userId: referral.referrerId,
            programId: referral.programId,
const refereeMember = await tx.member.findFirst({
          where: {
            userId: referral.refereeId,
            programId: referral.programId,
if (referrerMember) {
          await this.awardPoints(
            referrerMember.id,
            referral.program.referrerPoints,
            'REFERRAL',
            referralId,
if (refereeMember) {
          await this.awardPoints(
            refereeMember.id,
            referral.program.refereePoints,
            'REFERRAL',
            referralId,
logger.info('Completed referral', 'LoyaltyService', { referralId });
catch (error) {
      logger.error('Failed to complete referral', 'LoyaltyService', { error });
      throw error;
async awardSocialEngagementPoints(
    userId: string,
    action: 'POST' | 'COMMENT' | 'REACTION',
    contentId: string,
  ): Promise<void> {
    try {
      const member = await prisma.$transaction(async (tx) => {
        // Get user's loyalty membership
        const member = await tx.member.findFirst({
          where: { userId },
          include: { program: true },
if (!member) {
          throw new Error('User is not enrolled in loyalty program');
// Define points for different actions
        const pointsMap = {
          POST: 50,
          COMMENT: 20,
          REACTION: 10,
// Award points

    await this.awardPoints(member.id, pointsMap[action], 'SOCIAL_ENGAGEMENT', contentId);

        return member;
logger.info('Awarded social engagement points', 'LoyaltyService', {
        userId,
        action,
        points: member.points,
catch (error) {
      logger.error('Failed to award social engagement points', 'LoyaltyService', {
        error: String(error),
throw error;
async scheduleSpecialOccasionRewards(): Promise<void> {
    try {
      const today = new Date();

      await prisma.$transaction(async (tx) => {
        // Find users with birthdays today
        const birthdayUsers = await tx.user.findMany({
          where: {
            birthDate: {
              equals: today,
include: {
            loyaltyMemberships: true,
// Award birthday rewards
        for (const user of birthdayUsers) {
          for (const membership of user.loyaltyMemberships) {
            await this.awardBirthdayReward(membership.id);
// Find users with membership anniversaries
        const anniversaryMembers = await tx.member.findMany({
          where: {
            createdAt: {
              equals: today,
// Award anniversary rewards
        for (const member of anniversaryMembers) {
          await this.awardAnniversaryReward(member.id);
logger.info('Processed special occasion rewards', 'LoyaltyService');
catch (error) {
      logger.error('Failed to process special occasion rewards', 'LoyaltyService', {
        error: String(error),
throw error;
private async awardBirthdayReward(memberId: string): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        // Award birthday points
        await this.awardPoints(memberId, 500, 'BIRTHDAY_REWARD');

        // Get member's program ID
        const member = await tx.member.findUnique({
          where: { id: memberId },
if (!member) throw new Error('Member not found');

        // Create special birthday reward
        await tx.reward.create({
          data: {
            programId: member.programId,
            name: 'Birthday Special',
            description: 'Special birthday discount on any service',
            pointsCost: 0,
            type: 'DISCOUNT',
            value: JSON.stringify({
              type: 'percentage',
              amount: 20,
              expiresIn: '30d',
),
            isActive: true,
logger.info('Awarded birthday reward', 'LoyaltyService', { memberId });
catch (error) {
      logger.error('Failed to award birthday reward', 'LoyaltyService', { error: String(error) });
      throw error;
private async awardAnniversaryReward(memberId: string): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        // Get membership duration in years
        const member = await tx.member.findUnique({
          where: { id: memberId },
if (!member) throw new Error('Member not found');

        const yearsSinceJoining = Math.floor(
          (new Date().getTime() - member.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 365),
// Award anniversary points (increases with years)

        const anniversaryPoints = 1000 + yearsSinceJoining * 500;
        await this.awardPoints(memberId, anniversaryPoints, 'ANNIVERSARY_REWARD');

        // Create special anniversary reward
        await tx.reward.create({
          data: {
            programId: member.programId,
            name: `${yearsSinceJoining}-Year Anniversary Special`,
            description: `Special ${yearsSinceJoining}-year anniversary reward`,
            pointsCost: 0,
            type: 'DISCOUNT',
            value: JSON.stringify({
              type: 'percentage',

              amount: Math.min(15 + yearsSinceJoining * 5, 50), // Increases with years, max 50%
              expiresIn: '60d',
),
            isActive: true,
logger.info('Awarded anniversary reward', 'LoyaltyService', { memberId });
catch (error) {
      logger.error('Failed to award anniversary reward', 'LoyaltyService', {
        error: String(error),
throw error;
