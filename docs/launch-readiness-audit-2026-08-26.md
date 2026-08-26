# CasaMia Launch Readiness Audit

Date: 2026-08-26  
Production: https://www.casamia.com.es  
Audited commits: `d549e1a`, `6b0bce7`, `5b4a909`, `0f09dc3`, `6409950`, `2a759ff`
Final verified application deployment: `dpl_ELMLJU9CUDe5r1V1nyj9oCrbHgrr`

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
- Final production smoke tests pass against `https://www.casamia.com.es`, including all 62 sitemap routes and optimized image delivery checks.
- Final production Lighthouse audits have 100 accessibility, best-practices and SEO scores, zero console errors, and CLS between 0.00 and 0.03 on home, plans and the home-safety assessment.
- Repeat Lighthouse performance scores were 58 and 71 for home, 67 for plans and 71 for the home-safety assessment. These are useful synthetic baselines; real-user Core Web Vitals should be monitored after launch.
- The largest gallery, grants and before/after source images were converted to WebP. Representative files fell from roughly 2-15 MB each to roughly 9-192 KB each.
- The ElevenLabs specialist-agent setup now has a versioned knowledge base covering reports, visits, pricing, ordering, installation, connected safety, grants, privacy, complaints and escalation.
- The AEAT CIF document confirms the legal name, NIF and Marbella address used by the site. Official BORME records confirm the Málaga Mercantile Registry details now shown in the legal notice.
- The legal production validator now passes with the verified company identity, registry details, published customer-service telephone, email, address and Spanish contract locale.

## Defects Fixed During Audit

- Public contact, provider, order and withdrawal endpoints accepted empty records.
- Withdrawal UI could show a receipt after a backend failure.
- Browser-language switching raced React hydration.
- Prerendered markup was replaced before hydration, causing React error 421 and layout shift.
- A gallery image depended on an external host that blocked embedding.
- Oversized PNG/JPEG assets caused unnecessary multi-megabyte downloads on public pages.
- Edge middleware environment typing emitted a non-fatal Vercel build diagnostic.
- The legal notice omitted the company's Mercantile Registry details and customer-service telephone.
- Minor React dependency, key and dead-code warnings were removed.
- README catalogue ownership was updated to identify the admin catalogue as the live source of truth.

## External And Manual Gates

- **ElevenLabs:** current production API key is missing `convai_write`; live token creation returns HTTP 502 until that permission is enabled and the deployment is retested.
- **Stripe:** confirm live-mode key, inclusive 21% tax-rate ID and production webhook secret in Stripe, then complete one controlled EUR 99 payment, webhook, scheduling, calendar, email and refund rehearsal.
- **Access:** sign in once with the production admin password and once with the partner password; confirm the partner sees only records assigned to that partner email.
- **Email:** confirm one real English and one real Spanish customer journey using a company-controlled address, including customer and operations copies.
- **Governance:** record legal/tax approval and assign payments, customer support, scheduling, refund and incident owners in `docs/operations-checklist.md`.
- **Audit data:** remove the four blank records created while reproducing the now-fixed validation defect.
- **Monitoring:** review Vercel Speed Insights after real traffic is available. The current runtime error scan found no application 500s; it only found Node's `url.parse()` deprecation warning on deliberate invalid-request smoke tests that correctly returned 404.

## Repeatable Checks

```powershell
npm test
npm run lint
npm run build
npm run test:production
```

`test:production` is safe to rerun. Its POST requests are intentionally invalid and must return HTTP 400 before any database record or email is created.
