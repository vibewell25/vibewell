/// <reference types="cypress" />

describe('Virtual Try-On Feature', () => {
  beforeEach(() => {
    // Visit the try-on page
    cy.visit('/try-on');
    
    // Wait for initial content to load
    cy.get('h1').should('contain', 'Virtual Try-On');
  });

  it('should display available models', () => {
    // Check that model buttons are rendered
    cy.get('button').should('contain', 'Lipstick');
    cy.get('button').should('contain', 'Hairstyle');
    cy.get('button').should('contain', 'Glasses');
  });

  it('should load a model when selected', () => {
    // Click on a model button
    cy.contains('button', 'Lipstick').click();
    
    // Check that the AR viewer is visible
    cy.get('[data-testid="three-ar-viewer"]').should('be.visible');
    
    // Wait for the model to load
    cy.get('[data-testid="loader"]').should('not.exist', { timeout: 10000 });
  });

  it('should allow adjusting intensity', () => {
    // Select a model
    cy.contains('button', 'Lipstick').click();
    
    // Wait for model to load
    cy.get('[data-testid="loader"]').should('not.exist', { timeout: 10000 });
    
    // Move intensity slider
    cy.get('input[type="range"]').invoke('val', 7).trigger('change');
    
    // Check that intensity value was updated
    cy.get('.text-sm.text-gray-500').should('contain', '7');
  });

  it('should capture a screenshot when the capture button is clicked', () => {
    // Select a model
    cy.contains('button', 'Lipstick').click();
    
    // Wait for model to load
    cy.get('[data-testid="loader"]').should('not.exist', { timeout: 10000 });
    
    // Click the capture button
    cy.get('[data-testid="capture-button"]').click();
    
    // Check that the share dialog is displayed
    cy.get('[role="dialog"]').should('be.visible');
    cy.get('[role="dialog"]').should('contain', 'Share your look');
  });

  it('should show cached model faster on second visit', () => {
    // Select a model and time loading
    cy.contains('button', 'Lipstick').click();
    
    // Wait for first load and record time
    const startTime = Date.now();
    cy.get('[data-testid="loader"]').should('not.exist', { timeout: 10000 }).then(() => {
      const firstLoadTime = Date.now() - startTime;
      
      // Reload page
      cy.reload();
      
      // Select the same model again
      cy.contains('button', 'Lipstick').click();
      
      // Wait for second load and compare times
      const secondStartTime = Date.now();
      cy.get('[data-testid="loader"]').should('not.exist', { timeout: 10000 }).then(() => {
        const secondLoadTime = Date.now() - secondStartTime;
        
        // Assert that second load is faster due to caching
        expect(secondLoadTime).to.be.lessThan(firstLoadTime);
      });
    });
  });
}); 