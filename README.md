# Fizzed

Fizzed is a Letterboxd-style soda rating app built with Next.js 14, Supabase Auth, Supabase Postgres, and Tailwind CSS.

## Project Structure

- `supabase/schema.sql` - tables, constraints, triggers, indexes, and RLS policies.
- `app/` - Next.js App Router pages and server actions.
- `components/` - reusable UI for navigation, soda cards, reviews, stars, and forms.
- `lib/` - Supabase clients, data access, and Open Food Facts seed importer.

## Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Copy `.env.example` to `.env.local` and fill in the keys.
4. In Supabase Auth, enable email auth and Google OAuth.
5. Run the app:

```bash
npm install
npm run dev
```

On first server render, Fizzed checks the `sodas` table. If it has fewer than 5,000 rows and `SUPABASE_SERVICE_ROLE_KEY` is present, it imports real soda products from Open Food Facts.
