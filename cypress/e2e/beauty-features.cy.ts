/// <reference types="cypress" />
import '../support/commands';

/**
 * Comprehensive test suite for beauty-specific features
 * Tests product browsing, filtering, virtual try-on, and color selection
 */
describe('Beauty Product Catalog Features', () => {
  beforeEach(() => {
    cy.visit('/beauty');
    cy.contains('Beauty Services', { timeout: 10000 }).should('be.visible');
  });

  it('should filter products by category', () => {
    // Click on a specific category
    cy.contains('.card', 'Makeup').click();
    
    // Verify products are filtered
    cy.get('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-6')
      .find('.card')
      .should('exist');
    
    // At least one product should contain the category name or related text
    cy.get('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-6')
      .contains(/makeup|cosmetic|foundation|lipstick/i)
      .should('exist');
  });

  it('should search products by name', () => {
    // Type in the search box
    cy.get('input[type="search"]')
      .type('haircut');
    
    // Verify search results
    cy.get('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-6')
      .contains(/haircut|hair/i)
      .should('exist');
      
    // Clear search and verify all products return
    cy.get('input[type="search"]')
      .clear();
    
    cy.get('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-6')
      .find('.card')
      .should('have.length.gte', 3);
  });

  it('should navigate to product detail page', () => {
    // Click on a product
    cy.get('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-6')
      .find('.card')
      .first()
      .within(() => {
        cy.contains('Book Now').click();
      });
    
    // Verify navigation to detail page
    cy.url().should('include', '/beauty/');
    
    // Verify product details are shown
    cy.get('h1').should('exist');
    cy.get('[data-testid="product-price"]').should('exist');
  });

  it('should display correct pricing and duration', () => {
    // Check that price and duration are displayed for all services
    cy.get('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-6')
      .find('.card')
      .each(($card) => {
        cy.wrap($card)
          .find('.font-medium.text-lg')
          .contains(/\$\d+/);
          
        cy.wrap($card)
          .find('.text-sm.text-muted-foreground')
          .contains(/\d+ min/);
      });
  });
});

describe('Virtual Try-On Features', () => {
  beforeEach(() => {
    cy.visit('/virtual-try-on');
    cy.contains('Virtual Try-On', { timeout: 10000 }).should('be.visible');
  });

  it('should allow selecting different products', () => {
    // Click on a product
    cy.get('[aria-labelledby="product-selection"] [role="button"]')
      .eq(0)
      .click();
    
    // Verify it's selected (visual indicator)
    cy.get('[aria-labelledby="product-selection"] [role="button"][aria-selected="true"]')
      .should('exist');
    
    // Select a different product
    cy.get('[aria-labelledby="product-selection"] [role="button"]')
      .eq(1)
      .click();
    
    // Verify the new one is selected
    cy.get('[aria-labelledby="product-selection"] [role="button"]')
      .eq(1)
      .should('have.attr', 'aria-selected', 'true');
  });

  it('should show color options for selected product', () => {
    // Select the first product
    cy.get('[aria-labelledby="product-selection"] [role="button"]')
      .first()
      .click();
    
    // Check for color swatches
    cy.get('.color-selector')
      .should('be.visible')
      .find('[role="radio"]')
      .should('have.length.gt', 0);
    
    // Select a color
    cy.get('.color-selector [role="radio"]')
      .first()
      .click();
    
    // Verify selection
    cy.get('.color-selector [role="radio"][aria-checked="true"]')
      .should('exist');
  });

  it('should activate camera for try-on', () => {
    // Mock camera permissions
    cy.window().then((win) => {
      cy.stub(win.navigator.mediaDevices, 'getUserMedia').resolves({
        getTracks: () => [{
          stop: () => {}
        }]
      });
    });
    
    // Select a product
    cy.get('[aria-labelledby="product-selection"] [role="button"]')
      .first()
      .click();
    
    // Click camera activation button
    cy.contains('button', /Activate Camera|Start Camera/i).click();
    
    // Camera container should be visible
    cy.get('[data-testid="camera-container"]')
      .should('be.visible');
  });

  it('should display product details for selected item', () => {
    // Select a product
    cy.get('[aria-labelledby="product-selection"] [role="button"]')
      .first()
      .click();
    
    // Verify product details are displayed
    cy.get('.product-details')
      .should('be.visible')
      .within(() => {
        cy.get('h3').should('exist'); // Product name
        cy.get('.price').should('exist'); // Price
        cy.contains(/description|details/i).should('exist');
      });
  });

  it('should track recently tried products', () => {
    // Select first product
    cy.get('[aria-labelledby="product-selection"] [role="button"]')
      .eq(0)
      .click();
    
    // Select second product
    cy.get('[aria-labelledby="product-selection"] [role="button"]')
      .eq(1)
      .click();
    
    // Check that recently tried section contains the first product
    cy.get('.recently-tried')
      .should('be.visible')
      .find('[role="button"]')
      .should('have.length.gte', 1);
  });
});

describe('Beauty Accessibility Features', () => {
  it('should support keyboard navigation for product selection', () => {
    cy.visit('/virtual-try-on');
    cy.contains('Virtual Try-On', { timeout: 10000 }).should('be.visible');
    
    // Tab to the first product
    cy.get('body').tab();
    cy.tab().tab(); // May need adjustment based on page structure
    
    // Verify focus is on a product
    cy.focused()
      .should('have.attr', 'role', 'button')
      .and('have.attr', 'aria-label')
      .and('include', 'Select');
    
    // Press Enter to select
    cy.focused().type('{enter}');
    
    // Verify selection
    cy.focused()
      .should('have.attr', 'aria-selected', 'true');
  });
  
  it('should announce product selection to screen readers', () => {
    cy.visit('/virtual-try-on');
    cy.contains('Virtual Try-On', { timeout: 10000 }).should('be.visible');
    
    // Check if aria-live region exists
    cy.get('[aria-live]').should('exist');
    
    // Select a product and verify announcement is set
    cy.get('[aria-labelledby="product-selection"] [role="button"]')
      .first()
      .click();
    
    // Check that aria-live region has content
    cy.get('[aria-live="polite"]')
      .invoke('text')
      .should('not.be.empty');
  });
}); 