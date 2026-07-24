# CasaMia Master Service Catalogue

## Purpose

The Master Service Catalogue is the single source of truth for every CasaMia outcome, package, connected experience, adaptation, operational component, price rule, grant signal, recommendation rule, and localisation.

It must power:

- Public website
- Home Safety Wizard
- Internal Inspector Portal
- Proposal Generator
- CRM
- Pricing Engine
- Grant Management
- Installation Scheduling
- Future AI recommendations
- Analytics
- Mobile applications

The catalogue is not a product list. It is CasaMia’s operating model in structured form.

Customers buy outcomes. Installers specify products.

## Core principle

Every room follows the same structure:

```text
Room
├── Home Safety Package
├── Connected Room
└── Optional Adaptations
```

This gives every team the same mental model:

- `Home Safety Package`: physical improvements that reduce everyday risk.
- `Connected Room`: configured technology experiences, not device retail.
- `Optional Adaptations`: bespoke works requiring assessment, measurement, structural review, or specialist quotation.

## Customer-facing language

The public language should describe outcomes:

- Safer Bathroom Access
- Easier Bed Transfers
- Better Night-Time Visibility
- Family Reassurance
- Accessible Storage
- Safer Cooking Confidence

Avoid exposing technical names unless a customer needs them:

- PIR sensor
- Zigbee hub
- Pull-down rail
- Specific SKU/model names
- Raw device types

Those belong in internal components, installer notes, and supplier mappings.

## Catalogue hierarchy

```text
Catalogue
├── Countries
├── Rooms
│   ├── Bathroom
│   │   ├── Home Safety Package
│   │   ├── Connected Bathroom
│   │   └── Optional Adaptations
│   ├── Bedroom
│   │   ├── Home Safety Package
│   │   ├── Connected Bedroom
│   │   └── Optional Adaptations
│   └── ...
├── Outcomes / services
├── Internal components
├── Package pricing
├── Recommendation rules
├── Grant rules
├── Installer requirements
├── Localised copy
└── Media and evidence mappings
```

## Room-by-room catalogue

### Bathroom

#### Home Safety Package

| Customer outcome | Internal examples | Notes |
|---|---|---|
| Safer Bathroom Access | Grab bars, toilet support rails, threshold reduction | Core accessibility and transfer support. |
| Safer Showering | Folding shower seat, anti-slip review | Describe as safe showering, not device sale. |
| Easier Toilet Transfers | Raised toilet seat, toilet support rails | Useful for mobility and balance concerns. |
| Better Bathroom Visibility | Improved lighting, motion lighting | Can be physical or connected depending setup. |
| Easier Water Control | Lever mixer tap, thermostatic valve | Customer outcome is easier/safer control. |

#### Connected Bathroom

| Customer experience | Internal examples | Notes |
|---|---|---|
| Night-Time Bathroom Guidance | Motion lighting, route lighting, occupancy-aware routines | Avoid “sensor package” language. |
| Discreet Bathroom Reassurance | Bathroom routine signals, non-camera presence context | Privacy-led; no cameras. |
| Water Safety Awareness | Leak detection, temperature alerts where compatible | Optional connected experience. |

#### Optional Adaptations

| Customer outcome | Internal examples | Notes |
|---|---|---|
| Easier Bath Entry | Tub cut-out | Requires assessment and quote. |
| Wider Bathroom Access | Wider doorway | Structural review required. |
| Specialist Bathroom Reconfiguration | Walk-in shower, layout changes | Future package family. |

### Bedroom

#### Home Safety Package

| Customer outcome | Internal examples | Notes |
|---|---|---|
| Easier Bed Transfers | Bed support, transfer handle, layout adjustment | Do not lead with “bed rail.” |
| Safer Night Movement | Under-bed lighting, route lighting | Strong wizard mapping for night bathroom concerns. |
| Accessible Storage | Lowered storage, wardrobe access support | Helps reduce reaching/climbing risk. |
| Clearer Bedroom Layout | Trip reduction, furniture route planning | Inspector and proposal friendly. |

#### Connected Bedroom

| Customer experience | Internal examples | Notes |
|---|---|---|
| Morning Routine | Smart speaker routine, light prompts, medication reminder | Experience-led. |
| Night Routine | Gentle lighting, check-in, family reassurance | Configured as routine, not devices. |
| Bedroom Movement Awareness | Bed exit / movement context where appropriate | Consent-led and privacy-led. |
| Voice Assistance | Smart speaker, configured shortcuts | Customer buys simplicity. |
| Family Reassurance | Notifications and agreed alerts | Not surveillance. |

#### Optional Adaptations

| Customer outcome | Internal examples | Notes |
|---|---|---|
| Specialist Bedroom Layout | Layout redesign, circulation planning | Requires assessment. |
| Adjustable Rest Support | Adjustable bed review | Bespoke recommendation, not default sale. |
| Accessible Wardrobe Adaptation | Wardrobe modification | Measurement and quote. |

### Kitchen

#### Home Safety Package

| Customer outcome | Internal examples | Notes |
|---|---|---|
| Safer Cooking Confidence | Safer controls, anti-fatigue mat, cookware review | Keep confidence/outcome language. |
| Easier Reach and Storage | Pull-down storage, lower-use zone planning | Avoid raw hardware names publicly. |
| Better Kitchen Visibility | Task lighting, worktop lighting | Prevents accidents and strain. |
| Reduced Water and Appliance Risk | Leak safeguard, appliance review | Operational details internal. |

#### Connected Kitchen

| Customer experience | Internal examples | Notes |
|---|---|---|
| Cooking Safety Reminders | Voice prompts, routine reminders | Not a monitoring solution. |
| Water Leak Awareness | Leak sensor integration | Customer sees reassurance. |
| Appliance Confidence | Compatible alerts or shut-off workflows | Requires compatibility check. |

#### Optional Adaptations

| Customer outcome | Internal examples | Notes |
|---|---|---|
| Accessible Kitchen Layout | Worktop/cabinet adaptation | Quote and specialist review. |
| Safer Appliance Replacement | Appliance sourcing and installation | Future supplier mapping. |

### Living Areas and Mobility

#### Home Safety Package

| Customer outcome | Internal examples | Notes |
|---|---|---|
| Clearer Walking Routes | Rug securing, cable management, furniture route planning | Core home safety work. |
| Easier Sitting and Standing | Stand-assist supports, seating review | Outcome-focused. |
| Better Everyday Lighting | Route lighting, switches, task lighting | Can overlap with lighting package. |

#### Connected Living Area

| Customer experience | Internal examples | Notes |
|---|---|---|
| Voice Control for Daily Tasks | Smart speaker, lights, routines | “Ask CasaMia/assistant to help.” |
| Family Reassurance | Agreed alerts, check-ins | Consent-led. |
| Comfortable Daily Routine | Lighting scenes, reminders | Make tech invisible. |

#### Optional Adaptations

| Customer outcome | Internal examples | Notes |
|---|---|---|
| Layout Reconfiguration | Furniture/access planning | Assessment-led. |
| Specialist Seating Support | Seating replacement/adaptation | Quote. |

### Stairs

#### Home Safety Package

| Customer outcome | Internal examples | Notes |
|---|---|---|
| Safer Stair Use | Handrails, stair tread contrast, lighting | Strong fall-prevention mapping. |
| Better Step Visibility | Contrast strips, stair lighting | Customer-friendly. |

#### Connected Stairs

| Customer experience | Internal examples | Notes |
|---|---|---|
| Automatic Stair Lighting | Motion lighting | Simple, not device-led. |
| Stair Risk Reassurance | Optional alerts / routines | Only where appropriate. |

#### Optional Adaptations

| Customer outcome | Internal examples | Notes |
|---|---|---|
| Major Stair Access Solution | Stairlift referral/integration | Future partner/supplier mapping. |
| Structural Stair Adaptation | Railings, width, layout review | Quote and specialist review. |

### Entrance and Outdoor Access

#### Home Safety Package

| Customer outcome | Internal examples | Notes |
|---|---|---|
| Easier Home Entry | Threshold treatment, entrance handrail | Core access outcome. |
| Safer Arrival at Night | Entrance lighting | Strong public proposition. |
| More Secure Access | Key safe / access support where appropriate | Avoid smart-lock retailing. |

#### Connected Entrance

| Customer experience | Internal examples | Notes |
|---|---|---|
| Safer Arrivals | Smart lighting, doorbell/access workflows | Experience-led. |
| Family and Caregiver Access | Configured permissions | Consent and governance required. |

#### Optional Adaptations

| Customer outcome | Internal examples | Notes |
|---|---|---|
| Step-Free Access | Modular ramp | Measurement and quote. |
| Wider External Access | Door / path works | Specialist review. |

### Whole Home / Connected Living

This sits above individual rooms and can attach to any room.

| Customer experience | Internal examples | Notes |
|---|---|---|
| Connected Living Setup | Smart speaker, compatible devices, configured routines | CasaMia experience, not device shop. |
| Medication Reminders | Voice/app reminders, routine prompts | Must be careful with medical claims. |
| Family Reassurance | Agreed notifications and visibility | Consent-led. |
| Emergency Confidence | Call button, response workflow | Do not imply emergency service replacement. |
| Home Clinic Support | Compatible health-device integration, app/system integration | Used for assisted living / senior communities. |

## Standard metadata model

Every catalogue item should have these fields.

### Identity

- `id`
- `slug`
- `version`
- `active`
- `status`: `draft | active | deprecated`
- `country`
- `room`
- `section`: `home_safety_package | connected_room | optional_adaptations`
- `category`
- `tags`

### Customer copy

- `customerName`
- `customerDescription`
- `customerBenefit`
- `outcome`
- `plainLanguageSummary`
- `websiteVisible`
- `wizardVisible`
- `proposalVisible`
- `customerSafetyNotes`
- `languages`

### Internal operations

- `internalName`
- `internalDescription`
- `technicalNotes`
- `componentType`: `service | product | installation | configuration | assessment | partner_work`
- `includedComponents`
- `coreOrOptional`: `core | optional`
- `requiresInstallation`
- `requiresAssessment`
- `requiresSiteVisit`
- `requiresMeasurement`
- `requiresCompatibilityCheck`
- `requiresQuote`
- `typicalInstallationTime`
- `installerSkillTags`
- `installerChecklist`
- `handoverChecklist`
- `safetyNotes`

### Pricing

- `priceModel`: `package_included | fixed | from | quote_only | recurring | blended`
- `productCost`
- `installationCost`
- `startingPrice`
- `packagePriceContribution`
- `recurringMonthlyPrice`
- `vatRate`
- `vatReason`
- `quantityType`
- `minimumQuantity`
- `priceRules`

### Grant and compliance

- `grantEligible`
- `grantCategories`
- `grantEvidenceNeeded`
- `requiresConsent`
- `requiresOwnerPermission`
- `complianceNotes`
- `countryRules`

### Mapping and automation

- `wizardTriggers`
- `inspectionQuestions`
- `evidenceCategories`
- `recommendationRules`
- `proposalBlocks`
- `crmStageMappings`
- `analyticsEvents`
- `aiRecommendationHints`
- `relatedServices`
- `dependencies`
- `exclusions`

### Media

- `primaryImage`
- `relatedImages`
- `beforeAfterGallery`
- `icon`
- `roomVisual`

## Pricing model

CasaMia should price at package/outcome level first, with optional adaptations quoted separately.

### Package pricing

Each room section can have one package config:

- `Home Safety Package`: usually fixed/from/quote after assessment.
- `Connected Room`: setup fee plus optional recurring monthly support.
- `Optional Adaptations`: quote only unless a standard adaptation has a known starting price.

### Item pricing

Items can have costs internally, but public-facing pages should avoid presenting product-by-product shopping cart behaviour.

Recommended public language:

- Included in package
- From after home review
- Custom quote after inspection
- Optional connected service

## Wizard recommendation mappings

The wizard should map answers to outcomes, not devices.

Example:

```text
User says:
- Bathroom feels unsafe
- Recent near fall
- Trouble standing from toilet

Recommend:
- Safer Bathroom Access
- Easier Toilet Transfers
- Safer Showering

Internal components:
- Grab bars
- Toilet support rails
- Raised toilet seat
- Folding shower seat
```

## Proposal mappings

Proposals should show:

1. Customer outcome
2. Why it matters
3. What CasaMia includes
4. What must be checked on site
5. Package price / quote rule
6. Optional upgrades

Do not lead with SKUs or technical devices.

## Inspector mappings

Inspectors need room-specific prompts:

- What problem is being solved?
- Is the surface/structure suitable?
- Does this require measurement?
- Is owner permission required?
- Are there photos/evidence?
- Which services are confirmed, not suitable, or need quote?

## CRM mappings

Each catalogue item should map to CRM:

- Lead interest area
- Recommended package
- Quote complexity
- Grant relevance
- Site visit required
- Installer skill needed
- Follow-up priority

## AI recommendation mappings

The AI layer should only recommend from active catalogue records.

It should use:

- user answers
- photos/videos
- inspector notes
- previous proposals
- grant eligibility
- room risks
- available package records

It should output:

- customer-friendly outcome recommendation
- internal catalogue IDs
- confidence
- missing evidence
- caveats

## Implementation-ready JSON shape

```json
{
  "catalogueVersion": "1.0.0",
  "country": "ES",
  "rooms": [
    {
      "id": "bathroom",
      "slug": "bathroom",
      "customerName": {
        "en": "Bathroom",
        "es": "Baño"
      },
      "sections": [
        {
          "id": "bathroom-home-safety-package",
          "type": "home_safety_package",
          "customerName": {
            "en": "Safer Bathroom Access",
            "es": "Acceso más seguro al baño"
          },
          "priceModel": "quote_only",
          "items": [
            "bathroom-grab-bars",
            "bathroom-folding-shower-seat",
            "bathroom-raised-toilet-seat"
          ]
        }
      ]
    }
  ],
  "items": [
    {
      "id": "bathroom-grab-bars",
      "slug": "bathroom-grab-bars",
      "version": "1.0.0",
      "active": true,
      "status": "active",
      "country": "ES",
      "room": "bathroom",
      "section": "home_safety_package",
      "category": "transfer_support",
      "coreOrOptional": "core",
      "customerName": {
        "en": "Safer Bathroom Support",
        "es": "Apoyo más seguro en el baño"
      },
      "internalName": "Grab bars",
      "customerDescription": {
        "en": "Stable support points placed where bathing or toilet transfers happen.",
        "es": "Puntos de apoyo estables colocados donde se realizan transferencias de baño o inodoro."
      },
      "customerBenefit": {
        "en": "Helps make daily bathroom movement steadier and less stressful.",
        "es": "Ayuda a que el movimiento diario en el baño sea más estable y tranquilo."
      },
      "websiteVisible": true,
      "wizardVisible": true,
      "proposalVisible": true,
      "inspectorVisible": true,
      "requiresInstallation": true,
      "requiresAssessment": true,
      "requiresSiteVisit": true,
      "requiresMeasurement": false,
      "requiresCompatibilityCheck": true,
      "requiresQuote": false,
      "priority": "essential",
      "typicalInstallationTime": "1-2 hours",
      "priceModel": "package_included",
      "vatRate": 0.1,
      "vatReason": "Support product for reduced mobility; confirm invoice treatment.",
      "quantityType": "per_unit",
      "grantEligible": true,
      "includedComponents": [
        {
          "type": "hardware",
          "internalName": "Grab bar",
          "customerVisible": false
        },
        {
          "type": "installation",
          "internalName": "Wall fixing",
          "customerVisible": false
        }
      ],
      "wizardTriggers": [
        {
          "answerKey": "bathroom.toiletDifficulty",
          "matches": ["yes", "unsure"],
          "confidence": "medium"
        }
      ],
      "inspectionQuestions": [
        "Where does the resident need support most?",
        "Is the wall suitable for secure fixing?",
        "Is landlord or owner approval needed?"
      ],
      "aiRecommendationHints": [
        "Recommend when bathroom transfer risk is visible or reported.",
        "Do not recommend if no secure fixing surface is available without alternative."
      ],
      "tags": ["fall_prevention", "bathroom", "mobility", "transfer_support"]
    }
  ]
}
```

## Database implementation model

Recommended Supabase tables for v2:

### `catalogue_rooms`

- `id`
- `slug`
- `active`
- `sort_order`
- `country`
- `translations_json`
- `created_at`
- `updated_at`

### `catalogue_sections`

- `id`
- `room_id`
- `type`
- `active`
- `sort_order`
- `pricing_json`
- `translations_json`
- `created_at`
- `updated_at`

### `catalogue_items`

- `id`
- `slug`
- `room_id`
- `section_id`
- `active`
- `status`
- `category`
- `core_or_optional`
- `visibility_json`
- `requirements_json`
- `pricing_json`
- `grant_json`
- `operations_json`
- `recommendation_json`
- `media_json`
- `translations_json`
- `tags`
- `version`
- `created_at`
- `updated_at`

### `catalogue_components`

- `id`
- `item_id`
- `component_type`
- `internal_name`
- `supplier`
- `sku`
- `cost`
- `visibility`
- `requirements_json`
- `created_at`
- `updated_at`

### `catalogue_relationships`

- `id`
- `source_item_id`
- `target_item_id`
- `relationship_type`
- `notes`

## Migration plan

### Phase 1 — Non-breaking model extension

Extend the current TypeScript model without removing existing fields:

- Add `section`
- Add `customerName`
- Add `internalName`
- Add visibility flags
- Add `requiresAssessment`
- Add `requiresQuote`
- Add grant fields
- Add operations metadata
- Add richer localisation object

Keep existing `CasaMiaService` compatibility.

### Phase 2 — Admin catalogue editor

Update internal admin so each room shows:

1. Home Safety Package
2. Connected Room
3. Optional Adaptations

Add package-level price editing and component core/optional controls.

### Phase 3 — Website and wizard read from sections

Public pages and wizard should read:

- rooms
- sections
- active visible items
- recommendation mappings

No hardcoded room package names.

### Phase 4 — Proposal generator integration

Proposal generator should build:

- selected outcomes
- included package components
- optional adaptations
- site-visit requirements
- grant relevance

### Phase 5 — AI-ready recommendation layer

AI recommendations should return catalogue IDs only, plus reasons and missing evidence.

## Success criteria

- Every CasaMia service exists only once.
- Every platform reads from the same catalogue.
- Adding a new service requires editing one record only.
- Customer language remains simple and premium.
- Internal operations have all required technical detail.
- Catalogue scales to grants, AI, analytics, mobile, and additional countries.
