-- Create the orders table
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  item_name text not null,
  quantity integer not null,
  total_price numeric not null,
  delivery_type text not null,
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  user_id uuid references auth.users(id)
);

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
