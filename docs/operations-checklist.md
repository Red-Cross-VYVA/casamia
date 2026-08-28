# CasaMia Operations Checklist

Version: 1.0  
Scope: Production launch, payments, appointments, customer communications and ongoing operations  
Primary timezone: Europe/Madrid

## How to Use This Checklist

- Assign a named owner and backup owner for payments, visits, customer support and technical incidents.
- Store launch evidence in the approved company operations folder. Evidence should include timestamps and references, never secret keys or full customer payment details.
- Complete every launch gate before accepting real customer payments.
- Re-run the relevant flow after any change to Stripe, Vercel, Supabase, Resend, appointment availability, legal wording or Meta configuration.

## Known Operating Rules

- The home safety visit costs EUR 99 total, including 21% VAT, and is paid in advance.
- A visit is not paid until a verified Stripe webhook records `Visit paid`.
- A paid customer chooses an available date and time before the status becomes `Visit Scheduled`.
- Customer self-service changes are blocked within 24 hours of the appointment.
- Cancelling an appointment does not automatically issue a Stripe refund.
- Proposal payments are payments on account. They must not be described operationally as automatically non-refundable deposits.
- Automatic visit reminders run daily at 08:15 UTC and target visits approximately 18 to 42 hours away.
- WhatsApp and Facebook delivery depend on Meta approval. A Meta failure must not stop proposal creation or the core customer flow.
- Stripe, Resend, Supabase and Meta secrets are server-only and must never use a `VITE_` prefix.

## 1. Ownership and Escalation

- [ ] Payments owner assigned.
- [ ] Customer support and complaints owner assigned.
- [ ] Visit scheduling owner assigned.
- [ ] Installer or assessor coordination owner assigned.
- [ ] Technical incident owner assigned.
- [ ] Backup owner assigned for every operational role.
- [ ] Stripe, Vercel, Supabase, Resend and Meta account access confirmed for the appropriate owners.
- [ ] Two-factor authentication enabled for privileged accounts.
- [ ] Internal access removal process agreed for departing staff and partners.
- [ ] Emergency contact route agreed for payment, privacy and safety incidents.

## 2. Legal and Commercial Launch Gate

- [ ] Spanish legal notice approved by Spanish counsel.
- [ ] Privacy policy and data-processing wording approved.
- [ ] General customer terms approved.
- [ ] Withdrawal and cancellation wording approved.
- [ ] Complaints and aftercare wording approved.
- [ ] Proposal and customer agreement templates approved.
- [ ] Provider and partner agreements approved before issue.
- [ ] EUR 99 visit price and inclusive 21% VAT treatment confirmed with the accountant.
- [ ] Proposal payment schedule, cancellation rules and refund authority documented.
- [ ] Invoice issuer details match MOKA DIGITECK, S.L. legal and tax records.
- [ ] Public legal pages show the approved company identity and contact details.
- [ ] Legal document versions and approval dates recorded.

## 3. Production Infrastructure Gate

- [x] Latest production deployment is `Ready` in Vercel.
- [x] `https://www.casamia.com.es` resolves to the intended production deployment.
- [x] Production environment variables are present in Vercel and scoped to Production.
- [ ] No test secret is mixed with a live Stripe tax rate or webhook secret.
- [x] Latest Supabase schema has been applied to production.
- [x] Wizard-media privacy and persistent public-request rate-limit migrations have been applied and verified.
- [x] Supabase Security Advisor reports no exposed `SECURITY DEFINER` function warnings.
- [x] Blank consent-evidence row created by the 26 August legacy-deployment smoke check has been identified and deleted.
- [x] Agreement assignment and audit tables have been created with RLS using `supabase/agreement-management.sql`.
- [x] Internal admin login works with the admin password.
- [x] `CASAMIA_PARTNER_CREDENTIALS`, or the single-partner email/password pair, binds every currently invited partner email to a unique password.
- [x] Partner login works with each currently invited partner's separate password.
- [ ] Cross-partner password and email combinations are rejected.
- [x] Partner users can see only their assigned data.
- [x] Database and API health checks return successfully.
- [ ] Cron jobs are visible in Vercel for lead reminders and visit reminders.
- [x] Production logs can be accessed by the technical owner.
- [x] CasaMia Facebook Page is owned by the Casamia business portfolio and the restricted `CasaMia Publisher` system user can publish Page content through the production API.
- [x] Every Facebook campaign is prepared and published as an English and Spanish pair, with matching tracked destination links.
- [ ] Assign a Meta token-rotation owner and replace the 60-day publishing token before 27 October 2026.

## 4. Stripe Live Configuration

- [ ] Stripe business identity, bank account and payout details are verified.
- [ ] Live mode is selected before copying live credentials.
- [ ] `STRIPE_SECRET_KEY` uses the live secret key.
- [ ] An active inclusive 21% VAT tax rate exists in live mode.
- [ ] `STRIPE_VISIT_TAX_RATE_ID` references that live VAT rate.
- [ ] `STRIPE_WEBHOOK_SECRET` belongs to the production webhook endpoint.
- [ ] Production webhook endpoint is `https://www.casamia.com.es/api/webhooks/stripe`.
- [ ] Webhook subscribes to `checkout.session.completed`.
- [ ] Webhook subscribes to `checkout.session.async_payment_succeeded`.
- [ ] Webhook subscribes to `checkout.session.async_payment_failed`.
- [ ] Webhook subscribes to `checkout.session.expired`.
- [ ] Successful-payment email receipts are enabled in Stripe.
- [ ] Stripe statement descriptor and customer support details are correct.
- [ ] Stripe fraud and dispute notifications reach the payments owner.
- [ ] Payout schedule and bank reconciliation routine are agreed.
- [ ] Refund authority and approval threshold are agreed.

## 5. Email and Customer Communication Gate

- [ ] Resend sending domain is verified.
- [ ] `RESEND_API_KEY` is configured in Production.
- [ ] `CASAMIA_EMAIL_FROM` uses the verified CasaMia domain.
- [ ] `CASAMIA_REPLY_TO_EMAIL` reaches a monitored inbox.
- [ ] `CASAMIA_LEADS_EMAIL` reaches the operations inbox.
- [ ] English and Spanish customer confirmations render correctly on desktop and mobile.
- [ ] Callback, assessment, quote, booking, contact, provider and complaint forms send the correct confirmations.
- [ ] Customer emails include company identity, contact details, privacy links and the submitted-information recap.
- [ ] Payment, appointment, reschedule, cancellation and reminder emails contain working links.
- [ ] Failed deliveries are visible to the operations team and have a manual follow-up route.
- [ ] WhatsApp templates are approved before WhatsApp is presented as an active delivery channel.
- [x] WhatsApp Cloud API sender, signed webhook and delivery-status persistence are implemented with graceful fallback.
- [ ] Production has `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_APP_SECRET` and `WHATSAPP_WEBHOOK_VERIFY_TOKEN`.
- [ ] English and Spanish proposal/report utility templates are approved and their names are configured in Production.
- [ ] Meta webhook `/api/webhooks/whatsapp` is verified and subscribed to message status updates.
- [ ] A real English and Spanish WhatsApp delivery reaches the test phone before `VITE_CASAMIA_WHATSAPP_DELIVERY_ENABLED=true` is enabled.

## 6. Visit Availability and Calendar Gate

- [ ] Available visit dates and times have been reviewed in `/internal/visits`.
- [ ] Availability reflects assessor capacity and travel coverage.
- [ ] No unavailable dates or duplicate slots are offered.
- [ ] Europe/Madrid daylight-saving behavior has been checked.
- [ ] Customer Google Calendar link opens with the correct local time.
- [ ] Customer Outlook link opens with the correct local time.
- [ ] Downloaded ICS file contains the correct date, time and CasaMia details.
- [ ] Operations can reschedule an appointment in `/internal/visits`.
- [ ] Operations can cancel an appointment and understands that refunding is separate.
- [ ] Manual reminder action works.
- [ ] Automatic reminder cron delivery is recorded against the appointment.

## 7. Required Live Rehearsals

Use a company-controlled customer identity. Do not use a real vulnerable customer for launch testing.

### Assessment Visit Payment

- [ ] Start at `/home-safety-wizard` and complete the assessment journey.
- [ ] Confirm the customer recap is readable and accurate.
- [ ] Continue to live Stripe Checkout.
- [ ] Confirm Checkout displays EUR 99 and inclusive 21% VAT correctly.
- [ ] Complete one real payment using an approved company test purchase.
- [ ] Confirm the Stripe receipt arrives.
- [ ] Confirm the webhook delivery returns a successful response.
- [ ] Confirm the admin record changes from `Visit payment pending` to `Visit paid`.
- [ ] Confirm the customer can choose an available date and time.
- [ ] Confirm the record changes to `Visit Scheduled`.
- [ ] Confirm appointment email, management link and calendar links work.
- [ ] Confirm the appointment appears in `/internal/visits`.
- [ ] Refund the launch payment in Stripe when approved.
- [ ] Record the refund reference and confirm the bank reconciliation treatment.

### Proposal Payment

- [ ] Create and send a real-format proposal from `/internal/proposal-generator`.
- [ ] Open the public proposal link on mobile and desktop.
- [ ] Accept the proposal and confirm the acceptance record is stored.
- [ ] Confirm `Pay deposit` opens Stripe Checkout directly.
- [ ] Confirm the amount, VAT treatment, customer email and proposal reference are correct.
- [ ] Complete an approved payment or use the agreed pre-launch verification method.
- [ ] Confirm the webhook updates the proposal payment state.
- [ ] Confirm operations can match the Stripe payment to the proposal.
- [ ] Confirm the customer receives the expected receipt and next-step communication.

### Failure and Recovery

- [ ] Cancel Checkout and confirm the customer can safely retry without duplicate records.
- [ ] Let a test Checkout session expire and confirm the record does not become paid.
- [ ] Confirm a failed or delayed payment does not unlock scheduling early.
- [ ] Confirm duplicate webhook delivery does not create duplicate payments or appointments.
- [ ] Temporarily fail an email in a controlled test and confirm operations can see and recover it.
- [ ] Reschedule a test appointment and confirm the old slot is released.
- [ ] Cancel a test appointment and complete the separate refund decision.

## 8. Daily Opening Routine

- [ ] Review Vercel production deployment and function errors.
- [ ] Review Stripe failed payments, disputes and webhook failures.
- [ ] Review `/internal/leads` for new and overdue follow-ups.
- [ ] Review `/internal/callbacks` for unhandled callback requests.
- [ ] Review `/internal/visits` for today's visits, failed reminders and schedule changes.
- [ ] Review `/internal/proposals` for accepted proposals and payment status.
- [ ] Review `/internal/orders` for payment or fulfilment exceptions.
- [ ] Check the operations inbox for replies, bounces, complaints and withdrawal requests.
- [ ] Assign every new customer item to a named owner.
- [ ] Escalate any immediate home-safety concern to the operations lead.

## 9. Appointment Routine

### Before the Visit

- [ ] Payment status is verified as paid.
- [ ] Customer identity, phone, address and access notes are confirmed.
- [ ] Assessor is assigned and has the necessary customer-safe information.
- [ ] Scope and priority rooms are understood.
- [ ] Reminder delivery is confirmed or completed manually.
- [ ] Customer has a working change or cancellation route.

### After the Visit

- [ ] Visit completion is recorded.
- [ ] Assessment notes and photos are stored only in the approved system.
- [ ] Consent and access restrictions are respected.
- [ ] Report status is moved to `Report Pending` where applicable.
- [ ] Customer report is reviewed before sending.
- [ ] Proposal or next-step recommendation is linked to the correct customer.
- [ ] Follow-up owner and due date are set.

## 10. Refund, Cancellation and Withdrawal Routine

- [ ] Identify whether the request is a reschedule, cancellation, withdrawal or complaint.
- [ ] Check the applicable approved terms and service stage.
- [ ] Confirm payment amount, Stripe payment reference and appointment status.
- [ ] Obtain the required refund approval.
- [ ] Process an approved refund in Stripe; appointment cancellation alone is insufficient.
- [ ] Record the refund amount, reason, approver, date and Stripe reference.
- [ ] Send the customer a clear confirmation in their language.
- [ ] Release any appointment slot and notify the assigned provider or assessor.
- [ ] Update finance reconciliation and any associated proposal or order record.
- [ ] Escalate disputed, chargeback, vulnerability or legal cases to the designated owner.

## 11. Exception Matrix

| Situation | Immediate action | Operational check | Customer response |
| --- | --- | --- | --- |
| Customer paid but site shows pending | Do not request a second payment | Check Stripe session, webhook delivery and matching customer reference | Confirm payment is being verified and give a response time |
| Site shows paid but Stripe does not | Stop scheduling or fulfilment | Escalate to technical and payments owners | Explain that payment confirmation is being checked |
| Duplicate payment suspected | Freeze further collection | Compare Stripe payment intents and customer records | Acknowledge the issue and provide the refund review timeline |
| Appointment cancelled | Release the slot | Decide and process any refund separately | Confirm cancellation and explain refund status |
| Reminder failed | Contact manually | Verify email and appointment time | Send the appointment details through an approved channel |
| Email bounced | Verify contact details | Review Resend delivery and customer record | Re-send only after correcting the address |
| Webhook failed | Keep the record pending | Retry from Stripe after fixing the cause | Do not ask the customer to pay again |
| Complaint alleges immediate danger | Escalate immediately | Stop affected work or product use where appropriate | Tell the customer to call 112 for an emergency |
| Data or privacy incident suspected | Restrict access and preserve evidence | Start the approved incident process | Use only counsel-approved incident communication |

## 12. Daily Closing and Reconciliation

- [ ] Match each successful Stripe payment to one CasaMia customer reference.
- [ ] Investigate every unmatched, duplicated, refunded or disputed transaction.
- [ ] Confirm paid visits awaiting scheduling have an assigned follow-up.
- [ ] Confirm tomorrow's appointments have an owner and valid contact details.
- [ ] Confirm urgent complaints and withdrawals have been acknowledged.
- [ ] Review failed customer and admin email deliveries.
- [ ] Record unresolved items with owner, next action and deadline.
- [ ] Do not leave sensitive customer information in personal email, chat or local files.

## 13. Weekly and Monthly Controls

### Weekly

- [ ] Review lead response times and overdue follow-ups.
- [ ] Review visit completion, cancellation and no-show rates.
- [ ] Review failed payments, refunds, disputes and webhook errors.
- [ ] Review reminder success and email bounce rates.
- [ ] Review customer complaints, safety issues and provider concerns.
- [ ] Confirm provider access still matches assigned work.

### Monthly

- [ ] Reconcile Stripe payments, refunds, fees, VAT and bank payouts with accounting records.
- [ ] Review privileged admin and partner access.
- [ ] Review production environment variables for ownership and expiry risk without exporting secret values.
- [ ] Confirm legal and commercial documents still match current operations.
- [ ] Review catalogue pricing and quote-only items.
- [ ] Confirm backups, retention and deletion routines are operating as approved.
- [ ] Review Meta, Resend, Stripe, Vercel and Supabase service health and account notices.

## 14. Go or No-Go Decision

Do not accept live payments unless all of the following are true:

- [ ] Legal and tax approvals are recorded.
- [ ] Stripe live credentials, VAT and webhook are verified.
- [ ] A complete live payment and appointment rehearsal has passed.
- [ ] Customer and operations emails have passed in English and Spanish.
- [ ] Admin and partner access controls have passed.
- [ ] Refund and incident owners are available.
- [ ] No unresolved critical or high-severity launch issue remains.

Launch decision:

- [ ] GO
- [ ] NO-GO
- Decision date:
- Decision owner:
- Evidence location:
- Open conditions:
