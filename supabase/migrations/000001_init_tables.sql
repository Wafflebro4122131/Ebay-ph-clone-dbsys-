-- Supabase migration: create core tables for eBay PH clone

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  display_name text,
  created_at timestamp with time zone default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price numeric not null default 0,
  image_url text,
  category text,
  seller_id uuid references public.users(id) on delete set null,
  created_at timestamp with time zone default now()
);

alter table if exists public.products
  add constraint products_price_nonnegative check (price >= 0);
