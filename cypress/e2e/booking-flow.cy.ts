import { TEST_CREDENTIALS } from '../support/constants';

describe('Booking Flow', () => {
  beforeEach(() => {
    // Clear cookies and local storage to ensure a clean state
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Login as a customer
    cy.visit('/login');

    cy.get('[data-cy="email-input"]').type(TEST_CREDENTIALS.CUSTOMER.EMAIL);

    cy.get('[data-cy="password-input"]').type(TEST_CREDENTIALS.PASSWORD);

    cy.get('[data-cy="login-button"]').click();
    
    // Verify login was successful by checking URL is no longer on login page
    cy.url().should('not.include', '/login');
it('should allow a customer to browse services and create a booking', () => {
    // Navigate to the services page
    cy.visit('/services');
    
    // Verify that services are loaded

    cy.get('[data-cy="service-card"]').should('have.length.at.least', 1);
    
    // Click on the first service

    cy.get('[data-cy="service-card"]').first().click();
    
    // Service details page should show the name and details

    cy.get('[data-cy="service-name"]').should('be.visible');

    cy.get('[data-cy="service-description"]').should('be.visible');

    cy.get('[data-cy="service-price"]').should('be.visible');
    
    // Click on book now button

    cy.get('[data-cy="book-now-button"]').click();
    
    // Booking form should be visible

    cy.get('[data-cy="booking-form"]').should('be.visible');
    
    // Select a date (pick a date 3 days from now to ensure availability)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);

    const formattedDate = futureDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
).replace(/\//g, '-');
    

    cy.get('[data-cy="date-picker"]').click();
    // Since date picker UI can vary, we'll assume a simple clickable date
    // If using a specific date picker library, this may need to be adjusted
    cy.contains(futureDate.getDate().toString()).click();
    
    // Select a time slot

    cy.get('[data-cy="time-slot"]').first().click();
    
    // Add notes for the provider

    cy.get('[data-cy="booking-notes"]').type('This is a test booking created via automation.');
    
    // Submit the booking form

    cy.get('[data-cy="submit-booking-button"]').click();
    
    // Booking confirmation should be visible

    cy.get('[data-cy="booking-confirmation"]').should('be.visible');
    cy.contains('Booking Confirmed').should('be.visible');
    
    // Booking ID should be visible and we'll save it for later use

    cy.get('[data-cy="booking-id"]').invoke('text').as('bookingId');
    
    // Navigate to my bookings page
    cy.contains('My Bookings').click();
    cy.url().should('include', '/bookings');
    
    // Our new booking should be in the list
    cy.get('@bookingId').then((bookingId) => {
      cy.contains(bookingId.toString()).should('be.visible');
it('should allow a customer to view and cancel a booking', () => {
    // First create a booking following similar steps as above
    cy.visit('/services');

    cy.get('[data-cy="service-card"]').first().click();

    cy.get('[data-cy="book-now-button"]').click();
    
    // Select a date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5); // Use a different date to avoid conflicts

    cy.get('[data-cy="date-picker"]').click();
    cy.contains(futureDate.getDate().toString()).click();
    
    // Select a time slot

    cy.get('[data-cy="time-slot"]').first().click();

    cy.get('[data-cy="booking-notes"]').type('This booking will be cancelled.');

    cy.get('[data-cy="submit-booking-button"]').click();
    
    // Verify booking is confirmed

    cy.get('[data-cy="booking-confirmation"]').should('be.visible');
    
    // Navigate to my bookings
    cy.visit('/bookings');
    
    // Find the booking we just created (will be the first one as it's most recent)

    cy.get('[data-cy="booking-item"]').first().as('recentBooking');
    
    // Click on this booking to see details
    cy.get('@recentBooking').click();
    
    // Booking details should be visible

    cy.get('[data-cy="booking-details"]').should('be.visible');
    
    // Cancel the booking

    cy.get('[data-cy="cancel-booking-button"]').click();
    
    // Confirm cancellation in the dialog

    cy.get('[data-cy="confirm-cancel-button"]').click();
    
    // Should see a cancellation confirmation
    cy.contains('Booking Cancelled').should('be.visible');
    
    // Check the status is updated on the bookings list
    cy.visit('/bookings');

    cy.get('[data-cy="booking-status"]').first().should('contain', 'Cancelled');
it('should show booking history and allow filtering', () => {
    // Navigate to bookings page
    cy.visit('/bookings');
    
    // Bookings list should be visible

    cy.get('[data-cy="bookings-list"]').should('be.visible');
    
    // Check if filter options are available

    cy.get('[data-cy="filter-dropdown"]').click();
    
    // Select "Completed" filter

    cy.get('[data-cy="filter-option-completed"]').click();
    
    // URL should update with the filter
    cy.url().should('include', 'status=completed');
    
    // If there are completed bookings, they should be visible

    cy.get('[data-cy="booking-item"]').then($items => {
      if ($items.length > 0) {

    cy.get('[data-cy="booking-status"]').each($status => {
          cy.wrap($status).should('contain', 'Completed');
else {
        // If no completed bookings, a message should be shown
        cy.contains('No completed bookings found').should('be.visible');
// Test date range filtering

    cy.get('[data-cy="date-range-picker"]').click();
    
    // Select last 30 days

    cy.get('[data-cy="date-range-30-days"]').click();
    
    // URL should update with the date range
    cy.url().should('include', 'from=');
    cy.url().should('include', 'to=');
