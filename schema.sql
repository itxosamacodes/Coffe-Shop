-- Create the orders table
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  item_name text not null,
  quantity integer not null,
  total_price numeric not null,
  delivery_fee numeric default 0,
  delivery_type text not null,
  status text default 'pending' check (status in ('pending', 'approved', 'accepted', 'rejected', 'picked_up', 'delivered', 'completed', 'cancelled')),
  user_id uuid references auth.users(id),
  rider_id uuid references auth.users(id),
  rider_lat numeric,
  rider_lng numeric,
  customer_name text,
  customer_email text,
  customer_phone text,
  delivery_address text,
  customer_lat numeric,
  customer_lng numeric,
  customer_city text
);

-- Create the completed_orders table (archive for finished orders)
create table public.completed_orders (
  id uuid default gen_random_uuid() primary key,
  order_id uuid,
  rider_id uuid references auth.users(id),
  user_id uuid references auth.users(id),
  item_name text not null,
  total_price numeric not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create the rider_stats table
create table public.rider_stats (
  rider_id uuid references auth.users(id) primary key,
  total_earnings numeric default 0,
  total_deliveries integer default 0,
  last_updated timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.completed_orders enable row level security;
alter table public.rider_stats enable row level security;

-- Policies for completed_orders
create policy "Users can view their own completed orders" on public.completed_orders for select using (auth.uid() = user_id or auth.uid() = rider_id);
create policy "Allow insert for system/demo" on public.completed_orders for insert with check (true);

-- Policies for rider_stats
create policy "Riders can view their own stats" on public.rider_stats for select using (auth.uid() = rider_id);
create policy "Allow update for system/demo" on public.rider_stats for update using (true);
create policy "Allow insert for on-boarding" on public.rider_stats for insert with check (true);

-- Enable Row Level Security (RLS)
alter table public.orders enable row level security;

-- Create policies
-- Allow public insert (for unauthenticated users in this demo)
create policy "Enable insert for all users"
on public.orders
for insert
to public
with check (true);

-- Allow public read access (for admin dashboard and users)
create policy "Enable read access for all users"
on public.orders
for select
to public
using (true);

-- Allow public update access (for admin dashboard to accept/reject)
create policy "Enable update for all users"
on public.orders
for update
to public
using (true);

-- Create the riders table
create table public.riders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id),
  full_name text not null,
  email text not null,
  phone text,
  vehicle_type text,
  vehicle_number text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  current_location text
);

-- Enable RLS for riders
alter table public.riders enable row level security;

-- Rider Policies
create policy "Riders can view their own data" on public.riders
  for select using (auth.uid() = user_id);

create policy "Enable insert for all users (onboarding)" on public.riders
  for insert with check (true);

create policy "Enable public read for demo (or restricted to admin)" on public.riders
  for select using (true);

create policy "Enable update for all users (demo purposes)" on public.riders
  for update using (true);

-- Create the coffee_lovers table
create table public.coffee_lovers (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id),
  full_name text not null,
  email text not null,
  profile_pic text,
  role text default 'customer' check (role in ('customer', 'admin'))
);

-- Enable RLS for coffee_lovers
alter table public.coffee_lovers enable row level security;

-- Coffee Lover Policies
create policy "Users can view their own profile" on public.coffee_lovers
  for select using (auth.uid() = user_id);

create policy "Enable insert for all users (onboarding)" on public.coffee_lovers
  for insert with check (true);

create policy "Enable update for users" on public.coffee_lovers
  for update using (auth.uid() = user_id);
