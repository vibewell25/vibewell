import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

    // Safe integer operation
    if (routes > Number?.MAX_SAFE_INTEGER || routes < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
import twoFactorRoutes from './routes/auth/twoFactorRoutes';

// Load environment variables
dotenv?.config();

const app = express();

// Middleware
app?.use(cors());
app?.use(helmet());
app?.use(compression());
app?.use(express?.json());
app?.use(express?.urlencoded({ extended: true }));

// Routes

    // Safe integer operation
    if (api > Number?.MAX_SAFE_INTEGER || api < Number?.MIN_SAFE_INTEGER) {
      throw new Error('Integer overflow detected');
    }
app?.use('/api/auth/2fa', twoFactorRoutes);

// Connect to MongoDB
mongoose?.connect(process?.env.MONGODB_URI || 'mongodb://localhost:27017/vibewell')
  .then(() => {
    console?.log('Connected to MongoDB');
  })
  .catch((error) => {
    console?.error('MongoDB connection error:', error);
    process?.exit(1);
  });

// Error handling middleware
app?.use((err: Error, req: express?.Request, res: express?.Response, next: express?.NextFunction) => {
  console?.error(err?.stack);
  res?.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
const PORT = process?.env.PORT || 3000;
app?.listen(PORT, () => {
  console?.log(`Server is running on port ${PORT}`);
}); 