# Supabase Setup Guide

This guide explains how to set up Supabase for the Honey Money application.

## Prerequisites

1. Create a Supabase account at https://supabase.com
2. Create a new project

## Environment Variables

Add these environment variables to your `.env` file:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your Supabase project settings:
- `SUPABASE_URL`: Project Settings > API > Project URL
- `SUPABASE_ANON_KEY`: Project Settings > API > Project API keys > anon public

## Database Setup

1. Go to the SQL Editor in your Supabase dashboard
2. Run the migration file located in `supadse/migrations/001_initial_schema.sql`

This will create:
- `months` table - stores monthlybudgetsheets
- `expenses` table - stores individual expenses
- `pay` table - stores payment information
- `expense_templates` table - stores expense templates

## Authentication (Optional)

The application includes auth helpers in `src/auth/index.ts`. To enable authentication:

1. Enable Email/Password authentication in your Supabase dashboard
2. Configure Row Level Security (RLS) policies as needed
3. Update the auth policies in the migration file to restrict data by user

## Local Development

1. Copy `.env.example` to `.env` (create this file if it doesn't exist)
2. Add your Supabase credentials
3. Run `bun run dev`

## Deployment

When deploying to Vercel or other platforms:

1. Add the environment variables to your deployment platform
2. Ensure the Supabase project is properly configured
3. Run the migration SQL in your production Supabase instance

## Data Migration from SQLite

If you're migrating from the previous SQLite/libsql version:

1. Export your existing data from SQLite
2. Run the new Supabase migrations
3. Import the exported data into Supabase tables

## Troubleshooting

### Connection Issues
- Verify your `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Check that your IP is whitelisted (Supabase Dashboard > Settings > API)

### Authentication Errors
- Ensure Row Level Security policies are correctly configured
- Check that anon key has necessary permissions

### Query Errors
- Supabase uses PostgreSQL, which has slightly different syntax than SQLite
- All queries now use the Supabase client query builder
- Parameterized queries use named parameters instead of `?`