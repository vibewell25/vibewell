export type UserRole = 'customer' | 'provider' | 'admin';

export type ProfileVisibility = 'public' | 'private' | 'contacts_only';

export interface NotificationPreferences {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  booking_reminders: boolean;
  messages_notifications: boolean;
  promotional_notifications: boolean;
  newsletter: boolean;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  bio: string | null;
  location: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
  email_verified: boolean;
  profile_visibility: ProfileVisibility;
  notification_preferences: NotificationPreferences;
  phone_verified: boolean;
  show_email: boolean;
  show_phone: boolean;
  allow_tagging: boolean;
  receive_messages_from: 'anyone' | 'contacts_only' | 'none';
}

export interface Service {
  id: string;
  provider_id: string;
  title: string;
  description: string | null;
  price: number;
  duration: number;
  category: string;
  subcategory: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  customer_id: string;
  provider_id: string;
  service_id: string;
  status: BookingStatus;
  date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  provider_id: string;
  rating: number;
  cleanliness_rating: number | null;
  value_rating: number | null;
  service_rating: number | null;
  comment: string | null;
  provider_response: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  provider_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customer_id: string;
  provider_id: string;
  status: OrderStatus;
  total_amount: number;
  shipping_address: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface TrainingProgram {
  id: string;
  provider_id: string;
  title: string;
  description: string | null;
  price: number;
  duration: number;
  category: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: string;
  user_id: string;
  program_id: string;
  issue_date: string;
  expiry_date: string | null;
  download_url: string | null;
  created_at: string;
}

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired';

export interface Subscription {
  id: string;
  user_id: string;
  provider_id: string | null;
  program_id: string | null;
  status: SubscriptionStatus;
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}
