# CasaMia WhatsApp automatic replies

The existing signed Meta webhook at `/api/webhooks/whatsapp` answers recent
customer messages when `CASAMIA_WHATSAPP_AUTO_REPLY_ENABLED=true`. It uses the
live `WHATSAPP_PHONE_NUMBER_ID` and live Cloud API credentials, independently
of the admin panel's optional test sender. Other phone-number IDs are ignored.
The Meta app must be subscribed to the WABA's `messages` webhook field.
The live WABA must also subscribe to the CasaMia app via `/{WABA-ID}/subscribed_apps`.
The admin setup page's **Check incoming connection** verifies that the live
token belongs to the expected app, that the account contains the configured
phone ID, and that the app is subscribed. **Connect incoming messages** adds
only a missing subscription and verifies it afterward. These controls require
the existing internal authentication and cannot operate on the isolated test
sender. Existing subscriptions are preserved.

This is an English/Spanish FAQ assistant with a numbered menu, not a generative
AI agent. Replies cover services, prices/proposals, free reports, in-home visits,
service areas and grants. Prices and availability are linked to the live site;
the assistant does not confirm payments, bookings, orders or grant eligibility.
Media messages receive a text-only explanation and the free photo-report link.
Unknown requests receive the menu. Every welcome identifies the automation.

The number is shared with VYVA template flows. Template quick replies and
interactive button/list callbacks are ignored by the CasaMia assistant before
it stores a lead, changes conversation state or sends a reply. CasaMia's own
menu uses typed numbers; these continue to work. Template definitions, button
payloads and other apps' webhook subscriptions are unchanged.

`STOP` / `BAJA` suppress subsequent automatic conversation replies until the
customer sends `START` / `INICIAR`. This switch does not unsubscribe customers
from report/proposal notifications they request separately. Asking for a person
(or menu option 5) saves a callback lead in the existing admin Leads view and
pauses automated conversation replies until the customer restarts them. The
reply supplies the customer-service email and callback link; it does not claim
that a live agent is present or promise a response time. No staff email alert
or interactive staff inbox is added by this feature.

Durable state uses the existing server-only `contact_requests` store, which
already has RLS enabled. `whatsapp_inbound` records contain the text enquiry,
sender, inbound message ID and reply result; `whatsapp_conversation` records
hold the language and Active/Paused/Stopped state. Handoff records use the
existing `callback_request` type, so the team can process them in Leads. No
schema migration or public database permissions are needed.

Deterministic UUIDs and an atomic conditional reservation prevent concurrent
webhook retries from sending duplicate replies. Preparation failures before a
send can retry. An uncertain Meta outcome is not retried automatically because
the provider may already have accepted the message; inspect Failed/Unconfirmed
records and `[whatsapp-auto-reply]` logs. A hard termination during Processing
also needs manual inspection rather than an automatic resend.

Only inbound messages less than 24 hours old can trigger free-form replies.
Status-only webhooks, reactions, missing/other sender IDs, invalid timestamps
and messages from the business's own number cannot trigger a reply. The existing
`reserve_public_request` RPC limits replies to 20 per customer per 5 minutes;
its key is hashed with the app secret. Status callbacks continue updating the
existing report/proposal records. Automatic reply records store API acceptance,
not a claim of confirmed customer receipt.

The admin WhatsApp setup page reports whether automatic replies are enabled.
To disable replies, set the server-only flag to `false` and redeploy; report and
proposal delivery remains controlled by its existing separate switch.

Validation: `npm run test:whatsapp` covers signed inbound webhooks, customer
intents, both languages, language memory, duplicates and concurrency, opt-out,
handoff, sender/window guards, rate limits and database/provider failures.
For a live test, send `Hola` or `Hello` from another WhatsApp account to
`+34 608 471 713`, then try `2`, `5`, `INICIAR`, `BAJA` and `INICIAR`. Avoid
sending test notifications to other customer numbers.
