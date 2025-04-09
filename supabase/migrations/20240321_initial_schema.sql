-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  role text check (role in ('customer', 'provider', 'admin')) default 'customer',
  bio text,
  location text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create services table
create table services (
  id uuid default uuid_generate_v4() primary key,
  provider_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  price decimal(10,2) not null,
  duration integer not null, -- in minutes
  category text not null,
  subcategory text,
  image_url text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create bookings table
create table bookings (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references profiles(id) on delete cascade not null,
  provider_id uuid references profiles(id) on delete cascade not null,
  service_id uuid references services(id) on delete cascade not null,
  status text check (status in ('pending', 'confirmed', 'completed', 'cancelled')) default 'pending',
  date timestamp with time zone not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create reviews table
create table reviews (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references bookings(id) on delete cascade not null,
  customer_id uuid references profiles(id) on delete cascade not null,
  provider_id uuid references profiles(id) on delete cascade not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  cleanliness_rating integer check (cleanliness_rating >= 1 and cleanliness_rating <= 5),
  value_rating integer check (value_rating >= 1 and value_rating <= 5),
  service_rating integer check (service_rating >= 1 and service_rating <= 5),
  comment text,
  provider_response text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create messages table
create table messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references profiles(id) on delete cascade not null,
  receiver_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create products table
create table products (
  id uuid default uuid_generate_v4() primary key,
  provider_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  description text,
  price decimal(10,2) not null,
  image_url text,
  category text not null,
  stock integer not null default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create orders table
create table orders (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references profiles(id) on delete cascade not null,
  provider_id uuid references profiles(id) on delete cascade not null,
  status text check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')) default 'pending',
  total_amount decimal(10,2) not null,
  shipping_address text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create order_items table
create table order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  quantity integer not null,
  price decimal(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create training_programs table
create table training_programs (
  id uuid default uuid_generate_v4() primary key,
  provider_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  price decimal(10,2) not null,
  duration integer not null, -- in minutes
  category text not null,
  image_url text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create certificates table
create table certificates (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  program_id uuid references training_programs(id) on delete cascade not null,
  issue_date timestamp with time zone default timezone('utc'::text, now()) not null,
  expiry_date timestamp with time zone,
  download_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create subscriptions table
create table subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  provider_id uuid references profiles(id) on delete cascade,
  program_id uuid references training_programs(id) on delete cascade,
  status text check (status in ('active', 'cancelled', 'expired')) default 'active',
  start_date timestamp with time zone default timezone('utc'::text, now()) not null,
  end_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create RLS policies
alter table profiles enable row level security;
alter table services enable row level security;
alter table bookings enable row level security;
alter table reviews enable row level security;
alter table messages enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table training_programs enable row level security;
alter table certificates enable row level security;
alter table subscriptions enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Services policies
create policy "Services are viewable by everyone"
  on services for select
  using (true);

create policy "Providers can manage their own services"
  on services for all
  using (auth.uid() = provider_id);

-- Bookings policies
create policy "Users can view their own bookings"
  on bookings for select
  using (auth.uid() = customer_id or auth.uid() = provider_id);

create policy "Users can create bookings"
  on bookings for insert
  with check (auth.uid() = customer_id);

create policy "Providers can update bookings"
  on bookings for update
  using (auth.uid() = provider_id);

-- Reviews policies
create policy "Reviews are viewable by everyone"
  on reviews for select
  using (true);

create policy "Users can create reviews for their bookings"
  on reviews for insert
  with check (auth.uid() = customer_id);

create policy "Providers can respond to reviews"
  on reviews for update
  using (auth.uid() = provider_id);

-- Messages policies
create policy "Users can view their own messages"
  on messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can send messages"
  on messages for insert
  with check (auth.uid() = sender_id);

-- Products policies
create policy "Products are viewable by everyone"
  on products for select
  using (true);

create policy "Providers can manage their own products"
  on products for all
  using (auth.uid() = provider_id);

-- Orders policies
create policy "Users can view their own orders"
  on orders for select
  using (auth.uid() = customer_id or auth.uid() = provider_id);

create policy "Users can create orders"
  on orders for insert
  with check (auth.uid() = customer_id);

-- Training programs policies
create policy "Training programs are viewable by everyone"
  on training_programs for select
  using (true);

create policy "Providers can manage their own training programs"
  on training_programs for all
  using (auth.uid() = provider_id);

-- Certificates policies
create policy "Users can view their own certificates"
  on certificates for select
  using (auth.uid() = user_id);

-- Subscriptions policies
create policy "Users can view their own subscriptions"
  on subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can manage their own subscriptions"
  on subscriptions for all
  using (auth.uid() = user_id);

-- Create functions
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user(); 