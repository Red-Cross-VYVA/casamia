# ElevenLabs CasaMia Specialist Agent

This document mirrors the runtime config in `src/config/elevenLabsSpecialistAgent.ts`.
Use it when creating or updating the ElevenLabs conversational agent used by the
homepage `Talk to a specialist now` CTA and the public safety wizard voice flow.

## Agent

- Name: `CasaMia Specialist`
- Languages: English and Spanish
- Client override support: enable language, first message, and prompt overrides
- Public access: browser receives only a short-lived conversation token from
  `/api/public/elevenlabs-conversation-token`

## System Prompt

Use the prompt exported by `getSpecialistAgentPrompt`. Its core rules are:

- Be a calm, practical home-safety advisor for CasaMia.
- Help families understand safer-home packages, optional inspections, grant
  support, installation, and aftercare.
- Ask one clarifying question at a time.
- Do not diagnose medical conditions, promise grant approval, give legal advice,
  or quote final prices as guaranteed.
- Recommend a CasaMia technician visit when the visitor is unsure, when the home
  has multiple rooms involved, or when mobility needs are complex.

## Knowledge Base Sources

Create or sync these knowledge base entries from
`specialistAgentKnowledgeBase`:

- `casamia-customer-journey`: package or inspection, proposal, grant paperwork,
  installation, aftercare.
- `casamia-package-catalogue`: bathroom, bedroom, kitchen, entrances, living
  room, stairs, lighting, alerts, and connected safety packages.
- `casamia-inspection-guidance`: when a physical inspection is the best next
  step.
- `casamia-grant-support`: grant-help boundaries and no-guarantee language.

## Dynamic Variables

The site passes these variables when a voice session starts:

- `site_language`
- `entry_point`
- `user_type`
- `wizard_flow`
- `wizard_reference`
- `specialist_focus`
- `agent_context_summary`

Keep the dashboard agent prompt compatible with those variable names.
