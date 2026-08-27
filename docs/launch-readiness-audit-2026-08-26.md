# CasaMia Launch Readiness Audit

Date: 2026-08-26  
Last updated: 2026-08-27  
Production: https://www.casamia.com.es  
Production commit verified: `c97c032`
Production deployment verified: `dpl_HfboPuim1Pm8rLAfnBBXUHWqnprP`

Current launch decision: **NO-GO for accepting live payments**. The application is technically healthy, but the Stripe live-mode rehearsal, partner credential binding, ElevenLabs permission, bilingual email rehearsal and human legal/operations approvals remain open.

Important deployment note: the current production deployment predates the audited public-write validation changes. A fresh production smoke run on 26 August 2026 confirmed that the old `/api/consent-evidence` handler accepts an empty request. The resulting blank `consent_evidence` row was deleted with an exact-id, all-fields-blank guard after the approved database migrations were applied. Do not rerun the production smoke suite until the audited build is deployed and `/deployment-readiness.json` is available; the old deployment still returns HTTP 404 for that marker.

## Verified

- Complete repository test suite passes.
- TypeScript and production builds pass.
- The complete automated gate was rerun on 27 August 2026 against the current audited commit: all application tests, the production build, legal validation, 62-route prerender verification and the production dependency audit passed. Lint reported warnings only, including pre-existing Fast Refresh warnings and one warning in the untracked local `.codex_tmp` workspace.
- Production prerenders 62 public sitemap routes and 19 protected application shells.
- All 62 production sitemap routes return HTTP 200.
- Mobile and desktop browser checks pass at 390 x 844 and 1440 x 900.
- Representative public, legal, admin-login and partner-login pages have no overflow, broken images, failed requests, console errors or hydration errors.
- The free safety-report deep link and homepage report CTA open the correct report dialog.
- Production catalogue contains 20 packages, 67 outcomes, 123 capabilities, 101 products and 61 installation tasks.
- VAT-inclusive core prices are Bathroom EUR 749, Bedroom EUR 649, Kitchen EUR 699, Living room EUR 556.60 and Entrance EUR 749.
- Visit fee is EUR 99 including 21% VAT; proposal payment is 50%; installation schedule is EUR 100 / 170 / 150 for one / two / three core packages.
- Internal, partner and cron APIs reject unauthenticated calls; Stripe webhook rejects GET.
- Automated endpoint inventory now classifies and exercises all 21 protected endpoints and all 31 public/webhook endpoints, and fails when a new endpoint is not explicitly covered.
- Empty contact, provider, order, withdrawal, callback, assessment, proposal and visit submissions are rejected before persistence.
- Consent evidence now requires a trusted CasaMia origin, valid legal metadata and a bounded payload before persistence.
- Production security headers include HSTS, `nosniff`, `SAMEORIGIN` and strict-origin referrer policy.
- React Router is upgraded to supported v7.18.2, and `npm audit --omit=dev` reports zero vulnerabilities.
- Repository secret scanning found no committed live keys, access tokens or private keys, and the environment template now covers the server-only partner, Stripe, Meta and media settings used by production.
- The canonical Supabase schema and existing-project migration define all wizard media buckets as private, including audio, and prune anonymous media rate-limit hashes after two days.
- Public proposal bearer links now use an allowlisted customer projection and do not return internal event, delivery or notes metadata.
- Public agreement bearer links no longer return internal audit actors, assignment operators, partner IDs or share-token metadata.
- Safety and grant report creation uses a persistent Supabase reservation instead of process-local throttling, with scoped HMAC identifiers retained for no more than two days.
- Proposal, assessment, contact, complaint, provider, order, consent and withdrawal writes use trusted-origin checks and scoped persistent request limits.
- OpenAI-backed room classification, safety analysis and grant research use persistent usage limits; completed grant research is reused instead of regenerated.
- `CASAMIA_PUBLIC_WRITE_RATE_LIMIT_SALT` is configured as a hidden Vercel secret for Production and Preview.
- Latest Vercel deployment is Ready and aliased to the production domain.
- Final production smoke tests pass against `https://www.casamia.com.es`, including all 62 sitemap routes and optimized image delivery checks.
- Final production Lighthouse audits have 100 accessibility, best-practices and SEO scores, zero console errors, and CLS between 0.00 and 0.03 on home, plans and the home-safety assessment.
- Repeat Lighthouse performance scores were 58 and 71 for home, 67 for plans and 71 for the home-safety assessment. These are useful synthetic baselines; real-user Core Web Vitals should be monitored after launch.
- The largest gallery, grants and before/after source images were converted to WebP. Representative files fell from roughly 2-15 MB each to roughly 9-192 KB each.
- The ElevenLabs specialist-agent setup now has a versioned knowledge base covering reports, visits, pricing, ordering, installation, connected safety, grants, privacy, complaints and escalation.
- The AEAT CIF document confirms the legal name, NIF and Marbella address used by the site. Official BORME records confirm the Málaga Mercantile Registry details now shown in the legal notice.
- The legal production validator now passes with the verified company identity, registry details, published customer-service telephone, email, address and Spanish contract locale.
- The protected Data Quality view identifies only legacy records whose customer and operational fields are all empty. Its API revalidates the record immediately before deletion and refuses any populated record.
- All 14 authenticated operations screens load in production with their expected headings and without a login redirect, 404 or visible load failure.
- Production contains the required named Stripe, Resend, Supabase, admin, Meta, ElevenLabs and cron environment variables. Partner access is intentionally not deployment-ready: `CASAMIA_PARTNER_PASSWORD` exists, but it is not yet bound to a partner identity through `CASAMIA_PARTNER_EMAIL` or replaced by `CASAMIA_PARTNER_CREDENTIALS`.
- The four legacy records confirmed to contain no customer or operational information were deleted through the protected Data Quality workflow. All four server-side deletions returned HTTP 200.
- Production smoke tests now require `/deployment-readiness.json` before exercising any write path, so an outdated deployment is rejected without creating database records.
- The production Supabase project `cujrvvxpcmxxuvzwwdmx` received the media-storage, persistent public-rate-limit and Security Advisor migrations on 26 August 2026. Read-only verification confirmed all three wizard buckets are private, both reservation functions are restricted to the service role, the public request-limit table has RLS enabled and the Security Advisor reports zero errors and zero warnings.
- The single blank consent-evidence row created by the legacy-deployment smoke check was deleted with an exact id and an all-fields-blank guard. Post-migration verification confirmed it no longer exists.
- The agreement-management migration was applied on 27 August 2026. Production now has the empty `agreement_assignments` and `agreement_audit_events` tables with all 28 expected columns, four required secondary indexes, RLS enabled and no public policies. The post-migration Security Advisor reports zero errors and zero warnings.
- The production WhatsApp CTA resolves to the configured CasaMia number `+34 648 027 076` with a prefilled message.
- The Facebook operations screen reports Page `61574255177723`, Graph API `v26.0` and a configured page access token. A controlled public post remains required to prove the token can publish.
- The public Facebook Page resolves to CasaMia and displays the expected bio, Marbella address, telephone, email, website, WhatsApp route, profile imagery and an existing welcome post. This proves the public Page configuration, but not publishing through the CasaMia API integration.
- The current production deployment is `Ready`, all 62 sitemap routes pass the production smoke test, and the production runtime scan found no application HTTP 5xx responses before the deliberate ElevenLabs check below.

## Defects Fixed During Audit

- Public contact, provider, order and withdrawal endpoints accepted empty records.
- Assessment intake trusted client-supplied operational status/type values and relied on the database to reject blank records.
- Consent evidence accepted empty, malformed or oversized records from arbitrary origins.
- Public intake endpoints lacked consistent field and payload bounds, and proposal drafts accepted malformed email addresses.
- Withdrawal UI could show a receipt after a backend failure.
- Browser-language switching raced React hydration.
- Prerendered markup was replaced before hydration, causing React error 421 and layout shift.
- A gallery image depended on an external host that blocked embedding.
- Oversized PNG/JPEG assets caused unnecessary multi-megabyte downloads on public pages.
- Edge middleware environment typing emitted a non-fatal Vercel build diagnostic.
- The legal notice omitted the company's Mercantile Registry details and customer-service telephone.
- Minor React dependency, key and dead-code warnings were removed.
- React Router v6 was replaced with v7, including the supported server-rendering import and v7 router defaults.
- README catalogue ownership was updated to identify the admin catalogue as the live source of truth.

## External And Manual Gates

- **ElevenLabs:** retested on 27 August 2026 at 09:36 Europe/Madrid. Live token creation returned HTTP 502 and the production log again reported that the API key is missing `convai_write`.
- **Stripe:** retested on 27 August 2026. The connected dashboard is still `Entorno de prueba de CasaMia`, explicitly reports Sandbox mode, exposes only `sk_test_...` / `pk_test_...` keys and shows business verification as `Not Started`. Live payment acceptance is therefore not approved. Complete Stripe business verification, activate live mode, configure a live secret key, inclusive 21% live tax-rate ID and production webhook secret, then complete one controlled EUR 99 payment, webhook, scheduling, calendar, email and refund rehearsal.
- **Access:** the current production API rejects unauthenticated partner calls, and production has no partner assignments yet. Per-partner credential binding and cross-partner rejection are implemented and tested locally but must not deploy until `CASAMIA_PARTNER_CREDENTIALS` or the single-partner migration variables are configured. Then sign in as two partner identities and confirm each sees only its assigned records.
- **Email:** confirm one real English and one real Spanish customer journey using a company-controlled address, including customer and operations copies.
- **Facebook:** publish one approved starter post and confirm it appears on Page `61574255177723`; publishing is a public side effect and was not performed during the read-only audit.
- **Governance:** record legal/tax approval and assign payments, customer support, scheduling, refund and incident owners in `docs/operations-checklist.md`.
- **Monitoring:** review Vercel Speed Insights after real traffic is available. The current runtime error scan found no application 500s; it only found Node's `url.parse()` deprecation warning on deliberate invalid-request smoke tests that correctly returned 404.

## Repeatable Checks

```powershell
npm test
npm run lint
npm run build
npm run test:production
```

`test:production` is safe to rerun only after the audited public-write validation commits are deployed. Its POST requests are intentionally invalid and must return HTTP 400 before any database record or email is created. Do not rerun it against deployment `dpl_HfboPuim1Pm8rLAfnBBXUHWqnprP`, whose legacy consent handler accepts the empty request.
