import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

// Define interfaces for data models
export interface Provider {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
}

export interface Review {
  id: string;
  userId?: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  userAvatar?: string;
}

export interface BeautyServiceDetails {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  imageUrls: string[];
  price: number;
  duration: number;
  categoryId: string;
  providerId: string;
  reviews: Review[];
  highlights: string[];
  rating?: number;
  featured?: boolean;
  availability?: {
    dates: string[];
    timeSlots: {
      id: string;
      time: string;
      available: boolean;
    }[];
  };
}

export interface BookingConfirmationParams {
  bookingId: string;
  serviceId: string;
  serviceTitle: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  amount: number;
  duration: number;
  location?: string;
  providerName?: string;
  userInfo: {
    name: string;
    email: string;
    phone: string;
  };
}

// Service model interface
export interface Service {
  id: string;
  providerId: string;
  name: string;
  price: number;
  duration: number;
}

// Business & related models
export interface Business {
  id: string;
  providerId: string;
  name: string;
  address?: string;
  description?: string;
}

export interface BusinessHour {
  id: string;
  businessId: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
}

export interface Staff {
  id: string;
  businessId: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
}

// AR & Skin Analysis
export interface SkinAnalysisResult {
  hydration: number;
  oiliness: number;
  spots: number;
}

// Main Stack Navigator Param List
export type RootStackParamList = {
  // Auth Stack
  Auth: undefined;
  Login: undefined;
  Register: undefined;
  
  // Main Tab Navigator
  Main: undefined;
  Home: undefined;
  Wellness: undefined;
  Beauty: undefined;
  Bookings: undefined;
  Community: undefined;
  Profile: undefined;
  
  // Beauty Stack
  BeautyMain: undefined;
  BeautyServiceDetail: { serviceId: string };
  BeautyBooking: { service: BeautyServiceDetails };
  BookingConfirmation: BookingConfirmationParams;
  // Business Management screens
  ProviderList: undefined;
  ProviderDetail: { provider: Provider };
  ProviderForm: { provider?: Provider };
  // Service Management screens
  ServiceList: undefined;
  ServiceDetail: { service: Service };
  ServiceForm: { service?: Service };
  // Business & Staff screens
  BusinessProfile: { business: Business };
  BusinessForm: { business?: Business; providerId?: string };
  BusinessHours: { business: Business };
  BusinessHourForm: { business: Business; hour?: BusinessHour };
  StaffList: { business: Business };
  StaffForm: { business: Business; staff?: Staff };
  // AR & Skin Analysis screens
  ModelSelection: undefined;
  TryOn: { source: any; scale: [number, number, number] };
  SkinAnalysis: undefined;
  SkinAnalysisResult: { results: SkinAnalysisResult };
  Payment: { priceId: string; mode?: 'payment' | 'subscription' };
  Membership: undefined;
  Loyalty: undefined;
  LoyaltyTransactions: undefined;
  PaymentMethods: undefined;
  Subscriptions: undefined;
  Referral: undefined;
  Analytics: undefined;
};

// Navigation prop types for each screen
export type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Auth'>;
export type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
export type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
export type WellnessScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Wellness'>;
export type BeautyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'BeautyMain'>;
export type BookingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Bookings'>;
export type CommunityScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Community'>;
export type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

export type BeautyServiceDetailNavigationProp = StackNavigationProp<RootStackParamList, 'BeautyServiceDetail'>;
export type BeautyBookingNavigationProp = StackNavigationProp<RootStackParamList, 'BeautyBooking'>;
export type BookingConfirmationNavigationProp = StackNavigationProp<RootStackParamList, 'BookingConfirmation'>;

export type ProviderListNavigationProp = StackNavigationProp<RootStackParamList, 'ProviderList'>;
export type ProviderDetailNavigationProp = StackNavigationProp<RootStackParamList, 'ProviderDetail'>;
export type ProviderFormNavigationProp = StackNavigationProp<RootStackParamList, 'ProviderForm'>;

export type ServiceListNavigationProp = StackNavigationProp<RootStackParamList, 'ServiceList'>;
export type ServiceDetailNavigationProp = StackNavigationProp<RootStackParamList, 'ServiceDetail'>;
export type ServiceFormNavigationProp = StackNavigationProp<RootStackParamList, 'ServiceForm'>;

export type BusinessProfileNavigationProp = StackNavigationProp<RootStackParamList, 'BusinessProfile'>;
export type BusinessFormNavigationProp = StackNavigationProp<RootStackParamList, 'BusinessForm'>;
export type BusinessHoursNavigationProp = StackNavigationProp<RootStackParamList, 'BusinessHours'>;
export type BusinessHourFormNavigationProp = StackNavigationProp<RootStackParamList, 'BusinessHourForm'>;
export type StaffListNavigationProp = StackNavigationProp<RootStackParamList, 'StaffList'>;
export type StaffFormNavigationProp = StackNavigationProp<RootStackParamList, 'StaffForm'>;

export type TryOnNavigationProp = StackNavigationProp<RootStackParamList, 'TryOn'>;
export type SkinAnalysisNavigationProp = StackNavigationProp<RootStackParamList, 'SkinAnalysis'>;
export type SkinAnalysisResultNavigationProp = StackNavigationProp<RootStackParamList, 'SkinAnalysisResult'>;
export type PaymentNavigationProp = StackNavigationProp<RootStackParamList, 'Payment'>;
export type LoyaltyNavigationProp = StackNavigationProp<RootStackParamList, 'Loyalty'>;
export type LoyaltyTransactionsNavigationProp = StackNavigationProp<RootStackParamList, 'LoyaltyTransactions'>;
export type PaymentMethodsNavigationProp = StackNavigationProp<RootStackParamList, 'PaymentMethods'>;
export type MembershipNavigationProp = StackNavigationProp<RootStackParamList, 'Membership'>;
export type SubscriptionsNavigationProp = StackNavigationProp<RootStackParamList, 'Subscriptions'>;
export type ReferralNavigationProp = StackNavigationProp<RootStackParamList, 'Referral'>;
export type AnalyticsNavigationProp = StackNavigationProp<RootStackParamList, 'Analytics'>;

// Route prop types for screens that receive params
export type BeautyServiceDetailRouteProp = RouteProp<RootStackParamList, 'BeautyServiceDetail'>;
export type BeautyBookingRouteProp = RouteProp<RootStackParamList, 'BeautyBooking'>;
export type BookingConfirmationRouteProp = RouteProp<RootStackParamList, 'BookingConfirmation'>;
export type ProviderDetailRouteProp = RouteProp<RootStackParamList, 'ProviderDetail'>;
export type ProviderFormRouteProp = RouteProp<RootStackParamList, 'ProviderForm'>;
export type ServiceDetailRouteProp = RouteProp<RootStackParamList, 'ServiceDetail'>;
export type ServiceFormRouteProp = RouteProp<RootStackParamList, 'ServiceForm'>;

export type BusinessProfileRouteProp = RouteProp<RootStackParamList, 'BusinessProfile'>;
export type BusinessFormRouteProp = RouteProp<RootStackParamList, 'BusinessForm'>;
export type BusinessHoursRouteProp = RouteProp<RootStackParamList, 'BusinessHours'>;
export type BusinessHourFormRouteProp = RouteProp<RootStackParamList, 'BusinessHourForm'>;
export type StaffListRouteProp = RouteProp<RootStackParamList, 'StaffList'>;
export type StaffFormRouteProp = RouteProp<RootStackParamList, 'StaffForm'>;

export type SkinAnalysisResultRouteProp = RouteProp<RootStackParamList, 'SkinAnalysisResult'>;
export type PaymentRouteProp = RouteProp<RootStackParamList, 'Payment'>;
export type LoyaltyRouteProp = RouteProp<RootStackParamList, 'Loyalty'>;
export type LoyaltyTransactionsRouteProp = RouteProp<RootStackParamList, 'LoyaltyTransactions'>;
export type PaymentMethodsRouteProp = RouteProp<RootStackParamList, 'PaymentMethods'>;
export type MembershipRouteProp = RouteProp<RootStackParamList, 'Membership'>;
export type SubscriptionsRouteProp = RouteProp<RootStackParamList, 'Subscriptions'>;
export type ReferralRouteProp = RouteProp<RootStackParamList, 'Referral'>;
export type AnalyticsRouteProp = RouteProp<RootStackParamList, 'Analytics'>;