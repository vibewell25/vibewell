import { describe, it, expect, beforeEach, jest } from '@jest/globals';

    import { BookingService } from '@/lib/services/booking';

    import { PaymentService } from '@/lib/services/payment';

    import { prisma } from '@/lib/prisma';


    jest.mock('@/lib/prisma', () => ({
  prisma: {
    booking: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
serviceBooking: {
      updateMany: jest.fn(),
payment: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
$transaction: jest.fn((callback) => callback(prisma)),
));

describe('Booking and Payment Flow Tests', () => {
  let bookingService: BookingService;
  let paymentService: PaymentService;

  const mockBooking = {

    id: 'test-booking-id',

    userId: 'test-user-id',

    businessId: 'test-business-id',
    status: 'CONFIRMED',
    startTime: new Date('2024-03-20T10:00:00Z'),
    endTime: new Date('2024-03-20T11:00:00Z'),
const mockPayment = {

    id: 'test-payment-id',
    amount: 100,
    currency: 'USD',
    status: 'COMPLETED',
    bookingId: mockBooking.id,
    businessId: mockBooking.businessId,
beforeEach(() => {
    bookingService = new BookingService();
    paymentService = new PaymentService();
    jest.clearAllMocks();
describe('Reschedule Flow', () => {
    it('should validate booking ownership before rescheduling', async () => {
      (prisma.booking.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(bookingService.rescheduleBooking({
        bookingId: mockBooking.id,

    userId: 'wrong-user-id',
        newStartTime: new Date('2024-03-21T10:00:00Z'),
        newEndTime: new Date('2024-03-21T11:00:00Z'),
)).rejects.toThrow('Booking not found or unauthorized');
it('should validate booking status before rescheduling', async () => {
      (prisma.booking.findFirst as jest.Mock).mockResolvedValue(mockBooking);
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue({
        ...mockBooking,
        status: 'CANCELLED',
await expect(bookingService.rescheduleBooking({
        bookingId: mockBooking.id,
        userId: mockBooking.userId,
        newStartTime: new Date('2024-03-21T10:00:00Z'),
        newEndTime: new Date('2024-03-21T11:00:00Z'),
)).rejects.toThrow('Booking cannot be modified in CANCELLED status');
it('should successfully reschedule a booking', async () => {
      const newStartTime = new Date('2024-03-21T10:00:00Z');
      const newEndTime = new Date('2024-03-21T11:00:00Z');

      (prisma.booking.findFirst as jest.Mock).mockResolvedValue(mockBooking);
      (prisma.booking.findUnique as jest.Mock).mockResolvedValue(mockBooking);
      (prisma.booking.update as jest.Mock).mockResolvedValue({
        ...mockBooking,
        startTime: newStartTime,
        endTime: newEndTime,
const result = await bookingService.rescheduleBooking({
        bookingId: mockBooking.id,
        userId: mockBooking.userId,
        newStartTime,
        newEndTime,
expect(result.startTime).toEqual(newStartTime);
      expect(result.endTime).toEqual(newEndTime);
describe('Payment Flow', () => {
    it('should handle idempotent payment processing', async () => {
      const paymentOptions = {
        amount: 100,
        currency: 'USD',
        bookingId: mockBooking.id,
        businessId: mockBooking.businessId,

    idempotencyKey: 'test-key',
(prisma.payment.findFirst as jest.Mock).mockResolvedValue(mockPayment);

      const result = await paymentService.processPayment(paymentOptions);

      expect(result).toEqual(mockPayment);
      expect(prisma.payment.create).not.toHaveBeenCalled();
it('should process new payment with retries', async () => {
      const paymentOptions = {
        amount: 100,
        currency: 'USD',
        bookingId: mockBooking.id,
        businessId: mockBooking.businessId,
(prisma.payment.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.payment.create as jest.Mock).mockResolvedValue({
        ...mockPayment,
        status: 'PENDING',
(prisma.payment.update as jest.Mock).mockResolvedValue(mockPayment);

      const result = await paymentService.processPayment(paymentOptions);

      expect(result.status).toBe('COMPLETED');
      expect(prisma.payment.create).toHaveBeenCalled();
it('should handle refund for cancelled bookings', async () => {
      (prisma.payment.findUnique as jest.Mock).mockResolvedValue(mockPayment);
      (prisma.payment.update as jest.Mock).mockResolvedValue({
        ...mockPayment,
        status: 'REFUNDED',
const result = await paymentService.refundPayment(mockPayment.id);

      expect(result.status).toBe('REFUNDED');
