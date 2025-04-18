/**
 * GraphQL resolvers with integrated rate limiting
 * 
 * These resolvers handle the actual business logic for the GraphQL API.
 * Each resolver is wrapped with the rate limiting HOC to enforce limits.
 */

import { GraphQLError } from 'graphql';
import { withGraphQLRateLimit } from '@/lib/rate-limiter';
import { ValueNode, Kind } from 'graphql';
import { SupabaseClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/database/client'
import { Filter } from '@supabase/postgrest-js'

// Type definitions
interface Context {
  userId?: string;
  userRole?: string;
  supabase: SupabaseClient;
}

interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: string;
}

interface Provider {
  id: string;
  created_at: string;
  updated_at: string;
  user: Profile;
  categories: string[];
  description?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

interface Service {
  id: string;
  created_at: string;
  updated_at: string;
  provider_id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  is_active: boolean;
}

interface Booking {
  id: string;
  created_at: string;
  updated_at: string;
  provider_id: string;
  customer_id: string;
  service_id: string;
  start_time: string;
  end_time: string;
  status: string;
  provider?: Provider;
  customer?: Profile;
  service?: Service;
}

interface LocationInput {
  lat: number;
  lng: number;
  radius?: number;
}

// GraphQL JSON scalar for handling JSON data
const GraphQLJSON = {
  // Parse value from client
  parseLiteral(ast: ValueNode): unknown {
    if (ast.kind === Kind.STRING) {
      try {
        return JSON.parse(ast.value);
      } catch {
        return null;
      }
    }
    return null;
  },
  
  // Parse value from client variables
  parseValue(value: string): unknown {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  },
  
  // Serialize value to client
  serialize(value: unknown): string {
    return JSON.stringify(value);
  }
};

// Define the base resolvers without rate limiting
const baseResolvers = {
  // Custom scalar resolver
  JSON: GraphQLJSON,
  
  // Query resolvers
  Query: {
    // User queries
    me: async (_parent: unknown, _args: unknown, context: Context): Promise<Profile> => {
      // Ensure the user is authenticated
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      
      const { data, error } = await context.supabase
        .from('profiles')
        .select('*')
        .eq('id', context.userId)
        .single();
      
      if (error) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'DATABASE_ERROR' }
        });
      }
      
      return data;
    },
    
    user: async (_parent: unknown, args: { id: string }, context: Context): Promise<Profile> => {
      const { id } = args;
      
      // Ensure the user is authenticated
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      
      // Only admins can query other users directly
      if (context.userRole !== 'admin' && context.userId !== id) {
        throw new GraphQLError('Not authorized', {
          extensions: { code: 'FORBIDDEN' }
        });
      }
      
      const { data, error } = await context.supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'DATABASE_ERROR' }
        });
      }
      
      return data;
    },
    
    // Provider queries
    provider: async (_parent: unknown, args: { id: string }, context: Context): Promise<Provider> => {
      const { id } = args;
      
      const { data, error } = await context.supabase
        .from('providers')
        .select(`
          *,
          user:profiles(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'DATABASE_ERROR' }
        });
      }
      
      return data;
    },
    
    providers: async (
      _parent: unknown, 
      args: { 
        category?: string; 
        location?: LocationInput; 
        limit?: number; 
        offset?: number 
      }, 
      context: Context
    ): Promise<Provider[]> => {
      const { category, location, limit = 10, offset = 0 } = args;
      
      let query = context.supabase
        .from('providers')
        .select(`
          *,
          user:profiles(*)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      // Apply category filter if provided
      if (category) {
        query = query.contains('categories', [category]);
      }
      
      // For location filtering, we would need a PostGIS extension in Supabase
      // This is a simplified version that doesn't do actual geo filtering
      if (location) {
        // In a real implementation, you would use a PostGIS query here
        console.warn('Location filtering requested but not implemented in demo');
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'DATABASE_ERROR' }
        });
      }
      
      return data;
    },
    
    // Service queries
    service: async (_parent: unknown, args: { id: string }, context: Context): Promise<Service> => {
      const { id } = args;
      
      const { data, error } = await context.supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'DATABASE_ERROR' }
        });
      }
      
      return data;
    },
    
    services: async (
      _parent: unknown, 
      args: { 
        providerId?: string; 
        category?: string; 
        limit?: number; 
        offset?: number 
      }, 
      context: Context
    ): Promise<Service[]> => {
      const { providerId, category, limit = 20, offset = 0 } = args;
      
      let query = context.supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (providerId) {
        query = query.eq('provider_id', providerId);
      }
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'DATABASE_ERROR' }
        });
      }
      
      return data;
    },
    
    // Booking queries
    booking: async (_parent: unknown, args: { id: string }, context: Context): Promise<Booking> => {
      const { id } = args;
      
      // Ensure the user is authenticated
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      
      let query = context.supabase
        .from('bookings')
        .select(`
          *,
          provider:providers(*),
          customer:profiles(*),
          service:services(*)
        `)
        .eq('id', id)
        .single();
      
      // For admin users, show all bookings. For regular users, only show their own bookings
      if (context.userRole !== 'admin') {
        query = query.or('customer_id.eq.' + context.userId + ',provider_id.eq.' + context.userId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'DATABASE_ERROR' }
        });
      }
      
      return data;
    },
    
    myBookings: async (_parent: unknown, args: { status?: string }, context: Context): Promise<Booking[]> => {
      const { status } = args;
      
      // Ensure the user is authenticated
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      
      let query = context.supabase
        .from('bookings')
        .select(`
          *,
          provider:providers(*),
          customer:profiles(*),
          service:services(*)
        `)
        .filter(
          'customer_id',
          'eq',
          context.userId
        ).or('provider_id.eq.' + context.userId)
        .order('start_time', { ascending: true });
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'DATABASE_ERROR' }
        });
      }
      
      return data;
    },
    
    providerBookings: async (_parent: unknown, args: { providerId: string; status?: string }, context: Context): Promise<Booking[]> => {
      const { providerId, status } = args;
      
      // Ensure the user is authenticated
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      
      // Users can only view their own provider bookings unless they're admins
      if (context.userRole !== 'admin' && context.userId !== providerId) {
        throw new GraphQLError('Not authorized', {
          extensions: { code: 'FORBIDDEN' }
        });
      }
      
      let query = context.supabase
        .from('bookings')
        .select(`
          *,
          customer:profiles(*),
          service:services(*)
        `)
        .eq('provider_id', providerId)
        .order('start_time', { ascending: true });
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'DATABASE_ERROR' }
        });
      }
      
      return data;
    },
    
    // Review queries
    review: async (_parent: unknown, args: { id: string }, context: Context): Promise<unknown> => {
      const { id } = args;
      
      const { data, error } = await context.supabase
        .from('reviews')
        .select(`
          *,
          customer:profiles(*),
          provider:providers(*),
          service:services(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'DATABASE_ERROR' }
        });
      }
      
      return data;
    },
    
    reviewsByProvider: async (_parent: unknown, args: { providerId: string; limit?: number; offset?: number }, context: Context): Promise<unknown[]> => {
      const { providerId, limit = 10, offset = 0 } = args;
      
      const { data, error } = await context.supabase
        .from('reviews')
        .select(`
          *,
          customer:profiles(*),
          service:services(*)
        `)
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'DATABASE_ERROR' }
        });
      }
      
      return data;
    },
  },
  
  // Mutation resolvers
  Mutation: {
    // User mutations
    registerUser: async (_parent: unknown, args: { input: any }, context: Context): Promise<unknown> => {
      const { input } = args;
      
      // Register the user with Supabase Auth
      const { data: authData, error: authError } = await context.supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            full_name: input.fullName,
            user_type: input.userType || 'customer',
          }
        }
      });
      
      if (authError) {
        throw new GraphQLError(authError.message, {
          extensions: { code: 'AUTH_ERROR' }
        });
      }
      
      return {
        token: authData.session?.access_token || '',
        user: {
          id: authData.user?.id,
          email: authData.user?.email,
          fullName: authData.user?.user_metadata?.full_name,
          userType: authData.user?.user_metadata?.user_type,
        }
      };
    },
    
    login: async (_parent: unknown, args: { email: string; password: string }, context: Context): Promise<unknown> => {
      const { email, password } = args;
      
      // Sign in the user with Supabase Auth
      const { data: authData, error: authError } = await context.supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (authError) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'AUTH_ERROR' }
        });
      }
      
      return {
        token: authData.session?.access_token || '',
        user: {
          id: authData.user?.id,
          email: authData.user?.email,
          fullName: authData.user?.user_metadata?.full_name,
          userType: authData.user?.user_metadata?.user_type,
        }
      };
    },
    
    updateProfile: async (_parent: unknown, args: { input: any }, context: Context): Promise<unknown> => {
      const { input } = args;
      
      // Ensure the user is authenticated
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      
      // Update the user profile
      const { data, error } = await context.supabase
        .from('profiles')
        .update({
          full_name: input.fullName,
          avatar_url: input.avatarUrl,
          preferences: input.preferences,
          updated_at: new Date().toISOString(),
        })
        .eq('id', context.userId)
        .select()
        .single();
      
      if (error) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'DATABASE_ERROR' }
        });
      }
      
      return data;
    },
    
    // Provider mutations
    createProvider: async (_parent: unknown, args: { input: any }, context: Context): Promise<unknown> => {
      const { input } = args;
      
      // Ensure the user is authenticated
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      
      // Create the provider
      const { data, error } = await context.supabase
        .from('providers')
        .insert({
          user_id: context.userId,
          business_name: input.businessName,
          description: input.description,
          address: input.address,
          categories: input.categories || [],
          business_hours: input.businessHours || [],
          contact_info: input.contactInfo || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'DATABASE_ERROR' }
        });
      }
      
      // Update the user's role to provider
      await context.supabase.auth.updateUser({
        data: {
          user_type: 'provider',
        }
      });
      
      return data;
    },
    
    updateProvider: async (_parent: unknown, args: { id: string; input: any }, context: Context): Promise<unknown> => {
      const { id, input } = args;
      
      // Ensure the user is authenticated
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      
      // Check if the user is authorized to update this provider
      // Only the provider owner or an admin can update a provider
      if (context.userRole !== 'admin') {
        const { data: provider, error: providerError } = await context.supabase
          .from('providers')
          .select('user_id')
          .eq('id', id)
          .single();
        
        if (providerError || !provider || provider.user_id !== context.userId) {
          throw new GraphQLError('Not authorized', {
            extensions: { code: 'FORBIDDEN' }
          });
        }
      }
      
      // Update the provider
      const { data, error } = await context.supabase
        .from('providers')
        .update({
          business_name: input.businessName,
          description: input.description,
          address: input.address,
          categories: input.categories,
          business_hours: input.businessHours,
          contact_info: input.contactInfo,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'DATABASE_ERROR' }
        });
      }
      
      return data;
    },
    
    // Service mutations
    createService: async (_parent: unknown, args: { input: any }, context: Context): Promise<unknown> => {
      const { input } = args;
      
      // Ensure the user is authenticated
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      
      // Get the provider ID for this user
      const { data: provider, error: providerError } = await context.supabase
        .from('providers')
        .select('id')
        .eq('user_id', context.userId)
        .single();
      
      if (providerError || !provider) {
        throw new GraphQLError('You must be a provider to create services', {
          extensions: { code: 'FORBIDDEN' }
        });
      }
      
      // Create the service
      const { data, error } = await context.supabase
        .from('services')
        .insert({
          provider_id: provider.id,
          name: input.name,
          description: input.description,
          price: input.price,
          duration: input.duration,
          category: input.category,
          image_url: input.imageUrl,
          is_active: input.isActive !== undefined ? input.isActive : true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'DATABASE_ERROR' }
        });
      }
      
      return data;
    },
    
    updateService: async (_parent: unknown, args: { id: string; input: any }, context: Context): Promise<unknown> => {
      const { id, input } = args;
      
      // Ensure the user is authenticated
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      
      // Check if the user is authorized to update this service
      // Only the service provider or an admin can update a service
      if (context.userRole !== 'admin') {
        const { data: service, error: serviceError } = await context.supabase
          .from('services')
          .select('provider_id')
          .eq('id', id)
          .single();
        
        if (serviceError || !service) {
          throw new GraphQLError('Service not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }
        
        const { data: provider, error: providerError } = await context.supabase
          .from('providers')
          .select('user_id')
          .eq('id', service.provider_id)
          .single();
        
        if (providerError || !provider || provider.user_id !== context.userId) {
          throw new GraphQLError('Not authorized', {
            extensions: { code: 'FORBIDDEN' }
          });
        }
      }
      
      // Update the service
      const { data, error } = await context.supabase
        .from('services')
        .update({
          name: input.name,
          description: input.description,
          price: input.price,
          duration: input.duration,
          category: input.category,
          image_url: input.imageUrl,
          is_active: input.isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'DATABASE_ERROR' }
        });
      }
      
      return data;
    },
    
    deleteService: async (_parent: unknown, args: { id: string }, context: Context): Promise<boolean> => {
      const { id } = args;
      
      // Ensure the user is authenticated
      if (!context.userId) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }
      
      // Check if the user is authorized to delete this service
      // Only the service provider or an admin can delete a service
      if (context.userRole !== 'admin') {
        const { data: service, error: serviceError } = await context.supabase
          .from('services')
          .select('provider_id')
          .eq('id', id)
          .single();
        
        if (serviceError || !service) {
          throw new GraphQLError('Service not found', {
            extensions: { code: 'NOT_FOUND' }
          });
        }
        
        const { data: provider, error: providerError } = await context.supabase
          .from('providers')
          .select('user_id')
          .eq('id', service.provider_id)
          .single();
        
        if (providerError || !provider || provider.user_id !== context.userId) {
          throw new GraphQLError('Not authorized', {
            extensions: { code: 'FORBIDDEN' }
          });
        }
      }
      
      // Delete the service
      const { error } = await context.supabase
        .from('services')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw new GraphQLError(error.message, {
          extensions: { code: 'DATABASE_ERROR' }
        });
      }
      
      return true;
    },
  }
};

// Apply rate limiting to all resolvers with default settings
export const resolvers = withGraphQLRateLimit(baseResolvers, 'default'); 