---
name: supabase-auth
description: Authentication setup and patterns for this project using Supabase Auth with Next.js
---

# Supabase Auth

## Setup
- Use @supabase/ssr for Next.js App Router
- Never use @supabase/auth-helpers (deprecated)

## Client Creation
Always use these two clients:

### Server Component / Route Handler
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabase = createServerClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
  { cookies: { getAll: () => cookieStore.getAll() } }
)
```

### Client Component
```typescript
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

## Middleware
Always protect routes via middleware.ts in project root.
Protected routes: /dashboard/*, /stundenplan/*, /noten/*
Public routes: /, /login, /auth/callback

## Auth Flow
1. User lands on /login
2. Supabase Auth handles email/password
3. Redirect to /auth/callback
4. Callback exchanges code for session
5. Redirect to /dashboard

## Rules
- Never expose SUPABASE_SERVICE_ROLE_KEY on client side
- Always use NEXT_PUBLIC_ prefix for client-side env vars
- Always check session server-side before rendering protected pages
- Use middleware for route protection, not client-side redirects