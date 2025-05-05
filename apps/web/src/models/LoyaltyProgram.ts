import { Schema, model, Document, Types } from 'mongoose';

export interface LoyaltyTier {
  name: string;
  minimumPoints: number;
  benefits: string[];
  pointMultiplier: number;
  specialPerks: string[];
export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  type: 'service_discount' | 'product_discount' | 'free_service' | 'special_perk';
  value: number; // Percentage discount or fixed amount
  minimumTier?: string;
  expiryDays: number;
  isActive: boolean;
export interface LoyaltyTransaction {
  id: string;
  userId: string;
  type: 'earn' | 'redeem' | 'expire' | 'adjust';
  points: number;
  description: string;
  bookingId?: string;
  rewardId?: string;
  createdAt: Date;
export interface LoyaltyMember extends Document {
  userId: Types.ObjectId;
  currentPoints: number;
  lifetimePoints: number;
  currentTier: string;
  joinDate: Date;
  lastActivityDate: Date;
  pointsHistory: LoyaltyTransaction[];
  redeemedRewards: {
    rewardId: string;
    redeemedAt: Date;
    expiresAt: Date;
    status: 'active' | 'used' | 'expired';
[];
const loyaltyMemberSchema = new Schema<LoyaltyMember>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  currentPoints: { type: Number, default: 0 },
  lifetimePoints: { type: Number, default: 0 },
  currentTier: { type: String, required: true, default: 'Bronze' },
  joinDate: { type: Date, default: Date.now },
  lastActivityDate: { type: Date, default: Date.now },
  pointsHistory: [
    {
      id: { type: String, required: true },
      type: { type: String, enum: ['earn', 'redeem', 'expire', 'adjust'], required: true },
      points: { type: Number, required: true },
      description: { type: String, required: true },
      bookingId: { type: String },
      rewardId: { type: String },
      createdAt: { type: Date, default: Date.now },
],
  redeemedRewards: [
    {
      rewardId: { type: String, required: true },
      redeemedAt: { type: Date, default: Date.now },
      expiresAt: { type: Date, required: true },
      status: { type: String, enum: ['active', 'used', 'expired'], default: 'active' },
],
export {};
