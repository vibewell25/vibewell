/// <reference types="cypress" />

describe('Payment Processing', () => {
  beforeEach(() => {
    // Visit the checkout page (assuming there is one)
    cy.visit('/checkout');
    
    // Wait for content to load
    cy.get('h1').should('contain', 'Checkout');
it('should display payment form', () => {
    // Verify the payment form is displayed

    cy.get('form[data-cy="payment-form"]').should('be.visible');
    
    // Verify required fields exist

    cy.get('[data-cy="customer-name"]').should('be.visible');

    cy.get('[data-cy="customer-email"]').should('be.visible');
it('should show Stripe elements in an iframe for PCI compliance', () => {
    // Check that Stripe elements are in iframes (for PCI compliance)

    cy.get('iframe.stripe-card-element').should('be.visible');
    
    // Check form security attributes

    cy.get('form[data-cy="payment-form"]').should('have.attr', 'autocomplete', 'off');
it('should validate required fields', () => {
    // Submit the form without entering any data

    cy.get('[data-cy="submit-payment"]').click();
    
    // Check for validation errors

    cy.get('[data-cy="name-error"]').should('be.visible');

    cy.get('[data-cy="email-error"]').should('be.visible');

    cy.get('[data-cy="card-error"]').should('be.visible');
it('should process a test payment successfully', () => {
    // Fill in customer details

    cy.get('[data-cy="customer-name"]').type('Test User');

    cy.get('[data-cy="customer-email"]').type('test@example.com');
    
    // Enter test card details (using Stripe's test cards)
    // We need to get the iframe and its body first

    cy.get('iframe.stripe-card-element')
      .its('0.contentDocument.body')
      .should('not.be.empty')
      .then(body => {
        cy.wrap(body)
          .find('input[name="cardnumber"]')
          .type('4242424242424242');
          
        cy.wrap(body)

    .find('input[name="exp-date"]')
          .type('1230');
          
        cy.wrap(body)
          .find('input[name="cvc"]')
          .type('123');
          
        cy.wrap(body)
          .find('input[name="postal"]')
          .type('12345');
// Submit the form

    cy.get('[data-cy="submit-payment"]').click();
    
    // Check for successful submission

    cy.get('[data-cy="payment-success"]', { timeout: 10000 }).should('be.visible');

    cy.get('[data-cy="payment-success"]').should('contain', 'Payment successful');
it('should handle payment errors gracefully', () => {
    // Fill in customer details

    cy.get('[data-cy="customer-name"]').type('Test User');

    cy.get('[data-cy="customer-email"]').type('test@example.com');
    
    // Enter a test card that will be declined

    cy.get('iframe.stripe-card-element')
      .its('0.contentDocument.body')
      .should('not.be.empty')
      .then(body => {
        cy.wrap(body)
          .find('input[name="cardnumber"]')
          .type('4000000000000002'); // This card will be declined
          
        cy.wrap(body)

    .find('input[name="exp-date"]')
          .type('1230');
          
        cy.wrap(body)
          .find('input[name="cvc"]')
          .type('123');
          
        cy.wrap(body)
          .find('input[name="postal"]')
          .type('12345');
// Submit the form

    cy.get('[data-cy="submit-payment"]').click();
    
    // Check for error message

    cy.get('[data-cy="payment-error"]', { timeout: 10000 }).should('be.visible');

    cy.get('[data-cy="payment-error"]').should('contain', 'Your card was declined');
it('should allow payment method selection', () => {
    // Check if payment method options are available

    cy.get('[data-cy="payment-methods"]').should('be.visible');
    
    // Verify different payment methods are available

    cy.get('[data-cy="payment-method-card"]').should('be.visible');

    cy.get('[data-cy="payment-method-paypal"]').should('be.visible');
