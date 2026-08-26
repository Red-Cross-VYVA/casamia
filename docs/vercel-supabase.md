# Vercel and Supabase setup

CasaMia is configured to use Vercel for the public website and serverless API routes, with Supabase as the durable database.

## Vercel environment variables

Set these in Vercel Project Settings > Environment Variables:

```text
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_SITE_URL=https://your-production-domain
CASAMIA_INTERNAL_API_KEY=replace-with-a-long-random-api-key
CASAMIA_INTERNAL_PASSWORD=replace-with-the-admin-login-password
CASAMIA_INTERNAL_SESSION_SECRET=replace-with-a-different-long-random-secret
CASAMIA_PARTNER_CREDENTIALS={"partner@example.com":"replace-with-a-unique-partner-password"}
```

Do not expose the Supabase service role key with a `VITE_` prefix. It must remain server-side only.
The `CASAMIA_INTERNAL_*` values and `CASAMIA_PARTNER_CREDENTIALS` are server-only and must never use a `VITE_` prefix.

`CASAMIA_PARTNER_CREDENTIALS` is a JSON object that binds each normalized partner email to its own password. A password for one entry cannot open another partner's workspace. During a single-partner migration only, the existing `CASAMIA_PARTNER_PASSWORD` can be retained when `CASAMIA_PARTNER_EMAIL` explicitly identifies the one email it may authorize. Configure the JSON map before inviting a second partner.

Add the internal values to the Production, Preview, and Development environments in Vercel, then redeploy the site. Environment variable changes do not update an existing deployment until it is redeployed.

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
