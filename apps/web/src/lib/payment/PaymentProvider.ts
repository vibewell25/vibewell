functionality throughout the application.
 */

export interface PaymentDetails {
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, string>;
export interface CustomerDetails {
  email: string;
  name?: string;
  userId: string;
  metadata?: Record<string, string>;
export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'wallet';
  last4?: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  isDefault?: boolean;
export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status:
    | 'requires_payment_method'
    | 'requires_confirmation'
    | 'requires_action'
    | 'processing'
    | 'succeeded'
    | 'canceled'
    | 'failed';
  clientSecret?: string;
  paymentMethod?: string;
  created: number;
  metadata?: Record<string, string>;
export interface PaymentProvider {
  /**
   * Initialize the payment provider with configuration
   */
  initialize(config: Record<string, any>): Promise<void>;

  /**
   * Create a customer in the payment provider's system
   */
  createCustomer(customer: CustomerDetails): Promise<{ id: string }>;

  /**
   * Get customer by ID
   */
  getCustomer(customerId: string): Promise<{
    id: string;
    email: string;
    name?: string;
    metadata?: Record<string, string>;
| null>;

  /**
   * Add a payment method for a customer
   */
  addPaymentMethod(customerId: string, paymentMethodToken: string): Promise<PaymentMethod>;

  /**
   * List payment methods for a customer
   */
  listPaymentMethods(customerId: string): Promise<PaymentMethod[]>;

  /**
   * Set a payment method as default for a customer
   */
  setDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<void>;

  /**
   * Create a payment intent
   */
  createPaymentIntent(customerId: string, paymentDetails: PaymentDetails): Promise<PaymentIntent>;

  /**
   * Confirm a payment intent
   */
  confirmPaymentIntent(paymentIntentId: string, paymentMethodId?: string): Promise<PaymentIntent>;

  /**
   * Retrieve a payment intent
   */
  retrievePaymentIntent(paymentIntentId: string): Promise<PaymentIntent | null>;

  /**
   * Cancel a payment intent
   */
  cancelPaymentIntent(paymentIntentId: string): Promise<PaymentIntent | null>;

  /**
   * Create a refund for a payment
   */
  createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: string,
  ): Promise<{ id: string; status: string }>;
