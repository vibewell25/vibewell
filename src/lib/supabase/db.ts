import { supabase } from './config';
import { Database } from './types';

type Tables = Database['public']['Tables'];
type TableName = keyof Tables;

export async function insert<T extends TableName>(
  table: T,
  data: Tables[T]['Insert']
) {
  const { data: result, error } = await supabase
    .from(table)
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function update<T extends TableName>(
  table: T,
  id: string,
  data: Tables[T]['Update']
) {
  const { data: result, error } = await supabase
    .from(table)
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function remove<T extends TableName>(
  table: T,
  id: string
) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function findById<T extends TableName>(
  table: T,
  id: string
) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function findAll<T extends TableName>(
  table: T,
  query?: {
    column?: string;
    value?: any;
    orderBy?: string;
    ascending?: boolean;
  }
) {
  let queryBuilder = supabase.from(table).select('*');

  if (query?.column && query?.value) {
    queryBuilder = queryBuilder.eq(query.column, query.value);
  }

  if (query?.orderBy) {
    queryBuilder = queryBuilder.order(query.orderBy, {
      ascending: query.ascending ?? true,
    });
  }

  const { data, error } = await queryBuilder;

  if (error) throw error;
  return data;
}

// Profile specific functions
export async function getProfile(userId: string) {
  return findById('profiles', userId);
}

export async function updateProfile(userId: string, data: Tables['profiles']['Update']) {
  return update('profiles', userId, data);
}

// Service specific functions
export async function getProviderServices(providerId: string) {
  return findAll('services', { column: 'provider_id', value: providerId });
}

export async function getActiveServices() {
  return findAll('services', { column: 'is_active', value: true });
}

// Booking specific functions
export async function getCustomerBookings(customerId: string) {
  return findAll('bookings', { 
    column: 'customer_id', 
    value: customerId,
    orderBy: 'start_time',
    ascending: false
  });
}

export async function getProviderBookings(providerId: string) {
  return findAll('bookings', { 
    column: 'provider_id', 
    value: providerId,
    orderBy: 'start_time',
    ascending: false
  });
}

// Review specific functions
export async function getServiceReviews(serviceId: string) {
  return findAll('reviews', { 
    column: 'service_id', 
    value: serviceId,
    orderBy: 'created_at',
    ascending: false
  });
}

export async function getProviderReviews(providerId: string) {
  return findAll('reviews', { 
    column: 'provider_id', 
    value: providerId,
    orderBy: 'created_at',
    ascending: false
  });
} 