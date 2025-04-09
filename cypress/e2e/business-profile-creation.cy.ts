/// <reference types="cypress" />
import { TEST_CREDENTIALS } from '../support/constants';

describe('Business Profile Creation', () => {
  beforeEach(() => {
    // Clear cookies and localStorage
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Login as a business user and navigate to profile creation
    cy.visit('/login');
    cy.get('[data-cy="email"]').type(TEST_CREDENTIALS.PROVIDER.EMAIL);
    cy.get('[data-cy="password"]').type(TEST_CREDENTIALS.PASSWORD);
    cy.get('[data-cy="login-button"]').click();
    
    // Navigate to business profile creation
    cy.visit('/business/profile/create');
  });

  it('should validate required fields in business profile form', () => {
    // Attempt to proceed without filling required fields
    cy.get('[data-cy="next-button"]').click();
    
    // Check for error messages
    cy.contains('Business name is required').should('be.visible');
    cy.contains('Business address is required').should('be.visible');
    cy.contains('Phone number is required').should('be.visible');
    
    // Fill one field and verify other errors still exist
    cy.get('[data-cy="business-name"]').type('Test Business');
    cy.get('[data-cy="next-button"]').click();
    cy.contains('Business address is required').should('be.visible');
  });

  it('should successfully create a business profile', () => {
    // Step 1: Basic Information
    cy.get('[data-cy="business-name"]').type('Wellness Studio');
    cy.get('[data-cy="business-address"]').type('123 Main St');
    cy.get('[data-cy="business-city"]').type('San Francisco');
    cy.get('[data-cy="business-state"]').select('California');
    cy.get('[data-cy="business-zip"]').type('94105');
    cy.get('[data-cy="business-phone"]').type('4155551234');
    cy.get('[data-cy="business-description"]').type('A wellness studio focused on holistic health.');
    cy.get('[data-cy="next-button"]').click();
    
    // Step 2: Services
    cy.get('[data-cy="service-checkbox-massage"]').check();
    cy.get('[data-cy="service-checkbox-facial"]').check();
    cy.get('[data-cy="next-button"]').click();
    
    // Step 3: Images
    const fileName = 'business-image.jpg';
    cy.get('[data-cy="upload-image-input"]').attachFile(fileName);
    cy.get('[data-cy="uploaded-image"]').should('be.visible');
    cy.get('[data-cy="next-button"]').click();
    
    // Step 4: Business Hours
    cy.get('[data-cy="monday-toggle"]').click();
    cy.get('[data-cy="monday-start"]').type('09:00');
    cy.get('[data-cy="monday-end"]').type('17:00');
    cy.get('[data-cy="tuesday-toggle"]').click();
    cy.get('[data-cy="tuesday-start"]').type('09:00');
    cy.get('[data-cy="tuesday-end"]').type('17:00');
    cy.get('[data-cy="next-button"]').click();
    
    // Step 5: Review and Submit
    cy.contains('Wellness Studio').should('be.visible');
    cy.contains('123 Main St, San Francisco, CA 94105').should('be.visible');
    cy.contains('Massage').should('be.visible');
    cy.contains('Facial').should('be.visible');
    cy.get('[data-cy="submit-button"]').click();
    
    // Verify success
    cy.contains('Business profile created successfully').should('be.visible');
    cy.url().should('include', '/business/dashboard');
  });

  it('should allow editing an existing business profile', () => {
    // Navigate to edit page
    cy.visit('/business/profile/edit');
    
    // Verify existing data is loaded
    cy.get('[data-cy="business-name"]').should('have.value', 'Wellness Studio');
    cy.get('[data-cy="business-address"]').should('have.value', '123 Main St');
    
    // Update some fields
    cy.get('[data-cy="business-name"]').clear().type('Updated Wellness Studio');
    cy.get('[data-cy="business-description"]').clear().type('An updated description for our wellness studio.');
    
    // Save changes
    cy.get('[data-cy="save-button"]').click();
    
    // Verify success
    cy.contains('Business profile updated successfully').should('be.visible');
    cy.url().should('include', '/business/dashboard');
    
    // Verify changes persisted
    cy.visit('/business/profile/edit');
    cy.get('[data-cy="business-name"]').should('have.value', 'Updated Wellness Studio');
  });

  it('should handle business profile image uploads', () => {
    // Navigate to the images step
    cy.get('[data-cy="business-name"]').type('Image Test Business');
    cy.get('[data-cy="business-address"]').type('456 Image St');
    cy.get('[data-cy="business-city"]').type('San Francisco');
    cy.get('[data-cy="business-state"]').select('California');
    cy.get('[data-cy="business-zip"]').type('94105');
    cy.get('[data-cy="business-phone"]').type('4155551234');
    cy.get('[data-cy="next-button"]').click();
    cy.get('[data-cy="service-checkbox-massage"]').check();
    cy.get('[data-cy="next-button"]').click();
    
    // Test multiple image uploads
    const image1 = 'business-image1.jpg';
    const image2 = 'business-image2.jpg';
    
    cy.get('[data-cy="upload-image-input"]').attachFile(image1);
    cy.get('[data-cy="uploaded-image"]').should('be.visible');
    
    cy.get('[data-cy="upload-image-input"]').attachFile(image2);
    cy.get('[data-cy="uploaded-image"]').should('have.length', 2);
    
    // Test deleting an image
    cy.get('[data-cy="delete-image-button"]').first().click();
    cy.get('[data-cy="uploaded-image"]').should('have.length', 1);
    
    // Test maximum images
    for (let i = 0; i < 5; i++) {
      cy.get('[data-cy="upload-image-input"]').attachFile(`business-image${i}.jpg`);
    }
    
    // Should have max number of images and upload button should be disabled
    cy.get('[data-cy="uploaded-image"]').should('have.length', 5);
    cy.get('[data-cy="upload-image-input"]').should('be.disabled');
  });
}); 