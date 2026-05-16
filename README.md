# eBay PH Clone

A lightweight marketplace clone with React frontend and Express backend, using Supabase as the database.

## Project structure

- `backend/`: Express API server, Supabase database connection, product/user routes.
- `frontend/`: React/Vite app that fetches product listings from the backend.

## Setup

1. Copy env examples:
   - `backend/.env.example` → `backend/.env`
   - `frontend/.env.example` → `frontend/.env`

2. In `backend/.env`, set:
   - `SUPABASE_URL` to your Supabase project URL
   - `SUPABASE_ANON_KEY` to your Supabase anon key
   - `FRONTEND_URL` to `http://localhost:5173`

3. Install dependencies:
   - `cd backend && npm install`
   - `cd frontend && npm install`

4. Prepare Supabase migrations:
   - add `DATABASE_URL` to `backend/.env`
   - run `cd backend && npm run migrate`

5. Run the backend and frontend:
   - `cd backend && npm run dev`
   - `cd frontend && npm run dev`

## Supabase migration

A migration file is included at `supabase/migrations/000001_init_tables.sql`.
Use it to create the core database schema in your Supabase project.

If you have the Supabase CLI installed, you can also manage migrations from the root project folder:

- `supabase db reset`
- `supabase db push`
- `supabase db diff`

## Supabase tables

Create the following tables in your Supabase project.

### products
- `id` (uuid, primary key, default `gen_random_uuid()`)
- `title` (text)
- `description` (text)
- `price` (numeric)
- `image_url` (text)
- `category` (text)
- `seller_id` (text)
- `created_at` (timestamp with time zone, default `now()`)

### users
- `id` (uuid, primary key, default `gen_random_uuid()`)
- `email` (text)
- `display_name` (text)

## Notes

- The frontend fetches product data from the backend API.
- The backend uses Supabase JS to query the Supabase database.
- Do not commit `backend/.env` or `frontend/.env` to source control.
