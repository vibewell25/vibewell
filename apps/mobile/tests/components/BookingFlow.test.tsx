import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import BookingFlow from '../../src/components/booking/BookingFlow';
import { BookingService } from '../../src/services/BookingService';
import { AuthContext } from '../../src/contexts/AuthContext';

// Mock services
jest.mock('../../src/services/BookingService');

describe('Mobile BookingFlow Component', () => {
  const mockAuthContext = {
    user: {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com'
isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
    isLoading: false
const mockPractitioners = [
    {
      id: 'practitioner-1',
      name: 'Dr. Jane Smith',
      specialty: 'Massage Therapy',
      rating: 4.8,
      imageUrl: 'https://example.com/jane-smith.jpg'
{
      id: 'practitioner-2',
      name: 'Dr. John Doe',
      specialty: 'Acupuncture',
      rating: 4.6,
      imageUrl: 'https://example.com/john-doe.jpg'
];

  const mockServices = [
    {
      id: 'service-1',
      name: 'Deep Tissue Massage',
      duration: 60,
      price: 100,
      description: 'Deep tissue massage therapy'
{
      id: 'service-2',
      name: 'Swedish Massage',
      duration: 90,
      price: 120,
      description: 'Relaxing Swedish massage'
];

  const mockTimeSlots = [
    {
      id: 'slot-1',
      startTime: new Date('2023-01-01T10:00:00Z'),
      endTime: new Date('2023-01-01T11:00:00Z'),
      isAvailable: true
{
      id: 'slot-2',
      startTime: new Date('2023-01-01T11:30:00Z'),
      endTime: new Date('2023-01-01T12:30:00Z'),
      isAvailable: true
];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock BookingService methods
    (BookingService.getPractitioners as jest.Mock).mockResolvedValue(mockPractitioners);
    (BookingService.getServices as jest.Mock).mockResolvedValue(mockServices);
    (BookingService.getAvailableTimeSlots as jest.Mock).mockResolvedValue(mockTimeSlots);
    (BookingService.createBooking as jest.Mock).mockResolvedValue({
      id: 'booking-123',
      practitionerId: 'practitioner-1',
      serviceId: 'service-1',
      startTime: new Date('2023-01-01T10:00:00Z'),
      status: 'CONFIRMED'
const renderWithContext = (ui: React.ReactElement) => {
    return render(
      <AuthContext.Provider value={mockAuthContext}>
        {ui}
      </AuthContext.Provider>
it('should render practitioner selection step initially', async () => {
    const { getByText, getAllByTestId } = renderWithContext(<BookingFlow />);
    
    // Should show the step title
    expect(getByText('Select Practitioner')).toBeTruthy();
    
    // Wait for practitioners to load
    await waitFor(() => {
      const practitionerCards = getAllByTestId('practitioner-card');
      expect(practitionerCards.length).toBe(2);
// Should show practitioner information
    expect(getByText('Dr. Jane Smith')).toBeTruthy();
    expect(getByText('Massage Therapy')).toBeTruthy();
it('should navigate to service selection after selecting practitioner', async () => {
    const { getByText, getAllByTestId } = renderWithContext(<BookingFlow />);
    
    // Wait for practitioners to load
    await waitFor(() => {
      const practitionerCards = getAllByTestId('practitioner-card');
      expect(practitionerCards.length).toBe(2);
// Select the first practitioner
    const practitionerCards = getAllByTestId('practitioner-card');
    fireEvent.press(practitionerCards[0]);
    
    // Should move to service selection step
    await waitFor(() => {
      expect(getByText('Select Service')).toBeTruthy();
// Should show services
    expect(getByText('Deep Tissue Massage')).toBeTruthy();
    expect(getByText('$100')).toBeTruthy();
it('should navigate to date and time selection after selecting service', async () => {
    const { getByText, getAllByTestId } = renderWithContext(<BookingFlow />);
    
    // Wait for practitioners to load and select one
    await waitFor(() => {
      const practitionerCards = getAllByTestId('practitioner-card');
      fireEvent.press(practitionerCards[0]);
// Wait for services to load and select one
    await waitFor(() => {
      const serviceCards = getAllByTestId('service-card');
      expect(serviceCards.length).toBe(2);
      fireEvent.press(serviceCards[0]);
// Should move to time selection step
    await waitFor(() => {
      expect(getByText('Select Date & Time')).toBeTruthy();
it('should show confirmation screen after completing booking', async () => {
    const { getByText, getAllByTestId, getByTestId } = renderWithContext(<BookingFlow />);
    
    // Complete practitioner selection
    await waitFor(() => {
      const practitionerCards = getAllByTestId('practitioner-card');
      fireEvent.press(practitionerCards[0]);
// Complete service selection
    await waitFor(() => {
      const serviceCards = getAllByTestId('service-card');
      fireEvent.press(serviceCards[0]);
// Complete time slot selection
    await waitFor(() => {
      const timeSlots = getAllByTestId('time-slot');
      fireEvent.press(timeSlots[0]);
// Complete booking by pressing confirm button
    const confirmButton = getByTestId('confirm-booking-button');
    fireEvent.press(confirmButton);
    
    // Should show confirmation screen
    await waitFor(() => {
      expect(getByText('Booking Confirmed!')).toBeTruthy();
      expect(getByText('Deep Tissue Massage with Dr. Jane Smith')).toBeTruthy();
// Should have called createBooking API
    expect(BookingService.createBooking).toHaveBeenCalledWith({
      practitionerId: 'practitioner-1',
      serviceId: 'service-1',
      startTime: expect.any(Date),
      userId: 'user-123'
it('should handle offline mode gracefully', async () => {
    // Mock network error
    (BookingService.getPractitioners as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    
    const { getByText } = renderWithContext(<BookingFlow />);
    
    // Should show offline message
    await waitFor(() => {
      expect(getByText('Unable to load practitioners')).toBeTruthy();
      expect(getByText('Please check your connection and try again')).toBeTruthy();
// Should show retry button
    const retryButton = getByText('Retry');
    expect(retryButton).toBeTruthy();
    
    // Reset mock to succeed on retry
    (BookingService.getPractitioners as jest.Mock).mockResolvedValueOnce(mockPractitioners);
    
    // Press retry button
    fireEvent.press(retryButton);
    
    // Should load practitioners successfully on retry
    await waitFor(() => {
      expect(getByText('Dr. Jane Smith')).toBeTruthy();
it('should validate user login before confirming booking', async () => {
    // Mock user as not authenticated
    const unauthenticatedContext = {
      ...mockAuthContext,
      isAuthenticated: false,
      user: null
const { getByText, getAllByTestId, getByTestId } = render(
      <AuthContext.Provider value={unauthenticatedContext}>
        <BookingFlow />
      </AuthContext.Provider>
// Complete practitioner selection
    await waitFor(() => {
      const practitionerCards = getAllByTestId('practitioner-card');
      fireEvent.press(practitionerCards[0]);
// Complete service selection
    await waitFor(() => {
      const serviceCards = getAllByTestId('service-card');
      fireEvent.press(serviceCards[0]);
// Complete time slot selection
    await waitFor(() => {
      const timeSlots = getAllByTestId('time-slot');
      fireEvent.press(timeSlots[0]);
// Try to complete booking
    const confirmButton = getByTestId('confirm-booking-button');
    fireEvent.press(confirmButton);
    
    // Should show login prompt
    await waitFor(() => {
      expect(getByText('Please log in to continue')).toBeTruthy();
// Should have called login function
    expect(mockAuthContext.login).toHaveBeenCalled();
