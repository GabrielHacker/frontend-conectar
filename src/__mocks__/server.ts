import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup MSW server com os handlers
export const server = setupServer(...handlers);