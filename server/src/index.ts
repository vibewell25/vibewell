import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import providerRoutes from './routes/providers';
import serviceRoutes from './routes/services';
import businessRoutes from './routes/businesses';
import businessHoursRoutes from './routes/businessHours';
import staffRoutes from './routes/staff';
import skinAnalysisRoutes from './routes/skinAnalysis';
import stripeRoutes from './routes/stripe';
import loyaltyRoutes from './routes/loyalty';
import referralRoutes from './routes/referrals';
import notificationsRoutes from './routes/notifications';
import analyticsRoutes from './routes/analytics';

dotenv.config();

export const app = express();
app.use(cors());
app.use(express.json());

// Auth endpoints
app.use('/api/auth', authRoutes);

// User endpoints
app.use('/api/users', userRoutes);

// Business Management endpoints
app.use('/api/providers', providerRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/business-hours', businessHoursRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/skin-analysis', skinAnalysisRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
