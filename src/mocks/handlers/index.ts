import { authHandlers } from './auth';
import { bookingHandlers } from './booking';
import { paymentHandlers } from './payment';
import { userHandlers } from './user';
import { arHandlers } from './ar';
import { aiHandlers } from './ai';

// Export all handlers for global MSW setup
export const handlers = [
  ...authHandlers,
  ...bookingHandlers,
  ...paymentHandlers,
  ...userHandlers,
  ...arHandlers,
  ...aiHandlers
]; 