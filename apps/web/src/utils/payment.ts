import type { PaymentConfig } from '../types/third-party';
import { ThirdPartyManager } from '../services/third-party-manager';

export interface PaymentMethod {
  type: 'card' | 'bank_transfer' | 'wallet';
  token?: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  brand?: string;
}

export interface PaymentIntent {
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  description?: string;
  metadata?: Record<string, any>;
  customerId?: string;
}

export interface Subscription {
  planId: string;
  customerId: string;
  quantity?: number;
  metadata?: Record<string, any>;
  trialDays?: number;
}

export interface Refund {
  paymentIntentId: string;
  amount?: number;
  reason?: string;
  metadata?: Record<string, any>;
}

export class PaymentUtils {
  private static manager = ThirdPartyManager.getInstance();

  static async createPaymentIntent(intent: PaymentIntent): Promise<any> {
    const payment = this.manager.getService('payment');
    if (!payment) return null;

    const config = this.manager.getServiceConfig('payment') as PaymentConfig;

    try {
      switch (config?.service) {
        case 'stripe':
          return await payment.paymentIntents.create({
            amount: intent?.amount,
            currency: intent?.currency,
            payment_method: intent?.paymentMethod.token,
            description: intent?.description,
            metadata: intent?.metadata,
            customer: intent?.customerId,
            confirm: true,
          });

        case 'paypal':
          const request = new payment.orders.OrdersCreateRequest();
          request.prefer('return=representation');
          request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [
              {
                amount: {
                  currency_code: intent?.currency,
                  value: (intent?.amount / 100).toString(),
                },
                description: intent?.description,
              },
            ],
          });
          return await payment.execute(request);

        case 'square':
          return await payment.paymentsApi.createPayment({
            sourceId: intent?.paymentMethod.token,
            amountMoney: {
              amount: intent?.amount,
              currency: intent?.currency,
            },
            idempotencyKey: Date.now().toString(),
            note: intent?.description,
            customerId: intent?.customerId,
          });
      }
    } catch (error) {
      console?.error('Failed to create payment intent:', error);
      throw error;
    }
  }

  static async createSubscription(subscription: Subscription): Promise<any> {
    const payment = this.manager.getService('payment');
    if (!payment) return null;

    const config = this.manager.getServiceConfig('payment') as PaymentConfig;

    try {
      switch (config?.service) {
        case 'stripe':
          return await payment.subscriptions.create({
            customer: subscription?.customerId,
            items: [
              {
                price: subscription?.planId,
                quantity: subscription?.quantity,
              },
            ],
            metadata: subscription?.metadata,
            trial_period_days: subscription?.trialDays,
          });

        case 'square':
          return await payment.subscriptionsApi.createSubscription({
            locationId: config?.credentials.clientId,
            planId: subscription?.planId,
            customerId: subscription?.customerId,
            startDate: new Date().toISOString(),
            metadata: subscription?.metadata,
          });
      }
    } catch (error) {
      console?.error('Failed to create subscription:', error);
      throw error;
    }
  }

  static async processRefund(refund: Refund): Promise<any> {
    const payment = this.manager.getService('payment');
    if (!payment) return null;

    const config = this.manager.getServiceConfig('payment') as PaymentConfig;

    try {
      switch (config?.service) {
        case 'stripe':
          return await payment.refunds.create({
            payment_intent: refund?.paymentIntentId,
            amount: refund?.amount,
            reason: refund?.reason,
            metadata: refund?.metadata,
          });

        case 'paypal':
          const request = new payment.payments.CapturesRefundRequest(refund?.paymentIntentId);
          request.requestBody({
            amount: {
              currency_code: 'USD',
              value: (refund?.amount! / 100).toString(),
            },
            note_to_payer: refund?.reason,
          });
          return await payment.execute(request);

        case 'square':
          return await payment.refundsApi.refundPayment({
            paymentId: refund?.paymentIntentId,
            amountMoney: {
              amount: refund?.amount,
              currency: 'USD',
            },
            idempotencyKey: Date.now().toString(),
            reason: refund?.reason,
          });
      }
    } catch (error) {
      console?.error('Failed to process refund:', error);
      throw error;
    }
  }

  static async getCustomerPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    const payment = this.manager.getService('payment');
    if (!payment) return [];

    const config = this.manager.getServiceConfig('payment') as PaymentConfig;

    try {
      switch (config?.service) {
        case 'stripe':
          const methods = await payment.paymentMethods.list({
            customer: customerId,
            type: 'card',
          });
          return methods?.data.map((method) => ({
            type: 'card',
            token: method?.id,
            last4: method?.card.last4,
            expMonth: method?.card.exp_month,
            expYear: method?.card.exp_year,
            brand: method?.card.brand,
          }));

        case 'square':
          const { result } = await payment.customersApi.listCards(customerId);
          return result?.cards.map((card) => ({
            type: 'card',
            token: card?.id,
            last4: card?.last4,
            expMonth: card?.expMonth,
            expYear: card?.expYear,
            brand: card?.cardBrand,
          }));

        default:
          return [];
      }
    } catch (error) {
      console?.error('Failed to get customer payment methods:', error);
      return [];
    }
  }
}
