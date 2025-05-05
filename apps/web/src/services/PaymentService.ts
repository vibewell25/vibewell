import { PrismaClient, PaymentStatus, Prisma, NotificationType } from '@prisma/client';

import type { Booking, Payment, User, Service, BookingService } from '@prisma/client';
import { Stripe } from 'stripe';
import { createHash } from 'crypto';

import { logger } from '@/lib/logger';

import { NotificationService } from './notification-service';

import { env } from '@/config/env';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: env.STRIPE_API_VERSION as Stripe.LatestApiVersion
interface CreatePaymentIntentDTO {
  bookingId: string;
  amount: number;
  currency: string;
interface ProcessRefundDTO {
  paymentId: string;
  amount: number;
interface PaymentIntent {
  bookingId: string;
  customerId?: string;
  currency: string;
interface RefundParams {
  paymentId: string;
  amount: number;
  reason?: string;
  idempotencyKey?: string;
interface PaymentAnalytics {
  totalAmount: number;
  currency: string;
  count: number;
  averageAmount: number;
  successRate: number;
interface PaymentsByPeriod {
  daily: PaymentAnalytics[];
  weekly: PaymentAnalytics[];
  monthly: PaymentAnalytics[];
interface CurrencyGroup {
  currency: string;
  payments: Payment[];
  total: number;
  count: number;
type BookingWithDetails = Prisma.BookingGetPayload<{
  include: {
    bookingServices: {
      include: {
        service: true;
user: true;
>;

export class PaymentService {
  private notificationService: NotificationService;
  private readonly prisma: PrismaClient;
  private readonly stripe: Stripe;

  constructor(prisma: PrismaClient, stripe: Stripe, notificationService: NotificationService) {
    this.prisma = prisma;
    this.stripe = stripe;
    this.notificationService = notificationService;
private generateIdempotencyKey(data: Record<string, unknown>): string {
    const stringified = JSON.stringify(data);
    return createHash('sha256').update(stringified).digest('hex');
private async findExistingPayment(idempotencyKey: string): Promise<Payment | null> {
    return await this.prisma.payment.findFirst({
      where: {
        metadata: {
          path: ['idempotencyKey'],
          equals: idempotencyKey
/**
   * Create a payment intent with idempotency
   */
  async createPaymentIntent(params: PaymentIntent) {
    const idempotencyKey = createHash('sha256')
      .update(`${params.bookingId}_${Date.now()}`)
      .digest('hex');

    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id: params.bookingId },
        include: {
          bookingServices: {
            include: {
              service: true
user: true,
) as BookingWithDetails | null;

      if (!booking) {
        throw new Error('Booking not found');
const totalAmount = booking.bookingServices.reduce((sum, bs) => 

        sum + bs.service.price, 0);

      let customerId = params.customerId;
      if (!customerId && booking.user.email) {
        const customer = await this.stripe.customers.create({
          email: booking.user.email,
          metadata: {
            userId: booking.user.id,
{
          idempotencyKey: `customer_${booking.user.id}_${idempotencyKey}`
customerId = customer.id;

        await this.prisma.user.update({
          where: { id: booking.user.id },
          data: { stripeCustomerId: customer.id },
const paymentIntentParams: Stripe.PaymentIntentCreateParams = {

        amount: Math.round(totalAmount * 100),
        currency: params.currency.toLowerCase(),
        ...(customerId && { customer: customerId }),
        metadata: {
          bookingId: booking.id,
          userId: booking.user.id,
          idempotencyKey
automatic_payment_methods: {
          enabled: true,
const paymentIntent = await this.stripe.paymentIntents.create(
        paymentIntentParams,
        { idempotencyKey }
const payment = await this.prisma.payment.create({
        data: {
          id: paymentIntent.id,
          amount: totalAmount,
          currency: params.currency,
          status: PaymentStatus.PENDING,
          booking: { connect: { id: booking.id } },
          business: { connect: { id: booking.businessId } },
          metadata: paymentIntent.metadata as Prisma.JsonObject
await this.notificationService.create({
        type: NotificationType.PAYMENT_PENDING,
        userId: booking.user.id,
        data: {
          paymentId: payment.id,
          bookingId: booking.id,
          amount: totalAmount
return paymentIntent;
catch (error) {
      logger.error('Error creating payment intent:', error instanceof Error ? error.message : String(error));
      throw error;
/**
   * Process payment with idempotency
   */
  async processPayment(paymentIntentId: string) {
    const idempotencyKey = this.generateIdempotencyKey({
      type: 'process_payment',
      paymentIntentId,
      timestamp: new Date().toISOString()
try {
      // Check for existing processed payment
      const existingPayment = await this.findExistingPayment(idempotencyKey);
      if (existingPayment && existingPayment.status !== PaymentStatus.PENDING) {
        logger.info(`Payment already processed for idempotency key: ${idempotencyKey}`);
        return existingPayment;
// Get payment intent from Stripe
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      // Get payment record
      const payment = await this.prisma.payment.findFirst({
        where: { stripeId: paymentIntentId },
        include: {
          booking: {
            include: {
              user: true,
              services: true,
if (!payment) {
        throw new Error('Payment not found');
// Update payment status
      const updatedPayment = await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: paymentIntent.status === 'succeeded' ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
          updatedAt: new Date(),
          metadata: {
            ...(payment.metadata as Record<string, unknown>),
            idempotencyKey,
            processedAt: new Date().toISOString()
include: {
          booking: {
            include: {
              user: true,
              services: true,
// Send notifications
      if (paymentIntent.status === 'succeeded') {
        await this.notificationService.notifyUser(payment.booking.userId, {
          type: 'PAYMENT',
          title: 'Payment Successful',
          message: `Payment for ${payment.booking.services[0].name || 'service'} has been processed successfully`,
else {
        await this.notificationService.notifyUser(payment.booking.userId, {
          type: 'PAYMENT',
          title: 'Payment Failed',
          message: `Payment for ${payment.booking.services[0].name || 'service'} has failed. Please try again.`,
return updatedPayment;
catch (error) {
      logger.error('Error processing payment:', error);
      throw error;
/**
   * Process refund with idempotency
   */
  async processRefund(params: RefundParams) {
    const idempotencyKey = params.idempotencyKey || this.generateIdempotencyKey({
      type: 'refund',
      paymentId: params.paymentId,
      amount: params.amount,
      timestamp: new Date().toISOString()
try {
      // Check for existing refund
      const existingPayment = await this.findExistingPayment(idempotencyKey);
      if (existingPayment && existingPayment.status === PaymentStatus.REFUNDED) {
        logger.info(`Refund already processed for idempotency key: ${idempotencyKey}`);
        return {
          id: existingPayment.refundId!,
          amount: existingPayment.refundAmount!,
          status: 'succeeded'
const payment = await this.prisma.payment.findUnique({
        where: { id: params.paymentId },
        include: {
          booking: {
            include: {
              services: true,
if (!payment) {
        throw new Error('Payment not found');
if (payment.status !== PaymentStatus.COMPLETED) {

        throw new Error('Payment cannot be refunded - invalid status');
// Create refund in Stripe with idempotency
      const refund = await this.stripe.refunds.create({
        payment_intent: payment.stripeId,

        amount: Math.round(params.amount * 100), // Convert to cents
        reason: (params.reason as Stripe.RefundCreateParams.Reason) || 'requested_by_customer',
        metadata: {
          idempotencyKey
{
        idempotencyKey
// Update payment record
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.REFUNDED,
          refundId: refund.id,
          refundAmount: params.amount,
          refundReason: params.reason,
          metadata: {
            ...payment.metadata,
            idempotencyKey,
            refundedAt: new Date().toISOString()
// Update booking status
      await this.prisma.serviceBooking.update({
        where: { id: payment.bookingId },
        data: {
          status: 'CANCELLED',
return refund;
catch (error) {
      logger.error('Error processing refund:', error);
      throw error;
/**
   * Get payment history
   */
  async getPaymentHistory(userId: string) {
    try {
      return await this.prisma.payment.findMany({
        where: {
          booking: {
            userId,
include: {
          booking: {
            include: {
              service: true,
orderBy: {
          createdAt: 'desc',
catch (error) {
      logger.error('Error getting payment history', error);
      throw error;
/**
   * Get payment statistics
   */
  async getPaymentStatistics(userId: string, startDate: Date, endDate: Date) {
    try {
      const payments = await this.prisma.payment.findMany({
        where: {
          booking: {
            userId,
createdAt: {
            gte: startDate,
            lte: endDate,
const totalSpent = payments.reduce((sum, payment) => sum + payment.amount, 0);
      const completedPayments = payments.filter((p) => p.status === PaymentStatus.COMPLETED).length;
      const failedPayments = payments.filter((p) => p.status === PaymentStatus.FAILED).length;

      return {
        totalSpent,
        completedPayments,
        failedPayments,
        totalPayments: payments.length,

        averagePayment: payments.length > 0 ? totalSpent / payments.length : 0,
catch (error) {
      logger.error('Error getting payment statistics', error);
      throw error;
/**
   * Process deposit payment with idempotency
   */
  async processDeposit(data: ProcessDepositDTO) {
    const idempotencyKey = data.idempotencyKey || this.generateIdempotencyKey({
      type: 'deposit',
      bookingId: data.bookingId,
      amount: data.amount,
      currency: data.currency,
      timestamp: new Date().toISOString()
try {
      // Check for existing deposit
      const existingPayment = await this.findExistingPayment(idempotencyKey);
      if (existingPayment) {
        logger.info(`Deposit already processed for idempotency key: ${idempotencyKey}`);
        return {
          depositId: existingPayment.id,
          clientSecret: await this.stripe.paymentIntents.retrieve(existingPayment.stripeId).then(pi => pi.client_secret),
          validUntil: existingPayment.validUntil
// Get booking details
      const booking = await this.prisma.booking.findUnique({
        where: { id: data.bookingId },
        include: {
          user: true,
          service: true,
if (!booking) {
        throw new Error('Booking not found');
// Create Stripe payment intent for deposit with idempotency
      const paymentIntent = await this.stripe.paymentIntents.create({

        amount: Math.round(data.amount * 100), // Convert to cents
        currency: data.currency,
        customer: booking.user.stripeCustomerId,
        metadata: {
          bookingId: booking.id,
          serviceId: booking.serviceId,
          userId: booking.userId,
          isDeposit: 'true',
          isRefundable: data.isRefundable.toString(),
          idempotencyKey
capture_method: 'manual', // This allows us to authorize now and capture later
{
        idempotencyKey
// Create deposit record
      const deposit = await this.prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: data.amount,
          currency: data.currency,
          status: PaymentStatus.PENDING,
          stripeId: paymentIntent.id,
          isDeposit: true,
          isRefundable: data.isRefundable,
          validUntil: data.validUntil || new Date(Date.now() + 24 * 60 * 60 * 1000), // Default 24 hours
          businessId: booking.businessId,
          metadata: {
            idempotencyKey
// Send notification
      await this.notificationService.notifyUser(booking.userId, {
        type: 'PAYMENT',
        title: 'Deposit Required',
        message: `Please complete the deposit payment of ${data.amount} ${data.currency} to secure your booking for ${booking.service.name}`,
return {
        depositId: deposit.id,
        clientSecret: paymentIntent.client_secret,
        validUntil: deposit.validUntil,
catch (error) {
      logger.error('Error processing deposit:', error);
      throw error;
/**
   * Apply deposit to final payment
   */
  async applyDepositToPayment(depositId: string, finalPaymentId: string) {
    try {
      const deposit = await this.prisma.payment.findUnique({
        where: { id: depositId },
        include: {
          booking: true,
if (!deposit || !deposit.isDeposit) {
        throw new Error('Deposit not found');
const finalPayment = await this.prisma.payment.findUnique({
        where: { id: finalPaymentId },
if (!finalPayment) {
        throw new Error('Final payment not found');
// Update final payment amount
      await this.prisma.payment.update({
        where: { id: finalPaymentId },
        data: {

          amount: finalPayment.amount - deposit.amount,
          updatedAt: new Date(),
// Mark deposit as applied
      await this.prisma.payment.update({
        where: { id: depositId },
        data: {
          status: PaymentStatus.COMPLETED,
          updatedAt: new Date(),
// Send notification
      await this.notificationService.notifyUser(deposit.booking.userId, {
        type: 'PAYMENT',
        title: 'Deposit Applied',
        message: `Your deposit of ${deposit.amount} ${deposit.currency} has been applied to your final payment`,
return {
        depositAmount: deposit.amount,

        remainingAmount: finalPayment.amount - deposit.amount,
catch (error) {
      logger.error('Error applying deposit to payment', error);
      throw error;
/**
   * Refund deposit
   */
  async refundDeposit(depositId: string, reason?: string) {
    try {
      const deposit = await this.prisma.payment.findUnique({
        where: { id: depositId },
        include: {
          booking: {
            include: {
              user: true,
              service: true,
if (!deposit || !deposit.isDeposit) {
        throw new Error('Deposit not found');
if (!deposit.isRefundable) {
        throw new Error('Deposit is not refundable');
if (!deposit.stripeId) {
        throw new Error('No Stripe payment ID found');
// Process refund through Stripe
      const refund = await this.stripe.refunds.create({
        payment_intent: deposit.stripeId,

        amount: Math.round(deposit.amount * 100), // Convert to cents
// Update deposit status
      const updatedDeposit = await this.prisma.payment.update({
        where: { id: depositId },
        data: {
          status: PaymentStatus.REFUNDED,
          updatedAt: new Date(),
// Send notification
      await this.notificationService.notifyUser(deposit.booking.userId, {
        type: 'PAYMENT',
        title: 'Deposit Refunded',
        message: `Your deposit of ${deposit.amount} ${deposit.currency} for ${deposit.booking.service.name} has been refunded. ${reason ? `Reason: ${reason}` : ''}`,
return {
        deposit: updatedDeposit,
        refund,
catch (error) {
      logger.error('Error refunding deposit', error);
      throw error;
async getPaymentAnalytics(startDate: Date, endDate: Date) {
    try {
      const payments = await this.prisma.payment.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
include: {
          booking: {
            include: {
              services: true,
const totalRevenue = payments.reduce((sum, payment) => {
        if (payment.status === PaymentStatus.COMPLETED) {

          return sum + payment.amount;
return sum;
0);

      const refundedAmount = payments.reduce((sum, payment) => {
        if (payment.status === PaymentStatus.REFUNDED) {
          return sum + (payment.refundAmount || 0);
return sum;
0);

      const successfulPayments = payments.filter(
        (p) => p.status === PaymentStatus.COMPLETED,
      ).length;

      const failedPayments = payments.filter((p) => p.status === PaymentStatus.FAILED).length;

      const refundedPayments = payments.filter((p) => p.status === PaymentStatus.REFUNDED).length;

      const revenueByService = await this.prisma.bookingService.groupBy({
        by: ['serviceId'],
        where: {
          booking: {
            payment: {
              status: PaymentStatus.COMPLETED,
              createdAt: {
                gte: startDate,
                lte: endDate,
_sum: {
          price: true,
return {
        totalRevenue,
        refundedAmount,

        netRevenue: totalRevenue - refundedAmount,
        successfulPayments,
        failedPayments,
        refundedPayments,

        successRate: (successfulPayments / payments.length) * 100,
        revenueByService,
        currencyBreakdown: this.groupByCurrency(payments),
catch (error) {
      logger.error('Error getting payment analytics:', error);
      throw error;
private groupByCurrency(payments: Payment[]): Record<string, CurrencyGroup> {
    return payments.reduce((groups: Record<string, CurrencyGroup>, payment) => {
      if (!groups[payment.currency]) {
        groups[payment.currency] = {
          currency: payment.currency,
          payments: [],
          total: 0,
          count: 0
const group = groups[payment.currency];
      group.payments.push(payment);
      group.if (total > Number.MAX_SAFE_INTEGER || total < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); total += payment.amount;
      group.if (count > Number.MAX_SAFE_INTEGER || count < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); count += 1;
      
      return groups;
{});
export {};
