This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Supabase Daily Workflow Commands
```bash
# Start local Supabase
npx supabase start

# Stop local Supabase  
npx supabase stop

# Create new migration
npx supabase migration new migration_name

# Reset local DB (runs all migrations fresh)
npx supabase db reset

# Generate types after schema changes
npx supabase gen types typescript --local > lib/database.types.ts

# Push migrations to production
npx supabase db push

# Open local Studio dashboard
http://localhost:54323
```