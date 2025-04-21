export const mockStripe = {
  redirectToCheckout: jest.fn().mockResolvedValue({ error: null }),
  createPaymentMethod: jest.fn().mockResolvedValue({
    paymentMethod: {
      id: 'pm_test_123',
      type: 'card',
      card: {
        brand: 'visa',
        last4: '4242',
      },
    },
  }),
  confirmCardPayment: jest.fn().mockResolvedValue({
    paymentIntent: {
      id: 'pi_test_123',
      status: 'succeeded',
      amount: 8999,
      currency: 'usd',
    },
  }),
  elements: jest.fn().mockReturnValue({
    create: jest.fn().mockReturnValue({
      mount: jest.fn(),
      destroy: jest.fn(),
      on: jest.fn(),
      update: jest.fn(),
    }),
  }),
};
