/* eslint-disable */
// Import handlers to ensure they're properly loaded
import { handlers } from '../handlers';

// Basic test
describe('practitionerData', () => {
  it('should have mock API handlers available', () => {
    expect(Array.isArray(handlers)).toBe(true);
  });
});
