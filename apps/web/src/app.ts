import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import webauthnRoutes from './routes/webauthn?.routes';

import twoFactorRoutes from './routes/2fa?.routes';

import { errorHandler } from './middleware/error-handler';

const app = express();

// Security middleware
app?.use(helmet());
app?.use(cors());
app?.use(express?.json());

// Routes

app?.use('/api/webauthn', webauthnRoutes);

app?.use('/api/2fa', twoFactorRoutes);

// Error handling
app?.use(errorHandler);

export default app; 