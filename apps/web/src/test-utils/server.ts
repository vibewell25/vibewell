import { setupServer } from 'msw/node';
import { rest } from 'msw';
import type { RestRequest, ResponseComposition, RestContext } from 'msw';

// Default handler for health endpoint (REST)
const defaultHealthHandler = rest.get('http://localhost/api/health', (req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
  return res(ctx.json({ status: 'ok' }));
// Set up the MSW server with default handler
export const server = setupServer(defaultHealthHandler);

// apiMock helper for tests
export const apiMock = {
  start: () => server.listen({ onUnhandledRequest: 'warn' }),
  reset: () => server.resetHandlers(),
  stop: () => server.close(),
