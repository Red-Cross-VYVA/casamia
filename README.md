# CasaMia Website

CasaMia is a React, TypeScript and Vite web application for home-safety assessment, package education, grant guidance and customer configuration.

## Local Setup

```bash
npm install
npm run dev
```

Open the local URL shown by Vite, usually `http://127.0.0.1:5173`.

## Main Commands

```bash
npm run build
npm run test
npm run test:configurator
```

`npm run build` runs TypeScript and creates the production bundle.

`npm run test` runs the existing legal launch checks.

`npm run test:configurator` checks the core wizard pricing and conditional logic.

## Customer Configurator

The customer wizard starts at `/configure`.

Supporting routes:

- `/configure/summary`
- `/configure/contact`
- `/configure/checkout`
- `/configure/confirmation`
- `/admin/config-preview`

The homepage CTA card that previously opened grant checking now opens `/configure` and is labelled `Build My Safer Home`. The grant checker remains available at `/grant-check` and through other grant-related entry points.

## Configurator Data

Package definitions, inclusions, conditional items and placeholder pricing live in:

- `src/config/casamiaPackages.ts`
- `src/services/configuratorPricing.ts`
- `src/types/configurator.ts`

The current seed data was built from the implementation brief because `CasaMia_Final_Packages_and_Wizard_Source.xlsx` is not present in the repository.

## Placeholder Values To Confirm

The following values are editable placeholders and need commercial confirmation before live checkout:

- Base package prices
- Staircase module price
- Conditional component prices
- Monthly VYVA, monitoring and GPS support prices
- Visit deposit amount
- VAT handling

## Future Integrations

The configurator currently uses mock adapters so it works without external keys:

- Airtable/Supabase-style submission adapter
- Confirmation email adapter
- Stripe-ready deposit checkout adapter

Replace the mock implementations in `src/services/configuratorAdapters.ts` when production services are selected.

## ElevenLabs Voice

CasaMia includes two separate ElevenLabs integrations:

- a protected, feature-flagged text-to-speech preview at `/internal/voice-studio`
- a live conversational agent in the Home Safety Wizard voice step

Set the following server-only variables in Vercel:

```text
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=...
ELEVENLABS_MODEL_ID=eleven_multilingual_v2
ELEVENLABS_AGENT_ID=...
ELEVENLABS_AGENT_ENVIRONMENT=production
ELEVENLABS_SERVER_LOCATION=us
ELEVENLABS_RATE_LIMIT_SALT=...
```

Then set `VITE_ENABLE_VOICE_ASSISTANT=true` and redeploy to show Voice Studio in the internal navigation.
The feature flag controls only the internal Voice Studio; it does not control the public wizard agent.

The API key and agent ID are never exposed to the browser. The wizard requests a short-lived conversation token from the server after the visitor explicitly starts a voice conversation. That public token endpoint is rate-limited through Supabase, so apply the latest `supabase/schema.sql` before enabling it.

The default `us` location uses a standard ElevenLabs workspace. Use `eu-residency` or `in-residency` only with the matching isolated Enterprise workspace, API key and agent. The server automatically pairs the selected location with the correct ElevenLabs API host.

Same-origin deployments need no CORS setting. If the frontend and API are intentionally hosted on different origins, add the allowed frontend origins to `CASAMIA_ALLOWED_ORIGINS` as a comma-separated server-only variable.

In the ElevenLabs agent dashboard, enable English and Spanish and allow the agent language override. The wizard passes only non-sensitive context such as the wizard reference, site language and user type as dynamic variables.

Preview scripts are limited to 500 characters and the internal preview endpoint requires a valid CasaMia internal session.

## Callback Requests

The Home Safety Wizard can submit a callback request to the server-only
`/api/public/callback-requests` endpoint. Requests are stored in Supabase's
`contact_requests` table; the browser has no local-storage success fallback.

The endpoint accepts only the CasaMia site origins, caps JSON bodies at 16 KB,
validates Spanish phone numbers and callback dates, requires explicit contact
consent, and allows five requests per anonymous IP hash every 30 minutes. Apply
the latest `supabase/schema.sql` before enabling the callback card so the atomic
rate-limit function is available.

An independent rate-limit secret is optional but recommended:

```text
CALLBACK_RATE_LIMIT_SALT=replace-with-long-random-secret
```

Keep this value server-only and do not add a `VITE_` prefix. Same-origin
deployments need no additional CORS setting; intentional split deployments use
the existing `CASAMIA_ALLOWED_ORIGINS` allowlist.
