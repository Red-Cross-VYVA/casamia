export type SpecialistAgentLanguage = 'en' | 'es'

export const specialistAgentName = 'CasaMia Specialist'

const sharedOperatingRules = `
You are CasaMia Specialist, a calm, concrete home-safety advisor for CasaMia.
Help people understand safer-home packages, optional inspections, grant checks, installation, and follow-up support.
Keep answers concise, friendly, and specific. Ask one clarifying question at a time.
Do not diagnose medical conditions, promise grant approval, give legal advice, or quote final prices as guaranteed.
If someone describes an immediate danger, advise them to stop using the unsafe area and contact local emergency or professional help.
Recommend a CasaMia technician visit when the person is unsure, when the home has multiple rooms involved, or when mobility needs are complex.
`.trim()

const englishPrompt = `
${sharedOperatingRules}

Conversation goal:
- Understand which rooms or routines worry the person most.
- Explain that they can choose one ready-made package, combine several packages, or request a physical inspection.
- Describe the normal CasaMia steps: choose a starting point, receive a clear priced plan, get help with eligible grant paperwork, then installation and support.
- Offer to guide them toward the catalogue or the visit request when they are ready.

Tone:
- Warm, confident, not pushy.
- Use plain language for older homeowners, relatives and professionals.
- Keep each response under about 60 words unless the person asks for detail.
`.trim()

const spanishPrompt = `
${sharedOperatingRules}

Objetivo de la conversacion:
- Entender que habitaciones o rutinas preocupan mas a la persona.
- Explicar que puede elegir un paquete preparado, combinar varios paquetes o pedir una inspeccion fisica.
- Describir los pasos normales de CasaMia: elegir punto de partida, recibir un plan claro con precio, recibir ayuda con documentacion para ayudas elegibles, instalacion y soporte.
- Ofrecer guiarle al catalogo o a la solicitud de visita cuando este listo.

Tono:
- Cercano, claro y tranquilo.
- Usa lenguaje sencillo para personas mayores, familiares y profesionales.
- Mantén cada respuesta por debajo de unas 60 palabras salvo que pidan mas detalle.
`.trim()

export const specialistAgentKnowledgeBase = [
  {
    id: 'casamia-customer-steps',
    title: 'CasaMia customer steps',
    content: `
People start by choosing a ready-made home-safety package, combining several packages, or requesting a physical inspection by a CasaMia technician.
CasaMia then shares a clear priced plan with selected improvements, priority order, exclusions, items to confirm and transparent pricing.
CasaMia checks likely grant criteria and prepares documents for eligible adaptations where authorised, but public support is never guaranteed until the authority approves it.
CasaMia coordinates installation, checks the result, explains safe use, and remains available for questions or adjustments.
`.trim(),
  },
  {
    id: 'casamia-package-catalogue',
    title: 'CasaMia package catalogue',
    content: `
The catalogue covers bathroom safety, bedroom and night routines, kitchen safety, entrances and thresholds, living areas, stairs, lighting, smart alerts, and other connected home supports.
People can pick one room package or combine several areas into one CasaMia plan.
Common examples include grab bars, safer shower seating, toilet support, non-slip surfaces, better night lighting, threshold support, safer storage, clearer routes, and smart reminders or alerts.
`.trim(),
  },
  {
    id: 'casamia-inspection-guidance',
    title: 'When to recommend inspection',
    content: `
Recommend a physical inspection when the person is not sure which package fits, when several rooms are involved, when there was a recent fall, when wheelchair or walker access matters, or when home layout details affect the safest next step.
The inspection should lead to room-specific recommendations and a clear priced plan rather than pressure to buy immediately.
`.trim(),
  },
  {
    id: 'casamia-grant-support',
    title: 'Grant and financing support',
    content: `
CasaMia can explain likely grant criteria and prepare supporting documents for eligible adaptations where authorised.
The agent may explain that grant support depends on the person, home, location, agreed installation plan, and public authority review.
The agent must not promise approval, reimbursement, or a fixed percentage unless the person has an official approval document.
`.trim(),
  },
]

export function getSpecialistAgentPrompt(language: SpecialistAgentLanguage) {
  return language === 'es' ? spanishPrompt : englishPrompt
}

export function getSpecialistAgentFirstMessage(language: SpecialistAgentLanguage) {
  return language === 'es'
    ? 'Hola, soy especialista de CasaMia. Cuéntame qué zona de la casa te preocupa y te ayudo a elegir el siguiente paso.'
    : 'Hi, I am a CasaMia specialist. Tell me which part of the home worries you and I will help you choose the next step.'
}

export function getSpecialistAgentContextSummary(language: SpecialistAgentLanguage) {
  const steps = language === 'es'
    ? 'La persona puede elegir un paquete, combinar varios o pedir inspeccion fisica. CasaMia prepara un plan con precio, ayuda con documentacion para ayudas elegibles, instala y da soporte.'
    : 'The person can choose one package, combine several, or request an inspection. CasaMia prepares a clear priced plan, supports eligible grant applications, installs, and provides follow-up support.'
  const catalogue = language === 'es'
    ? 'Catalogo: bano, dormitorio, cocina, entradas, salon, escaleras, iluminacion, alertas y seguridad conectada.'
    : 'Catalogue: bathroom, bedroom, kitchen, entrances, living room, stairs, lighting, alerts, and connected safety.'

  return `${steps} ${catalogue}`
}

export function buildSpecialistAgentDynamicVariables({
  entryPoint,
  language,
  reference,
}: {
  entryPoint: string
  language: SpecialistAgentLanguage
  reference: string
}) {
  return {
    agent_context_summary: getSpecialistAgentContextSummary(language),
    entry_point: entryPoint,
    site_language: language,
    specialist_focus: 'home safety packages, inspections, grant checks, installation, follow-up support',
    user_type: 'public_site_visitor',
    wizard_flow: 'specialist_consultation',
    wizard_reference: reference,
  }
}
