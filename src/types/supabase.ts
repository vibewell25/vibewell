export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string
          avatar_url: string | null
          email: string
          phone: string | null
          bio: string | null
          user_type: 'customer' | 'provider' | 'admin'
          is_verified: boolean
          preferences: Json
          metadata: Json
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name: string
          avatar_url?: string | null
          email: string
          phone?: string | null
          bio?: string | null
          user_type: 'customer' | 'provider' | 'admin'
          is_verified?: boolean
          preferences?: Json
          metadata?: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string
          avatar_url?: string | null
          email?: string
          phone?: string | null
          bio?: string | null
          user_type?: 'customer' | 'provider' | 'admin'
          is_verified?: boolean
          preferences?: Json
          metadata?: Json
        }
      }
      services: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string
          price: number
          duration: number
          category: string
          provider_id: string
          is_active: boolean
          metadata: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description: string
          price: number
          duration: number
          category: string
          provider_id: string
          is_active?: boolean
          metadata?: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string
          price?: number
          duration?: number
          category?: string
          provider_id?: string
          is_active?: boolean
          metadata?: Json
        }
      }
      bookings: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          start_time: string
          end_time: string
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          service_id: string
          provider_id: string
          customer_id: string
          notes: string | null
          metadata: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          start_time: string
          end_time: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          service_id: string
          provider_id: string
          customer_id: string
          notes?: string | null
          metadata?: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          start_time?: string
          end_time?: string
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          service_id?: string
          provider_id?: string
          customer_id?: string
          notes?: string | null
          metadata?: Json
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 