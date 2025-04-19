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
  longDescription: string;
  price: string;
  duration: string;
  category: string;
  provider: Provider;
  images: string[];
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
  userInfo: {
    name: string;
    email: string;
    phone: string;
  };
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

// Route prop types for screens that receive params
export type BeautyServiceDetailRouteProp = RouteProp<RootStackParamList, 'BeautyServiceDetail'>;
export type BeautyBookingRouteProp = RouteProp<RootStackParamList, 'BeautyBooking'>;
export type BookingConfirmationRouteProp = RouteProp<RootStackParamList, 'BookingConfirmation'>; 