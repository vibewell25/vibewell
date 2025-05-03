import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Booking } from './booking';
import { InventoryItem } from './inventory';
import { EquipmentItem } from './equipment';
import { Post, CommunityEvent, Thread } from './community';
import { PayrollRecord } from './payroll';
import { BenefitClaim } from './benefits';

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
  id: string;
  date: string;
  overall: number;
  hydration: number;
  oiliness: number;
  spots: number;
  wrinkles: number;
  firmness: number;
  conditions: Array<{
    name: string;
    severity: number;
    description: string;
  }>;
  recommendations: Array<{
    type: string;
    product: string;
    description: string;
  }>;
  imageUri?: string;
}

// Inventory model interface
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
}

// Equipment model interface
export interface EquipmentItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
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
  SkinAnalysisHistory: undefined;
  SkinAnalysisDetails: { id: string };
  Payment: { priceId: string; mode?: 'payment' | 'subscription' };
  Membership: undefined;
  Loyalty: undefined;
  LoyaltyTransactions: undefined;
  PaymentMethods: undefined;
  Subscriptions: undefined;
  Referral: undefined;
  Analytics: undefined;
  StaffSchedules: undefined;
  Attendance: undefined;
  TrainingModules: undefined;
  TrainingProgress: undefined;
  Promotions: undefined;
  EmailCampaigns: undefined;
  Notifications: undefined;
  FormList: undefined;
  FormDetail: { id: string };
  PostList: undefined;
  PostDetail: { id: string };
  PostForm: { post?: Post };
  // Community Thread screens
  ThreadList: undefined;
  ThreadDetail: { id: string };
  ThreadForm: { thread?: Thread };
  EventList: undefined;
  EventDetail: { id: string };
  EventForm: { event?: CommunityEvent };
  InventoryList: undefined;
  InventoryDetail: { id: string };
  InventoryForm: { item?: InventoryItem };
  EquipmentList: undefined;
  EquipmentDetail: { id: string };
  EquipmentForm: { item?: EquipmentItem };
  Calendar: undefined;
  BookingDetail: { booking: Booking };
  NewBooking: undefined;
  PayrollList: undefined;
  PayrollDetail: { id: string };
  PayrollForm: { record?: PayrollRecord };
  BenefitList: undefined;
  BenefitDetail: { id: string };
  BenefitForm: { claim?: BenefitClaim };
};

// Navigation prop types for each screen
export type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Auth'>;
export type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;
export type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
export type WellnessScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Wellness'>;
export type BeautyScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Beauty'>;
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

export type ModelSelectionNavigationProp = StackNavigationProp<RootStackParamList, 'ModelSelection'>;
export type TryOnNavigationProp = StackNavigationProp<RootStackParamList, 'TryOn'>;
export type SkinAnalysisNavigationProp = StackNavigationProp<RootStackParamList, 'SkinAnalysis'>;
export type SkinAnalysisResultNavigationProp = StackNavigationProp<RootStackParamList, 'SkinAnalysisResult'>;
export type SkinAnalysisHistoryNavigationProp = StackNavigationProp<RootStackParamList, 'SkinAnalysisHistory'>;
export type SkinAnalysisDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'SkinAnalysisDetails'>;
export type PaymentNavigationProp = StackNavigationProp<RootStackParamList, 'Payment'>;
export type LoyaltyNavigationProp = StackNavigationProp<RootStackParamList, 'Loyalty'>;
export type LoyaltyTransactionsNavigationProp = StackNavigationProp<RootStackParamList, 'LoyaltyTransactions'>;
export type PaymentMethodsNavigationProp = StackNavigationProp<RootStackParamList, 'PaymentMethods'>;
export type MembershipNavigationProp = StackNavigationProp<RootStackParamList, 'Membership'>;
export type SubscriptionsNavigationProp = StackNavigationProp<RootStackParamList, 'Subscriptions'>;
export type ReferralNavigationProp = StackNavigationProp<RootStackParamList, 'Referral'>;
export type AnalyticsNavigationProp = StackNavigationProp<RootStackParamList, 'Analytics'>;
export type StaffSchedulesNavigationProp = StackNavigationProp<RootStackParamList, 'StaffSchedules'>;
export type AttendanceNavigationProp = StackNavigationProp<RootStackParamList, 'Attendance'>;
export type TrainingModulesNavigationProp = StackNavigationProp<RootStackParamList, 'TrainingModules'>;
export type TrainingProgressNavigationProp = StackNavigationProp<RootStackParamList, 'TrainingProgress'>;
export type PromotionsNavigationProp = StackNavigationProp<RootStackParamList, 'Promotions'>;
export type EmailCampaignsNavigationProp = StackNavigationProp<RootStackParamList, 'EmailCampaigns'>;
export type NotificationsNavigationProp = StackNavigationProp<RootStackParamList, 'Notifications'>;
export type FormListNavigationProp = StackNavigationProp<RootStackParamList, 'FormList'>;
export type FormDetailNavigationProp = StackNavigationProp<RootStackParamList, 'FormDetail'>;
export type PostListNavigationProp = StackNavigationProp<RootStackParamList, 'PostList'>;
export type PostDetailNavigationProp = StackNavigationProp<RootStackParamList, 'PostDetail'>;
export type PostFormNavigationProp = StackNavigationProp<RootStackParamList, 'PostForm'>;
export type EventListNavigationProp = StackNavigationProp<RootStackParamList, 'EventList'>;
export type EventDetailNavigationProp = StackNavigationProp<RootStackParamList, 'EventDetail'>;
export type EventFormNavigationProp = StackNavigationProp<RootStackParamList, 'EventForm'>;
export type InventoryListNavigationProp = StackNavigationProp<RootStackParamList, 'InventoryList'>;
export type InventoryDetailNavigationProp = StackNavigationProp<RootStackParamList, 'InventoryDetail'>;
export type InventoryFormNavigationProp = StackNavigationProp<RootStackParamList, 'InventoryForm'>;
export type EquipmentListNavigationProp = StackNavigationProp<RootStackParamList, 'EquipmentList'>;
export type EquipmentDetailNavigationProp = StackNavigationProp<RootStackParamList, 'EquipmentDetail'>;
export type EquipmentFormNavigationProp = StackNavigationProp<RootStackParamList, 'EquipmentForm'>;
export type CalendarNavigationProp = StackNavigationProp<RootStackParamList, 'Calendar'>;
export type BookingDetailNavigationProp = StackNavigationProp<RootStackParamList, 'BookingDetail'>;
export type NewBookingNavigationProp = StackNavigationProp<RootStackParamList, 'NewBooking'>;
export type PayrollListNavigationProp = StackNavigationProp<RootStackParamList, 'PayrollList'>;
export type PayrollDetailNavigationProp = StackNavigationProp<RootStackParamList, 'PayrollDetail'>;
export type PayrollFormNavigationProp = StackNavigationProp<RootStackParamList, 'PayrollForm'>;
export type BenefitListNavigationProp = StackNavigationProp<RootStackParamList, 'BenefitList'>;
export type BenefitDetailNavigationProp = StackNavigationProp<RootStackParamList, 'BenefitDetail'>;
export type BenefitFormNavigationProp = StackNavigationProp<RootStackParamList, 'BenefitForm'>;
export type ThreadListNavigationProp = StackNavigationProp<RootStackParamList, 'ThreadList'>;
export type ThreadDetailNavigationProp = StackNavigationProp<RootStackParamList, 'ThreadDetail'>;
export type ThreadFormNavigationProp = StackNavigationProp<RootStackParamList, 'ThreadForm'>;

// Route prop types
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
export type TryOnRouteProp = RouteProp<RootStackParamList, 'TryOn'>;
export type SkinAnalysisResultRouteProp = RouteProp<RootStackParamList, 'SkinAnalysisResult'>;
export type SkinAnalysisHistoryRouteProp = RouteProp<RootStackParamList, 'SkinAnalysisHistory'>;
export type SkinAnalysisDetailsRouteProp = RouteProp<RootStackParamList, 'SkinAnalysisDetails'>;
export type PaymentRouteProp = RouteProp<RootStackParamList, 'Payment'>;
export type LoyaltyRouteProp = RouteProp<RootStackParamList, 'Loyalty'>;
export type LoyaltyTransactionsRouteProp = RouteProp<RootStackParamList, 'LoyaltyTransactions'>;
export type PaymentMethodsRouteProp = RouteProp<RootStackParamList, 'PaymentMethods'>;
export type MembershipRouteProp = RouteProp<RootStackParamList, 'Membership'>;
export type SubscriptionsRouteProp = RouteProp<RootStackParamList, 'Subscriptions'>;
export type ReferralRouteProp = RouteProp<RootStackParamList, 'Referral'>;
export type AnalyticsRouteProp = RouteProp<RootStackParamList, 'Analytics'>;
export type StaffSchedulesRouteProp = RouteProp<RootStackParamList, 'StaffSchedules'>;
export type AttendanceRouteProp = RouteProp<RootStackParamList, 'Attendance'>;
export type TrainingModulesRouteProp = RouteProp<RootStackParamList, 'TrainingModules'>;
export type TrainingProgressRouteProp = RouteProp<RootStackParamList, 'TrainingProgress'>;
export type PromotionsRouteProp = RouteProp<RootStackParamList, 'Promotions'>;
export type EmailCampaignsRouteProp = RouteProp<RootStackParamList, 'EmailCampaigns'>;
export type NotificationsRouteProp = RouteProp<RootStackParamList, 'Notifications'>;
export type FormListRouteProp = RouteProp<RootStackParamList, 'FormList'>;
export type FormDetailRouteProp = RouteProp<RootStackParamList, 'FormDetail'>;
export type PostListRouteProp = RouteProp<RootStackParamList, 'PostList'>;
export type PostDetailRouteProp = RouteProp<RootStackParamList, 'PostDetail'>;
export type PostFormRouteProp = RouteProp<RootStackParamList, 'PostForm'>;
export type EventListRouteProp = RouteProp<RootStackParamList, 'EventList'>;
export type EventDetailRouteProp = RouteProp<RootStackParamList, 'EventDetail'>;
export type EventFormRouteProp = RouteProp<RootStackParamList, 'EventForm'>;
export type InventoryListRouteProp = RouteProp<RootStackParamList, 'InventoryList'>;
export type InventoryDetailRouteProp = RouteProp<RootStackParamList, 'InventoryDetail'>;
export type InventoryFormRouteProp = RouteProp<RootStackParamList, 'InventoryForm'>;
export type EquipmentListRouteProp = RouteProp<RootStackParamList, 'EquipmentList'>;
export type EquipmentDetailRouteProp = RouteProp<RootStackParamList, 'EquipmentDetail'>;
export type EquipmentFormRouteProp = RouteProp<RootStackParamList, 'EquipmentForm'>;
export type CalendarRouteProp = RouteProp<RootStackParamList, 'Calendar'>;
export type BookingDetailRouteProp = RouteProp<RootStackParamList, 'BookingDetail'>;
export type NewBookingRouteProp = RouteProp<RootStackParamList, 'NewBooking'>;
export type PayrollListRouteProp = RouteProp<RootStackParamList, 'PayrollList'>;
export type PayrollDetailRouteProp = RouteProp<RootStackParamList, 'PayrollDetail'>;
export type PayrollFormRouteProp = RouteProp<RootStackParamList, 'PayrollForm'>;
export type BenefitListRouteProp = RouteProp<RootStackParamList, 'BenefitList'>;
export type BenefitDetailRouteProp = RouteProp<RootStackParamList, 'BenefitDetail'>;
export type BenefitFormRouteProp = RouteProp<RootStackParamList, 'BenefitForm'>;
export type ThreadListRouteProp = RouteProp<RootStackParamList, 'ThreadList'>;
export type ThreadDetailRouteProp = RouteProp<RootStackParamList, 'ThreadDetail'>;
export type ThreadFormRouteProp = RouteProp<RootStackParamList, 'ThreadForm'>;