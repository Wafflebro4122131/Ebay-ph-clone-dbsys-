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
## GitHub and deployment

This project is initialized as a Git repository in `C:\Users\User\source\ebay-ph-clone`.

To publish to GitHub:

- `git remote add origin https://github.com/<your-username>/<repo-name>.git`
- `git push -u origin master`

To deploy the frontend:

- Build with `cd frontend && npm run build`
- Host the static `frontend/dist` folder on Vercel, Netlify, or any static host

To deploy the backend:

- Host the Express API on a Node-capable platform such as Render, Railway, or Heroku
- Ensure `DATABASE_URL`, `SUPABASE_URL`, and `SUPABASE_ANON_KEY` are configured in the environment

If you want a single hosted experience, deploy frontend and backend separately and point the frontend API calls to the backend URL.
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
