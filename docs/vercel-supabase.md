# Vercel and Supabase setup

CasaMia is configured to use Vercel for the public website and serverless API routes, with Supabase as the durable database.

## Vercel environment variables

Set these in Vercel Project Settings > Environment Variables:

```text
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_SITE_URL=https://your-production-domain
VITE_INTERNAL_API_KEY=your-internal-api-key
```

Do not expose the Supabase service role key with a `VITE_` prefix. It must remain server-side only.

## Supabase schema

Run `supabase/schema.sql` in the Supabase SQL editor. The Vercel API routes insert into:

- `assessment_requests`
- `contact_requests`
- `provider_applications`
- `orders`
- `consent_evidence`
- `withdrawal_requests`

RLS is enabled on the tables. The Vercel API uses the server-side service role key, so public browser clients do not need direct table access.

## Frontend API routing

On Vercel, the browser uses same-origin API routes by default:

- `/api/public/assessment-requests`
- `/api/public/contact-requests`
- `/api/public/provider-applications`
- `/api/public/orders`
- `/api/consent-evidence`
- `/api/withdrawal-requests`

Local development continues to use browser fallback storage unless you explicitly set API override variables in `.env.local`.
