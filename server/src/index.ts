import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
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
import staffSchedulesRoutes from './routes/staffSchedules';
import attendanceRoutes from './routes/attendance';
import trainingModulesRoutes from './routes/trainingModules';
import trainingProgressRoutes from './routes/trainingProgress';
import promotionsRoutes from './routes/promotionCodes';
import calendarAuthRoutes from './routes/calendarAuth';
import calendarICSRoutes from './routes/calendarICS';
import emailCampaignsRoutes from './routes/emailCampaigns';
import socialPostsRoutes from './routes/socialPosts';
import postCommentsRoutes from './routes/postComments';
import eventsRoutes from './routes/events';
import eventRegistrationsRoutes from './routes/eventRegistrations';
import benefitClaimsRoutes from './routes/benefitClaims';
import payrollRecordsRoutes from './routes/payrollRecords';
import bookingsRoutes from './routes/bookings';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import promBundle from 'express-prom-bundle';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import securityRoutes from './routes/security';
import virtualTryOnRoutes from './routes/virtualTryOn';
import reportsRoutes from './routes/reports';
import helmet from 'helmet';
import { swaggerOptions } from './config/swagger';
import documentsRoutes from './routes/documents';
import formDefinitionsRoutes from './routes/formDefinitions';
import formSubmissionsRoutes from './routes/formSubmissions';
import inventoryRoutes from './routes/inventory';
import equipmentRoutes from './routes/equipment';

dotenv.config();

// Validate required environment variables (skip in test)
if (process.env.NODE_ENV !== 'test') {
  ['FRONTEND_URL','GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET','GOOGLE_REDIRECT_URI','OUTLOOK_CLIENT_ID','OUTLOOK_CLIENT_SECRET','OUTLOOK_TENANT_ID','OUTLOOK_REDIRECT_URI','RP_ID','COOKIE_SECRET','JWT_SECRET']
    .forEach(key => {
      if (!process.env[key]) throw new Error(`${key} is required`);
    });
}

export const app = express();
app.use(helmet());
// Ensure CORS only allowed for frontend with credentials
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET!));
// CSRF protection, skip for security endpoints
const csrfProtection = csurf({ cookie: { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' } });
app.use((req, res, next) => {
  if (req.path.startsWith('/api/security')) return next();
  return csrfProtection(req, res, next as any);
});
const metricsMiddleware = promBundle({ metricsPath: '/metrics' });
app.use(metricsMiddleware);

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
app.use('/api/promotions', promotionsRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use('/api/staff-schedules', staffSchedulesRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/training-modules', trainingModulesRoutes);
app.use('/api/training-progress', trainingProgressRoutes);
app.use('/api/social-posts', socialPostsRoutes);
app.use('/api/post-comments', postCommentsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/event-registrations', eventRegistrationsRoutes);
app.use('/api/benefit-claims', benefitClaimsRoutes);
app.use('/api/payroll-records', payrollRecordsRoutes);
app.use('/api/bookings', bookingsRoutes);

// removed duplicate calendar route mount
// calendarRoutes removed in favor of combined calendarAuthRoutes
app.use('/api/calendar', calendarAuthRoutes);
app.use('/api/calendar/ics', calendarICSRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/form-definitions', formDefinitionsRoutes);
app.use('/api/form-submissions', formSubmissionsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/equipment', equipmentRoutes);

// Security endpoints
app.use('/api/security', securityRoutes);
// Virtual Try-On & style recommendations
app.use('/api/virtual-tryon', virtualTryOnRoutes);
// BI & reporting endpoints
app.use('/api/reports', reportsRoutes);

// Swagger UI
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/api', (req, res) => res.json({ status: 'ok' }));

// Export port and only start server when run directly
export const PORT = process.env.PORT || 4000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
