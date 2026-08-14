# Casamia Spain Grant Support Page

This page lives at `/grants-for-home-adaptations-spain`.

## Eligibility Logic

The checker stores user answers in `GrantAnswers` and evaluates them with `evaluateGrantEligibility` in `src/services/grantSupportSpain.ts`.

The engine does not show a numerical score to users. It builds:

- favourable factors
- funding routes to review
- information still missing
- adaptations that may qualify
- recommended documents
- a recommended next action

The four public result levels are:

- `high-likelihood`
- `good-possibility`
- `review-required`
- `alternative-support`

The copy avoids rejecting users outright. Even weak matches are routed to alternative municipal, social, dependency, disability, fiscal or complementary support review.

## Programme Data

Sample programme data is in `sampleGrantProgrammes` in `src/services/grantSupportSpain.ts`.

Each programme follows the `GrantProgramme` type. The current sample data covers:

- Spain-wide rehabilitation and accessibility routes
- Andalucía
- Comunidad de Madrid
- Comunidad Valenciana

These entries are configurable content, not legal advice. Add official source URLs, dates, caps and current status as verified data becomes available.

## Adding Autonomous Communities

1. Add the community name to `spanishAutonomousCommunities` if missing.
2. Add one or more `GrantProgramme` records.
3. Set `authorityLevel`, `autonomousCommunity`, status, eligible works and notes.
4. Add `officialSourceUrl` and `sourceLastVerified` after checking the public source.

## Connecting Official Sources

Future integrations can update `sampleGrantProgrammes` from:

- official grant APIs
- maintained internal databases
- Airtable
- CRM records
- scheduled research jobs

Keep raw health, disability or dependency answers out of advertising analytics.

## Connecting Airtable, CRM and WhatsApp

The lead form in `GrantSupportSpainPage.tsx` currently submits locally and emits a safe analytics event. Replace the submit handler with a server endpoint that can fan out to:

- Airtable lead table
- CRM contact/opportunity
- internal email notification
- WhatsApp workflow
- Casamia internal assessment system

Server-side validation should recalculate the eligibility result from submitted answer IDs instead of trusting client text.

## Updating Amounts and Deadlines

Update `maximumAmount`, `fundingPercentage`, `enhancedFundingPercentage`, `applicationStart`, `applicationEnd`, `status`, `officialSourceUrl` and `sourceLastVerified` in each programme record.

The public page intentionally uses indicative language because caps and percentages differ by programme and location.
