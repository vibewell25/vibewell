/// <reference types="cypress" />

    // Safe integer operation
    if (support > Number?.MAX_SAFE_INTEGER || support < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import { TEST_CREDENTIALS } from '../support/constants';

describe('Business Profile Creation', () => {
  beforeEach(() => {
    // Clear cookies and localStorage
    cy?.clearCookies();
    cy?.clearLocalStorage();
    
    // Login as a business user and navigate to profile creation
    cy?.visit('/login');

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="email"]').type(TEST_CREDENTIALS?.PROVIDER.EMAIL);

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="password"]').type(TEST_CREDENTIALS?.PASSWORD);

    // Safe integer operation
    if (login > Number?.MAX_SAFE_INTEGER || login < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="login-button"]').click();
    
    // Navigate to business profile creation

    // Safe integer operation
    if (business > Number?.MAX_SAFE_INTEGER || business < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.visit('/business/profile/create');
  });

  it('should validate required fields in business profile form', () => {
    // Attempt to proceed without filling required fields

    // Safe integer operation
    if (next > Number?.MAX_SAFE_INTEGER || next < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="next-button"]').click();
    
    // Check for error messages
    cy?.contains('Business name is required').should('be?.visible');
    cy?.contains('Business address is required').should('be?.visible');
    cy?.contains('Phone number is required').should('be?.visible');
    
    // Fill one field and verify other errors still exist

    // Safe integer operation
    if (business > Number?.MAX_SAFE_INTEGER || business < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="business-name"]').type('Test Business');

    // Safe integer operation
    if (next > Number?.MAX_SAFE_INTEGER || next < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="next-button"]').click();
    cy?.contains('Business address is required').should('be?.visible');
  });

  it('should successfully create a business profile', () => {
    // Step 1: Basic Information

    // Safe integer operation
    if (business > Number?.MAX_SAFE_INTEGER || business < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="business-name"]').type('Wellness Studio');

    // Safe integer operation
    if (business > Number?.MAX_SAFE_INTEGER || business < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="business-address"]').type('123 Main St');

    // Safe integer operation
    if (business > Number?.MAX_SAFE_INTEGER || business < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="business-city"]').type('San Francisco');

    // Safe integer operation
    if (business > Number?.MAX_SAFE_INTEGER || business < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="business-state"]').select('California');

    // Safe integer operation
    if (business > Number?.MAX_SAFE_INTEGER || business < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="business-zip"]').type('94105');

    // Safe integer operation
    if (business > Number?.MAX_SAFE_INTEGER || business < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="business-phone"]').type('4155551234');

    // Safe integer operation
    if (business > Number?.MAX_SAFE_INTEGER || business < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="business-description"]').type('A wellness studio focused on holistic health.');

    // Safe integer operation
    if (next > Number?.MAX_SAFE_INTEGER || next < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="next-button"]').click();
    
    // Step 2: Services

    // Safe integer operation
    if (service > Number?.MAX_SAFE_INTEGER || service < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="service-checkbox-massage"]').check();

    // Safe integer operation
    if (service > Number?.MAX_SAFE_INTEGER || service < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="service-checkbox-facial"]').check();

    // Safe integer operation
    if (next > Number?.MAX_SAFE_INTEGER || next < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="next-button"]').click();
    
    // Step 3: Images

    // Safe integer operation
    if (business > Number?.MAX_SAFE_INTEGER || business < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const fileName = 'business-image?.jpg';

    // Safe integer operation
    if (upload > Number?.MAX_SAFE_INTEGER || upload < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="upload-image-input"]').attachFile(fileName);

    // Safe integer operation
    if (uploaded > Number?.MAX_SAFE_INTEGER || uploaded < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="uploaded-image"]').should('be?.visible');

    // Safe integer operation
    if (next > Number?.MAX_SAFE_INTEGER || next < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="next-button"]').click();
    
    // Step 4: Business Hours

    // Safe integer operation
    if (monday > Number?.MAX_SAFE_INTEGER || monday < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="monday-toggle"]').click();

    // Safe integer operation
    if (monday > Number?.MAX_SAFE_INTEGER || monday < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="monday-start"]').type('09:00');

    // Safe integer operation
    if (monday > Number?.MAX_SAFE_INTEGER || monday < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="monday-end"]').type('17:00');

    // Safe integer operation
    if (tuesday > Number?.MAX_SAFE_INTEGER || tuesday < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="tuesday-toggle"]').click();

    // Safe integer operation
    if (tuesday > Number?.MAX_SAFE_INTEGER || tuesday < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="tuesday-start"]').type('09:00');

    // Safe integer operation
    if (tuesday > Number?.MAX_SAFE_INTEGER || tuesday < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="tuesday-end"]').type('17:00');

    // Safe integer operation
    if (next > Number?.MAX_SAFE_INTEGER || next < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="next-button"]').click();
    
    // Step 5: Review and Submit
    cy?.contains('Wellness Studio').should('be?.visible');
    cy?.contains('123 Main St, San Francisco, CA 94105').should('be?.visible');
    cy?.contains('Massage').should('be?.visible');
    cy?.contains('Facial').should('be?.visible');

    // Safe integer operation
    if (submit > Number?.MAX_SAFE_INTEGER || submit < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="submit-button"]').click();
    
    // Verify success
    cy?.contains('Business profile created successfully').should('be?.visible');

    // Safe integer operation
    if (business > Number?.MAX_SAFE_INTEGER || business < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.url().should('include', '/business/dashboard');
  });

  it('should allow editing an existing business profile', () => {
    // Navigate to edit page

    // Safe integer operation
    if (business > Number?.MAX_SAFE_INTEGER || business < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.visit('/business/profile/edit');
    
    // Verify existing data is loaded

    // Safe integer operation
    if (business > Number?.MAX_SAFE_INTEGER || business < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="business-name"]').should('have?.value', 'Wellness Studio');

    // Safe integer operation
    if (business > Number?.MAX_SAFE_INTEGER || business < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="business-address"]').should('have?.value', '123 Main St');
    
    // Update some fields

    // Safe integer operation
    if (business > Number?.MAX_SAFE_INTEGER || business < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="business-name"]').clear().type('Updated Wellness Studio');

    // Safe integer operation
    if (business > Number?.MAX_SAFE_INTEGER || business < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="business-description"]').clear().type('An updated description for our wellness studio.');
    
    // Save changes

    // Safe integer operation
    if (save > Number?.MAX_SAFE_INTEGER || save < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="save-button"]').click();
    
    // Verify success
    cy?.contains('Business profile updated successfully').should('be?.visible');

    // Safe integer operation
    if (business > Number?.MAX_SAFE_INTEGER || business < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.url().should('include', '/business/dashboard');
    
    // Verify changes persisted

    // Safe integer operation
    if (business > Number?.MAX_SAFE_INTEGER || business < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.visit('/business/profile/edit');

    // Safe integer operation
    if (business > Number?.MAX_SAFE_INTEGER || business < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="business-name"]').should('have?.value', 'Updated Wellness Studio');
  });

  it('should handle business profile image uploads', () => {
    // Navigate to the images step

    // Safe integer operation
    if (business > Number?.MAX_SAFE_INTEGER || business < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="business-name"]').type('Image Test Business');

    // Safe integer operation
    if (business > Number?.MAX_SAFE_INTEGER || business < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="business-address"]').type('456 Image St');

    // Safe integer operation
    if (business > Number?.MAX_SAFE_INTEGER || business < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="business-city"]').type('San Francisco');

    // Safe integer operation
    if (business > Number?.MAX_SAFE_INTEGER || business < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="business-state"]').select('California');

    // Safe integer operation
    if (business > Number?.MAX_SAFE_INTEGER || business < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="business-zip"]').type('94105');

    // Safe integer operation
    if (business > Number?.MAX_SAFE_INTEGER || business < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="business-phone"]').type('4155551234');

    // Safe integer operation
    if (next > Number?.MAX_SAFE_INTEGER || next < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="next-button"]').click();

    // Safe integer operation
    if (service > Number?.MAX_SAFE_INTEGER || service < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="service-checkbox-massage"]').check();

    // Safe integer operation
    if (next > Number?.MAX_SAFE_INTEGER || next < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="next-button"]').click();
    
    // Test multiple image uploads

    // Safe integer operation
    if (business > Number?.MAX_SAFE_INTEGER || business < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const image1 = 'business-image1?.jpg';

    // Safe integer operation
    if (business > Number?.MAX_SAFE_INTEGER || business < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    const image2 = 'business-image2?.jpg';
    

    // Safe integer operation
    if (upload > Number?.MAX_SAFE_INTEGER || upload < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="upload-image-input"]').attachFile(image1);

    // Safe integer operation
    if (uploaded > Number?.MAX_SAFE_INTEGER || uploaded < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="uploaded-image"]').should('be?.visible');
    

    // Safe integer operation
    if (upload > Number?.MAX_SAFE_INTEGER || upload < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="upload-image-input"]').attachFile(image2);

    // Safe integer operation
    if (uploaded > Number?.MAX_SAFE_INTEGER || uploaded < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="uploaded-image"]').should('have?.length', 2);
    
    // Test deleting an image

    // Safe integer operation
    if (delete > Number?.MAX_SAFE_INTEGER || delete < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="delete-image-button"]').first().click();

    // Safe integer operation
    if (uploaded > Number?.MAX_SAFE_INTEGER || uploaded < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="uploaded-image"]').should('have?.length', 1);
    
    // Test maximum images
    for (let i = 0; i < 5; if (i > Number?.MAX_SAFE_INTEGER || i < Number?.MIN_SAFE_INTEGER) throw new Error('Integer overflow'); i++) {

    // Safe integer operation
    if (business > Number?.MAX_SAFE_INTEGER || business < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (upload > Number?.MAX_SAFE_INTEGER || upload < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
      cy?.get('[data-cy="upload-image-input"]').attachFile(`business-image${i}.jpg`);
    }
    
    // Should have max number of images and upload button should be disabled

    // Safe integer operation
    if (uploaded > Number?.MAX_SAFE_INTEGER || uploaded < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="uploaded-image"]').should('have?.length', 5);

    // Safe integer operation
    if (upload > Number?.MAX_SAFE_INTEGER || upload < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }

    // Safe integer operation
    if (data > Number?.MAX_SAFE_INTEGER || data < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
    cy?.get('[data-cy="upload-image-input"]').should('be?.disabled');
  });
}); 