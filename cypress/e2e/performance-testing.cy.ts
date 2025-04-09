/// <reference types="cypress" />

describe('Performance Testing', () => {
  beforeEach(() => {
    // Clear cache and cookies before each test
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Enable response time tracking for XHR requests
    cy.server();
    cy.route({
      method: 'GET',
      url: '/api/**',
      onResponse: (xhr) => {
        // Calculate response time
        const responseTime = xhr.xhr.responseTime || 0;
        cy.log(`API Response Time: ${responseTime}ms`);
        
        // Assert that response time is below threshold
        expect(responseTime).to.be.lessThan(1000); // 1 second threshold
      }
    });
  });

  it('should load the home page within acceptable time', () => {
    // Start timing
    const start = performance.now();
    
    // Visit home page
    cy.visit('/');
    
    // Wait for main content to be visible
    cy.get('main').should('be.visible').then(() => {
      const loadTime = performance.now() - start;
      cy.log(`Home page load time: ${loadTime.toFixed(2)}ms`);
      
      // Assert load time is below threshold (3 seconds)
      expect(loadTime).to.be.lessThan(3000);
    });
  });

  it('should load the try-on page within acceptable time', () => {
    // Start timing
    const start = performance.now();
    
    // Visit try-on page
    cy.visit('/try-on');
    
    // Wait for AR viewer components to be visible
    cy.get('[data-testid="three-ar-viewer"]').should('be.visible').then(() => {
      const loadTime = performance.now() - start;
      cy.log(`Try-on page load time: ${loadTime.toFixed(2)}ms`);
      
      // Assert load time is below threshold (5 seconds for complex AR page)
      expect(loadTime).to.be.lessThan(5000);
    });
  });

  it('should render product list efficiently', () => {
    // Visit products page
    cy.visit('/products');
    
    // Start timing when navigation completes
    cy.window().then((win) => {
      // Mark the start time
      const startTime = performance.now();
      
      // Force a re-render by filtering products
      cy.get('[data-cy="filter-button"]').click();
      cy.get('[data-cy="filter-option-popular"]').click();
      
      // Wait for products to be re-rendered
      cy.get('[data-cy="product-card"]').should('have.length.greaterThan', 0).then(() => {
        const renderTime = performance.now() - startTime;
        cy.log(`Product list render time: ${renderTime.toFixed(2)}ms`);
        
        // Assert render time is below threshold (1 second)
        expect(renderTime).to.be.lessThan(1000);
      });
    });
  });

  it('should check avatar loading performance', () => {
    // Login first (assuming there's a login functionality)
    cy.visit('/login');
    cy.get('[data-cy="email-input"]').type('test@example.com');
    cy.get('[data-cy="password-input"]').type('password123');
    cy.get('[data-cy="login-button"]').click();
    
    // Navigate to profile page
    cy.visit('/profile');
    
    // Start timing
    const start = performance.now();
    
    // Wait for avatar to be visible
    cy.get('[data-cy="user-avatar"]').should('be.visible').then(() => {
      const avatarLoadTime = performance.now() - start;
      cy.log(`Avatar image load time: ${avatarLoadTime.toFixed(2)}ms`);
      
      // Assert avatar loads within 500ms
      expect(avatarLoadTime).to.be.lessThan(500);
    });
  });

  it('should load and cache models efficiently in AR try-on', () => {
    // Visit try-on page
    cy.visit('/try-on');
    
    // Select a model and time loading
    cy.contains('button', 'Lipstick').click();
    
    // Start timing
    const startTime = performance.now();
    
    // Wait for first load and record time
    cy.get('[data-testid="loader"]').should('not.exist', { timeout: 10000 }).then(() => {
      const firstLoadTime = performance.now() - startTime;
      cy.log(`First model load time: ${firstLoadTime.toFixed(2)}ms`);
      
      // Assert first load time is reasonable (below 8 seconds)
      expect(firstLoadTime).to.be.lessThan(8000);
      
      // Reload page to test caching
      cy.reload();
      
      // Select the same model again
      cy.contains('button', 'Lipstick').click();
      
      // Start timing second load
      const secondStartTime = performance.now();
      
      // Wait for second load and compare times
      cy.get('[data-testid="loader"]').should('not.exist', { timeout: 10000 }).then(() => {
        const secondLoadTime = performance.now() - secondStartTime;
        cy.log(`Second model load time: ${secondLoadTime.toFixed(2)}ms`);
        
        // Assert that second load is faster due to caching
        expect(secondLoadTime).to.be.lessThan(firstLoadTime);
        
        // Assert second load is fast (below 3 seconds for cached model)
        expect(secondLoadTime).to.be.lessThan(3000);
      });
    });
  });
}); 