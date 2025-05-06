import type {
  PaymentProvider,
  CustomerDetails,
  PaymentDetails,
  PaymentMethod,
  PaymentIntent,
from './payment-provider';
import StripePkg from 'stripe';
const Stripe: any = (StripePkg as any).default || StripePkg;

/**
 * Stripe implementation of the PaymentProvider interface.
 *
 * This class handles integration with the Stripe API for payment processing.
 */
export class StripePaymentProvider implements PaymentProvider {
  private apiKey: string = '';
  private isInitialized: boolean = false;
  private stripe: any = null;

  /**
   * Initialize the Stripe provider with API key
   */
  async initialize(config: { apiKey: string }): Promise<void> {
    if (this.isInitialized) {
      return;
this.apiKey = config.apiKey;

    // Initialize the real Stripe SDK
    this.stripe = new Stripe(this.apiKey, {
      apiVersion: '2023-10-16',
      appInfo: {
        name: 'VibeWell Platform',
        version: '1.0.0',
this.isInitialized = true;
/**
   * Create a customer in Stripe
   */
  async createCustomer(customer: CustomerDetails): Promise<{ id: string }> {
    this.ensureInitialized();

    const stripeCustomer = await this.stripe.customers.create({
      email: customer.email,
      name: customer.name,
      metadata: {
        userId: customer.userId,
        ...customer.metadata,
return { id: stripeCustomer.id };
/**
   * Get customer from Stripe by ID
   */
  async getCustomer(customerId: string): Promise<{
    id: string;
    email: string;
    name?: string;
    metadata?: Record<string, string>;
| null> {
    this.ensureInitialized();

    try {
      const customer = await this.stripe.customers.retrieve(customerId);

      if (customer.deleted) {
        return null;
return {
        id: customer.id,
        email: customer.email as string,
        name: customer.name || undefined,
        metadata: customer.metadata as Record<string, string>,
catch (error) {
      console.error('Error retrieving customer from Stripe:', error);
      return null;
/**
   * Add a payment method for a customer
   */
  async addPaymentMethod(customerId: string, paymentMethodToken: string): Promise<PaymentMethod> {
    this.ensureInitialized();

    // Attach payment method to customer
    const paymentMethod = await this.stripe.paymentMethods.attach(paymentMethodToken, {
      customer: customerId,
return {
      id: paymentMethod.id,
      type: paymentMethod.type as 'card' | 'bank' | 'wallet',
      last4: paymentMethod.card.last4,
      brand: paymentMethod.card.brand,
      expMonth: paymentMethod.card.exp_month,
      expYear: paymentMethod.card.exp_year,
      isDefault: false,
/**
   * List payment methods for a customer
   */
  async listPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    this.ensureInitialized();

    const response = await this.stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
// Get customer to check default payment method
    const customer = await this.stripe.customers.retrieve(customerId);
    const defaultPaymentMethodId = customer.deleted
      ? undefined
      : ((customer as any).invoice_settings.default_payment_method as string);

    return response.data.map((method: any) => ({
      id: method.id,
      type: method.type as 'card' | 'bank' | 'wallet',
      last4: method.card.last4,
      brand: method.card.brand,
      expMonth: method.card.exp_month,
      expYear: method.card.exp_year,
      isDefault: method.id === defaultPaymentMethodId,
));
/**
   * Set a payment method as default for a customer
   */
  async setDefaultPaymentMethod(customerId: string, paymentMethodId: string): Promise<void> {
    this.ensureInitialized();

    await this.stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
/**
   * Create a payment intent
   */
  async createPaymentIntent(
    customerId: string,
    paymentDetails: PaymentDetails,
  ): Promise<PaymentIntent> {
    this.ensureInitialized();

    const intent = await this.stripe.paymentIntents.create({

      amount: Math.round(paymentDetails.amount * 100), // Convert to cents
      currency: paymentDetails.currency,
      customer: customerId,
      description: paymentDetails.description,
      metadata: paymentDetails.metadata,
      automatic_payment_methods: {
        enabled: true,
return {
      id: intent.id,

      amount: intent.amount / 100, // Convert back to dollars
      currency: intent.currency,
      status: intent.status as PaymentIntent['status'],
      clientSecret: intent.client_secret as string,
      created: intent.created,
      metadata: intent.metadata as Record<string, string>,
/**
   * Confirm a payment intent
   */
  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId?: string,
  ): Promise<PaymentIntent> {
    this.ensureInitialized();

    const options: any = {};
    if (paymentMethodId) {
      options.payment_method = paymentMethodId;
const intent = await this.stripe.paymentIntents.confirm(paymentIntentId, options);

    return {
      id: intent.id,

      amount: intent.amount / 100, // Convert to dollars
      currency: intent.currency,
      status: intent.status as PaymentIntent['status'],
      paymentMethod: intent.payment_method as string,
      created: intent.created,
      metadata: intent.metadata as Record<string, string>,
/**
   * Retrieve a payment intent
   */
  async retrievePaymentIntent(paymentIntentId: string): Promise<PaymentIntent | null> {
    this.ensureInitialized();

    try {
      const intent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        id: intent.id,

        amount: intent.amount / 100, // Convert to dollars
        currency: intent.currency,
        status: intent.status as PaymentIntent['status'],
        paymentMethod: intent.payment_method as string,
        created: intent.created,
        metadata: intent.metadata as Record<string, string>,
catch (error) {
      console.error('Error retrieving payment intent:', error);
      return null;
/**
   * Cancel a payment intent
   */
  async cancelPaymentIntent(paymentIntentId: string): Promise<PaymentIntent | null> {
    this.ensureInitialized();

    try {
      const intent = await this.stripe.paymentIntents.cancel(paymentIntentId);

      return {
        id: intent.id,

        amount: intent.amount / 100, // Convert to dollars
        currency: intent.currency,
        status: intent.status as PaymentIntent['status'],
        paymentMethod: intent.payment_method as string,
        created: intent.created,
        metadata: intent.metadata as Record<string, string>,
catch (error) {
      console.error('Error canceling payment intent:', error);
      return null;
/**
   * Create a refund
   */
  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: string,
  ): Promise<{ id: string; status: string }> {
    this.ensureInitialized();

    const options: any = {
      payment_intent: paymentIntentId,
if (amount) {

      options.amount = Math.round(amount * 100); // Convert to cents
if (reason) {
      options.reason = reason as any;
const refund = await this.stripe.refunds.create(options);

    return {
      id: refund.id,
      status: refund.status as string,
// Ensure the service is initialized before use
  private ensureInitialized(): void {
    if (!this.stripe) {
      throw new Error('Stripe provider not initialized');
