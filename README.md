# Fizzed

Fizzed is a Letterboxd-style soda rating app built with Next.js 14, Supabase Auth, Supabase Postgres, and Tailwind CSS.

## Project Structure

- `supabase/schema.sql` - tables, constraints, triggers, indexes, and RLS policies.
- `app/` - Next.js App Router pages and server actions.
- `components/` - reusable UI for navigation, soda cards, reviews, stars, and forms.
- `lib/` - Supabase clients, data access, and catalog helpers.

## Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Copy `.env.example` to `.env.local` and fill in the keys.
4. Run the supporting SQL files for enabled features:

```sql
-- supabase/discussion_schema.sql
-- supabase/ratings_nr_score.sql
-- supabase/random_image_sodas.sql
-- supabase/search_indexes.sql
-- supabase/profile_avatar_backfill.sql
-- supabase/ratings_unique_user_soda.sql
```

5. In Supabase Auth, enable Google OAuth.
6. Import the Soda Wiki catalog:

```bash
npm run seed:fandom
```

7. Run the app:

```bash
npm install
npm run dev
```
