# CasaMia Launch Readiness Audit

Date: 2026-08-26  
Production: https://www.casamia.com.es  
Audited commits: `d549e1a`, `6b0bce7`

## Verified

- Complete repository test suite passes.
- TypeScript and production builds pass.
- Production prerenders 62 public sitemap routes and 18 protected application shells.
- All 62 production sitemap routes return HTTP 200.
- Mobile and desktop browser checks pass at 390 x 844 and 1440 x 900.
- Representative public, legal, admin-login and partner-login pages have no overflow, broken images, failed requests, console errors or hydration errors.
- The free safety-report deep link and homepage report CTA open the correct report dialog.
- Production catalogue contains 20 packages, 67 outcomes, 123 capabilities, 101 products and 61 installation tasks.
- VAT-inclusive core prices are Bathroom EUR 749, Bedroom EUR 649, Kitchen EUR 699, Living room EUR 556.60 and Entrance EUR 749.
- Visit fee is EUR 99 including 21% VAT; proposal payment is 50%; installation schedule is EUR 100 / 170 / 150 for one / two / three core packages.
- Internal, partner and cron APIs reject unauthenticated calls; Stripe webhook rejects GET.
- Empty contact, provider, order, withdrawal, callback, assessment, proposal and visit submissions are rejected before persistence.
- Production security headers include HSTS, `nosniff`, `SAMEORIGIN` and strict-origin referrer policy.
- Latest Vercel deployment is Ready and aliased to the production domain.

## Defects Fixed During Audit

- Public contact, provider, order and withdrawal endpoints accepted empty records.
- Withdrawal UI could show a receipt after a backend failure.
- Browser-language switching raced React hydration.
- A gallery image depended on an external host that blocked embedding.
- Minor React dependency, key and dead-code warnings were removed.
- README catalogue ownership was updated to identify the admin catalogue as the live source of truth.

## External And Manual Gates

- **ElevenLabs:** current production API key is missing `convai_write`; live token creation returns HTTP 502 until that permission is enabled and the deployment is retested.
- **Stripe:** confirm live-mode key, inclusive 21% tax-rate ID and production webhook secret in Stripe, then complete one controlled EUR 99 payment, webhook, scheduling, calendar, email and refund rehearsal.
- **Access:** sign in once with the production admin password and once with the partner password; confirm the partner sees only records assigned to that partner email.
- **Email:** confirm one real English and one real Spanish customer journey using a company-controlled address, including customer and operations copies.
- **Governance:** record legal/tax approval and assign payments, customer support, scheduling, refund and incident owners in `docs/operations-checklist.md`.
- **Audit data:** remove the four blank records created while reproducing the now-fixed validation defect.

## Repeatable Checks

```powershell
npm test
npm run lint
npm run build
npm run test:production
```

`test:production` is safe to rerun. Its POST requests are intentionally invalid and must return HTTP 400 before any database record or email is created.
