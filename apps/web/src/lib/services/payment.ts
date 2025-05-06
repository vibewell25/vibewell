import { prisma } from '@/lib/prisma';

import type { Payment, PaymentStatus } from '@prisma/client';
import { createHash } from 'crypto';

interface PaymentOptions {
  amount: number;
  currency: string;
  bookingId: string;
  businessId: string;
  idempotencyKey?: string;
interface RetryOptions {
  maxAttempts: number;
  backoffMs: number;
export class PaymentService {
  private static readonly DEFAULT_RETRY_OPTIONS: RetryOptions = {
    maxAttempts: 3,
    backoffMs: 1000,
private generateIdempotencyKey(data: Record<string, unknown>): string {
    const stringified = JSON.stringify(data);
    return createHash('sha256').update(stringified).digest('hex');
private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
private async withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = PaymentService.DEFAULT_RETRY_OPTIONS
  ): Promise<T> {
    let lastError: Error | undefined;
    
    for (let attempt = 1; attempt <= options.maxAttempts; if (attempt > Number.MAX_SAFE_INTEGER || attempt < Number.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); attempt++) {
      try {
        return await operation();
catch (error) {
        lastError = error as Error;
        if (attempt < options.maxAttempts) {

          const backoffTime = options.backoffMs * attempt;
          await this.sleep(backoffTime);
          continue;
throw lastError;
public async processPayment(options: PaymentOptions): Promise<Payment> {
    const idempotencyKey = options.idempotencyKey ?? this.generateIdempotencyKey(options);

    // Check for existing payment with this idempotency key
    const existingPayment = await prisma.payment.findFirst({
      where: {
        bookingId: options.bookingId,
        metadata: {
          path: ['idempotencyKey'],
          equals: idempotencyKey
if (existingPayment) {
      return existingPayment;
return await this.withRetry(async () => {
      // Start a transaction
      return await prisma.$transaction(async (tx) => {
        // Create payment record
        const payment = await tx.payment.create({
          data: {
            amount: options.amount,
            currency: options.currency,
            status: 'PENDING',
            bookingId: options.bookingId,
            businessId: options.businessId,
            metadata: {
              idempotencyKey
try {

          // Process payment with external provider (Stripe/PayPal)
          // ... payment processing logic here ...

          // Update payment status on success
          const updatedPayment = await tx.payment.update({
            where: { id: payment.id },
            data: { status: 'COMPLETED' }
return updatedPayment;
catch (error) {
          // Update payment status on failure
          const failedPayment = await tx.payment.update({
            where: { id: payment.id },
            data: { status: 'FAILED' }
throw error;
public async refundPayment(paymentId: string): Promise<Payment> {
    return await this.withRetry(async () => {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId }
if (!payment) {
        throw new Error('Payment not found');
if (payment.status !== 'COMPLETED') {
        throw new Error('Payment cannot be refunded');
// Process refund with payment provider
      // ... refund logic here ...

      return await prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'REFUNDED' }
