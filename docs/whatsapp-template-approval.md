# WhatsApp Template Approval

CasaMia uses WhatsApp templates only for customer-requested secure links. Keep `VITE_CASAMIA_WHATSAPP_DELIVERY_ENABLED=false` until all live templates below are approved and a real delivery test succeeds.

## Sender

- Public contact number: `+34 648 027 076`
- Public click-to-chat URL: `https://wa.me/34648027076`
- Automated delivery requires the approved Meta Cloud API sender `WHATSAPP_PHONE_NUMBER_ID`.

## Template Category

Use Meta category: `Utility`.

## Templates

### `casamia_report_ready_en`

Language: English

Body:

```text
Hi {{1}}, your {{2}} is ready.

Open your secure CasaMia report here: {{3}}

This message only contains your secure link. Please do not reply with medical or payment details.
```

Example body values:

- `{{1}}`: Ana
- `{{2}}`: CasaMia safety report
- `{{3}}`: https://www.casamia.com.es/estimate/example-token

### `casamia_report_ready_es`

Language: Spanish

Body:

```text
Hola {{1}}, tu {{2}} ya está listo.

Abre tu informe seguro de CasaMia aquí: {{3}}

Este mensaje solo contiene tu enlace seguro. Por favor, no respondas con datos médicos ni de pago.
```

Example body values:

- `{{1}}`: Ana
- `{{2}}`: informe de seguridad CasaMia
- `{{3}}`: https://www.casamia.com.es/es/estimate/example-token

### `casamia_proposal_ready_en`

Language: English

Body:

```text
Hi {{1}}, your CasaMia proposal {{2}} is ready.

Review it securely here: {{3}}

This message only contains your secure link. Please do not reply with medical or payment details.
```

Example body values:

- `{{1}}`: Ana
- `{{2}}`: CM-123
- `{{3}}`: https://www.casamia.com.es/proposal/example-token

### `casamia_proposal_ready_es`

Language: Spanish

Body:

```text
Hola {{1}}, tu propuesta CasaMia {{2}} ya está lista.

Revísala de forma segura aquí: {{3}}

Este mensaje solo contiene tu enlace seguro. Por favor, no respondas con datos médicos ni de pago.
```

Example body values:

- `{{1}}`: Ana
- `{{2}}`: CM-123
- `{{3}}`: https://www.casamia.com.es/es/proposal/example-token

## Vercel Variables After Approval

- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_APP_SECRET`
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- `CASAMIA_WHATSAPP_REPORT_TEMPLATE_EN=casamia_report_ready_en`
- `CASAMIA_WHATSAPP_REPORT_TEMPLATE_ES=casamia_report_ready_es`
- `CASAMIA_WHATSAPP_PROPOSAL_TEMPLATE_EN=casamia_proposal_ready_en`
- `CASAMIA_WHATSAPP_PROPOSAL_TEMPLATE_ES=casamia_proposal_ready_es`
- `WHATSAPP_TEMPLATE_LANGUAGE_EN=en`
- `WHATSAPP_TEMPLATE_LANGUAGE_ES=es`

Only set `VITE_CASAMIA_WHATSAPP_DELIVERY_ENABLED=true` after a real English and Spanish send test succeeds.
