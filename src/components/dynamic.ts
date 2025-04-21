import { dynamicImport } from '@/utils/dynamicImport';

// Admin Components
export const DynamicBackupManager = dynamicImport(() => import('./admin/backup-manager'));
export const DynamicBackupSettings = dynamicImport(() => import('./admin/backup-settings'));

// Analytics Components
export const DynamicAlertsDashboard = dynamicImport(() => import('./analytics/alerts-dashboard'));
export const DynamicEngagementDashboard = dynamicImport(
  () => import('./analytics/engagement-dashboard')
);
export const DynamicProductMetricsDashboard = dynamicImport(
  () => import('./analytics/product-metrics-dashboard')
);

// AR Components
export const DynamicMeditationEnvironment = dynamicImport(
  () => import('./ar/MeditationEnvironment')
);
export const DynamicVirtualTryOn = dynamicImport(() => import('./ar/virtual-try-on'));

// Auth Components
export const DynamicSignInForm = dynamicImport(() => import('./auth/sign-in-form'));
export const DynamicSignUpForm = dynamicImport(() => import('./auth/sign-up-form'));

// Booking Components
export const DynamicBookingFlow = dynamicImport(() => import('./booking/BookingFlow'));
export const DynamicBookingForm = dynamicImport(() => import('./booking/booking-form'));

// Business Components
export const DynamicConsultationForms = dynamicImport(() => import('./business/ConsultationForms'));
export const DynamicBusinessProfileWizard = dynamicImport(
  () => import('./business/business-profile-wizard')
);
export const DynamicServicesForm = dynamicImport(() => import('./business/forms/services-form'));
export const DynamicVerificationForm = dynamicImport(
  () => import('./business/forms/verification-form')
);

// Content Calendar Components
export const DynamicContentCalendar = dynamicImport(() => import('./content/content-calendar'));
export const DynamicContentCalendarBoard = dynamicImport(
  () => import('./content-calendar/content-calendar-board')
);
export const DynamicContentCalendarCalendar = dynamicImport(
  () => import('./content-calendar/content-calendar-calendar')
);
export const DynamicContentItemModal = dynamicImport(
  () => import('./content-calendar/content-item-modal')
);

// Profile Components
export const DynamicProfileForm = dynamicImport(() => import('./profile/profile-form'));
export const DynamicProfileDeletion = dynamicImport(() => import('./profile/profile-deletion'));

// Provider Components
export const DynamicProviderProfile = dynamicImport(() => import('./provider/profile-form'));

// Mobile Components
export const DynamicMobileBookingFlow = dynamicImport(() => import('./mobile/MobileBookingFlow'));

// UI Components
export const DynamicDateTimePicker = dynamicImport(() => import('./ui/date-time-picker'));
