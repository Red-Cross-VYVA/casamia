import {
  ArrowRight,
  Award,
  BadgeCheck,
  Bath,
  Building2,
  CheckCircle2,
  Copy,
  Download,
  HeartHandshake,
  Lightbulb,
  Mail,
  MapPin,
  Megaphone,
  ShieldCheck,
  TrendingUp,
  UsersRound,
  Wrench,
  Zap,
} from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SEO } from '../components/SEO'
import {
  providerOnboardingSteps,
  providerCityOpportunities,
  providerEnablementResources,
  providerExpertisePillars,
  providerMarketingAssets,
  providerMarketingRules,
  providerMarketSignals,
  providerPartnerPaths,
  providerPriorityCities,
  providerProgrammeBenefits,
  providerQualityStandards,
  providerTrades,
} from '../constants/providerPartnership'
import { submitProviderApplication, type ProviderApplicationInput } from '../services/providerApplications'

type ProviderFormValues = ProviderApplicationInput

const initialValues: ProviderFormValues = {
  availability: '',
  businessName: '',
  cities: [],
  contactName: '',
  email: '',
  experience: '',
  insuranceConfirmed: false,
  phone: '',
  trades: [],
  website: '',
}

const partnerPathIcons = [Wrench, Bath, Lightbulb, Zap, UsersRound, HeartHandshake]
const marketingAssetIcons = [Award, BadgeCheck, Mail, Megaphone, Download, Copy]

const providerPartnerCopy = {
  en: {
    title: 'Provider Partnership Programme | CasaMia',
    metaDescription:
      'Join CasaMia’s provider network for senior home-safety adaptations, installation, smart safety setup and aftercare across Spain.',
    heroEyebrow: 'Provider partnership programme',
    heroTitle: 'Join the senior home-safety market before it becomes crowded.',
    heroBody:
      'CasaMia turns family concerns into clear, scoped home-safety projects. We are building a trusted provider network for senior-friendly adaptations, installation, smart safety setup and aftercare across Spain’s main cities.',
    proof: ['Assessed projects, not cold leads', 'Clear briefs before the visit', 'CasaMia coordinates the customer'],
    apply: 'Apply to collaborate',
    viewStandards: 'View standards',
    panelTitle: 'What partners receive',
    panelBody:
      'A clearer job: resident context, room priorities, agreed scope, family expectations and a handover standard before work starts.',
    workflowEyebrow: 'How the work flows',
    workflowTitle: 'CasaMia handles the messy middle, so providers can focus on quality work.',
    workflowBody:
      'We qualify the request, gather context, shape the scope, coordinate the family and keep the record clean. Approved providers step in when the work is ready to be priced, visited, installed or supported.',
    workflow: [
      { title: 'Qualified request', body: 'Home, resident context, photos, urgency and family priority are captured first.' },
      { title: 'Clear provider brief', body: 'You receive the room, scope, access notes, constraints and family expectations.' },
      { title: 'Coordinated delivery', body: 'CasaMia keeps the customer loop, changes, approvals and handover organised.' },
      { title: 'Documented outcome', body: 'Completion notes, photos, quality checks and follow-up stay attached to the project.' },
    ],
    marketEyebrow: 'Market opportunity',
    marketTitle: 'Senior home safety is becoming a mainstream service category.',
    marketBody:
      'Spain has an ageing population, families are trying to keep parents independent at home for longer, and homes often need practical adaptations before a crisis happens. CasaMia turns that need into a repeatable, professional workflow for local providers.',
    expertiseEyebrow: 'CasaMia expertise',
    expertiseTitle: 'We understand the senior space, not just installation work.',
    expertiseBody:
      'Good providers already know their trade. CasaMia adds the senior-specific layer: resident context, family communication, safety priorities, installation acceptance and follow-up.',
    profilesEyebrow: 'Partner profiles',
    profilesTitle: 'Multiple ways to collaborate.',
    profilesBody:
      'CasaMia needs dependable specialists across the practical services that make older homes easier and safer to use every day.',
    toolsEyebrow: 'Tools and resources',
    toolsTitle: 'We help collaborators deliver excellent work.',
    toolsBody:
      'CasaMia is not just a source of leads. We support partners with structure, context and practical tools so every home visit feels professional, respectful and well prepared.',
    marketingEyebrow: 'Marketing kit',
    marketingTitle: 'Help providers turn collaboration into local trust.',
    marketingBody:
      'Approved collaborators can use CasaMia partner materials to show they work in a specialist senior-safety network. The goal is simple: help good providers look more credible, win the right kind of work and explain the relationship clearly.',
    sample: 'Download sample',
    usageRules: 'Usage rules',
    standardsEyebrow: 'How collaboration works',
    standardsTitle: 'Clear standards, respectful work, better handovers.',
    standardsBody:
      'Providers remain independent businesses, but customer work is coordinated through CasaMia. Installers and subcontractors must not request direct customer payments or approve paid scope changes independently.',
    coverageEyebrow: 'Coverage focus',
    coverageTitle: 'Main city coverage first.',
    coverageBody:
      'CasaMia is prioritising strong provider coverage in major cities and surrounding areas, then expanding once service quality and response times are reliable.',
    cityEyebrow: 'City opportunity',
    cityTitle: 'Early partners can help define local coverage.',
    cityBody:
      'The first strong partners in each city help CasaMia understand response times, typical property layouts, trade depth and where families need the most support.',
    registrationEyebrow: 'Self-registration',
    registrationTitle: 'Apply to join the provider network.',
    registrationBody:
      'Share basic company details, coverage and service types. CasaMia will review fit before assigning any customer work.',
    fields: {
      businessName: 'Business name',
      contactName: 'Main contact',
      email: 'Email address',
      phone: 'Phone number',
      website: 'Website or profile',
      availability: 'Typical availability',
      availabilityPlaceholder: 'Example: weekdays, emergency callouts, 2-week lead time',
      cities: 'Coverage cities *',
      trades: 'Services offered *',
      experience: 'Relevant experience',
      insurance: 'I can provide insurance, trading details and references if CasaMia requests them.',
      submit: 'Submit provider application',
    },
    errors: {
      businessName: 'Enter your business name.',
      contactName: 'Enter the main contact name.',
      email: 'Enter an email address.',
      validEmail: 'Enter a valid email address.',
      phone: 'Enter a phone number.',
      cities: 'Select at least one city or coverage area.',
      trades: 'Select at least one service type.',
      experience: 'Tell us briefly about your relevant experience.',
      insuranceConfirmed: 'Confirm that insurance can be evidenced.',
    },
    submitted: (id: string) => `Application ${id} submitted. CasaMia will review your fit and city coverage.`,
    saved: (id: string) =>
      `Application ${id} saved locally for review. Deploy on Vercel with Supabase configured before using this as a live application inbox.`,
    marketSignals: providerMarketSignals,
    expertisePillars: providerExpertisePillars,
    benefits: providerProgrammeBenefits,
    partnerPaths: providerPartnerPaths,
    resources: providerEnablementResources,
    assets: providerMarketingAssets,
    rules: providerMarketingRules,
    standards: providerQualityStandards,
    onboarding: providerOnboardingSteps,
    opportunities: providerCityOpportunities,
    cityLabel: (city: string) => city,
    tradeLabel: (trade: string) => trade,
  },
  es: {
    title: 'Programa de colaboradores profesionales | CasaMia',
    metaDescription:
      'Únete a la red CasaMia de profesionales para adaptaciones senior, instalación, seguridad inteligente y seguimiento en España.',
    heroEyebrow: 'Programa de colaboradores',
    heroTitle: 'Únete al mercado de seguridad senior en el hogar antes de que se sature.',
    heroBody:
      'CasaMia convierte las preocupaciones familiares en proyectos claros de seguridad en el hogar. Estamos creando una red de profesionales para adaptaciones senior, instalación, seguridad inteligente y seguimiento en las principales ciudades de España.',
    proof: ['Proyectos evaluados, no leads fríos', 'Brief claro antes de la visita', 'CasaMia coordina al cliente'],
    apply: 'Solicitar colaboración',
    viewStandards: 'Ver estándares',
    panelTitle: 'Qué reciben los colaboradores',
    panelBody:
      'Un trabajo más claro: contexto de la persona, prioridades por estancia, alcance acordado, expectativas familiares y estándar de entrega antes de empezar.',
    workflowEyebrow: 'Cómo fluye el trabajo',
    workflowTitle: 'CasaMia gestiona la parte compleja para que los profesionales se centren en entregar bien.',
    workflowBody:
      'Cualificamos la solicitud, recogemos contexto, damos forma al alcance, coordinamos con la familia y dejamos el proyecto documentado. Los colaboradores aprobados entran cuando el trabajo ya está listo para valorar, visitar, instalar o mantener.',
    workflow: [
      { title: 'Solicitud cualificada', body: 'Primero recogemos vivienda, contexto de la persona, fotos, urgencia y prioridad familiar.' },
      { title: 'Brief claro', body: 'Recibes estancia, alcance, acceso, limitaciones y expectativas de la familia.' },
      { title: 'Entrega coordinada', body: 'CasaMia organiza cliente, cambios, aprobaciones y entrega.' },
      { title: 'Resultado documentado', body: 'Notas, fotos, comprobaciones de calidad y seguimiento quedan unidos al proyecto.' },
    ],
    marketEyebrow: 'Oportunidad de mercado',
    marketTitle: 'La seguridad senior en casa se está convirtiendo en una categoría principal.',
    marketBody:
      'España envejece, las familias quieren mantener a sus padres independientes durante más tiempo y muchas viviendas necesitan adaptaciones prácticas antes de una crisis. CasaMia convierte esa necesidad en un flujo profesional repetible para proveedores locales.',
    expertiseEyebrow: 'Experiencia CasaMia',
    expertiseTitle: 'Entendemos el mercado senior, no solo la instalación.',
    expertiseBody:
      'Los buenos profesionales ya dominan su oficio. CasaMia añade la capa específica senior: contexto del residente, comunicación familiar, prioridades de seguridad, aceptación de la instalación y seguimiento.',
    profilesEyebrow: 'Perfiles de colaboradores',
    profilesTitle: 'Varias formas de colaborar.',
    profilesBody:
      'CasaMia necesita especialistas fiables en los servicios prácticos que hacen que las viviendas de personas mayores sean más fáciles y seguras cada día.',
    toolsEyebrow: 'Herramientas y recursos',
    toolsTitle: 'Ayudamos a los colaboradores a entregar un trabajo excelente.',
    toolsBody:
      'CasaMia no es solo una fuente de oportunidades. Damos estructura, contexto y herramientas prácticas para que cada visita sea profesional, respetuosa y bien preparada.',
    marketingEyebrow: 'Kit de marketing',
    marketingTitle: 'Convierte la colaboración en confianza local.',
    marketingBody:
      'Los colaboradores aprobados pueden usar materiales de CasaMia para mostrar que trabajan dentro de una red especializada en seguridad senior. El objetivo es ayudar a buenos profesionales a verse más creíbles, captar el trabajo adecuado y explicar la relación con claridad.',
    sample: 'Descargar muestra',
    usageRules: 'Normas de uso',
    standardsEyebrow: 'Cómo funciona la colaboración',
    standardsTitle: 'Estándares claros, trabajo respetuoso y mejores entregas.',
    standardsBody:
      'Los proveedores siguen siendo empresas independientes, pero el trabajo con clientes se coordina a través de CasaMia. Instaladores y subcontratas no deben pedir pagos directos al cliente ni aprobar cambios de alcance de pago por su cuenta.',
    coverageEyebrow: 'Cobertura prioritaria',
    coverageTitle: 'Primero cobertura sólida en grandes ciudades.',
    coverageBody:
      'CasaMia prioriza una cobertura fuerte en ciudades principales y alrededores, y expande cuando la calidad del servicio y los tiempos de respuesta son fiables.',
    cityEyebrow: 'Oportunidad por ciudad',
    cityTitle: 'Los primeros colaboradores ayudan a definir la cobertura local.',
    cityBody:
      'Los primeros socios fuertes en cada ciudad ayudan a CasaMia a entender tiempos de respuesta, tipologías de vivienda, profundidad de oficios y dónde las familias necesitan más apoyo.',
    registrationEyebrow: 'Auto-registro',
    registrationTitle: 'Solicita unirte a la red de proveedores.',
    registrationBody:
      'Comparte datos básicos de empresa, cobertura y tipos de servicio. CasaMia revisará el encaje antes de asignar cualquier trabajo con clientes.',
    fields: {
      businessName: 'Nombre de la empresa',
      contactName: 'Contacto principal',
      email: 'Email',
      phone: 'Teléfono',
      website: 'Web o perfil',
      availability: 'Disponibilidad habitual',
      availabilityPlaceholder: 'Ejemplo: laborables, urgencias, plazo de 2 semanas',
      cities: 'Ciudades de cobertura *',
      trades: 'Servicios ofrecidos *',
      experience: 'Experiencia relevante',
      insurance: 'Puedo aportar seguro, datos de actividad y referencias si CasaMia lo solicita.',
      submit: 'Enviar solicitud de proveedor',
    },
    errors: {
      businessName: 'Introduce el nombre de la empresa.',
      contactName: 'Introduce el nombre del contacto principal.',
      email: 'Introduce un email.',
      validEmail: 'Introduce un email válido.',
      phone: 'Introduce un teléfono.',
      cities: 'Selecciona al menos una ciudad o zona de cobertura.',
      trades: 'Selecciona al menos un tipo de servicio.',
      experience: 'Cuéntanos brevemente tu experiencia relevante.',
      insuranceConfirmed: 'Confirma que puedes acreditar el seguro.',
    },
    submitted: (id: string) => `Solicitud ${id} enviada. CasaMia revisará el encaje y la cobertura por ciudad.`,
    saved: (id: string) =>
      `Solicitud ${id} guardada localmente para revisión. Despliega en Vercel con Supabase configurado antes de usarlo como bandeja real de solicitudes.`,
    marketSignals: [
      { value: 'Viviendas que envejecen', label: 'Más familias necesitan adaptaciones prácticas que mantengan la independencia en casa.' },
      { value: 'Falta de especialistas', label: 'Muchos oficios instalan productos, pero menos entienden rutinas senior, dignidad y contexto de riesgo.' },
      { value: 'Despliegue urbano', label: 'CasaMia crea cobertura fiable ciudad por ciudad, empezando donde la demanda y la logística pueden escalar.' },
    ],
    expertisePillars: [
      { title: 'Diseño de proyecto senior-first', body: 'CasaMia revisa residente, rutinas, cambios de movilidad, preocupaciones familiares y riesgo estancia por estancia antes de recomendar trabajos.' },
      { title: 'Seguridad práctica, no venta de productos', body: 'Las recomendaciones se centran en transferencias, umbrales, iluminación, puntos de apoyo, baño, rutas nocturnas y entrega segura.' },
      { title: 'Recorrido profesional del cliente', body: 'Los proveedores trabajan dentro de un flujo estructurado: evaluación, plan acotado, briefing de instalación, aceptación y notas de seguimiento.' },
      { title: 'Confianza con familias', body: 'CasaMia sigue como punto central de contacto para que las familias sepan quién responde y los proveedores se concentren en entregar calidad.' },
    ],
    benefits: [
      { title: 'Demanda local cualificada', body: 'CasaMia canaliza proyectos evaluados hacia proveedores capaces de entregar con respeto, limpieza y puntualidad.' },
      { title: 'Alcance claro antes de la visita', body: 'Los proveedores reciben briefing, fotos o notas disponibles y expectativas definidas antes de empezar.' },
      { title: 'Coordinación central', body: 'CasaMia mantiene el contacto con el cliente, gestiona el flujo y reduce idas y vueltas para el proveedor.' },
      { title: 'Cobertura recurrente por ciudad', body: 'El programa está diseñado para crear cobertura fiable en las principales ciudades de España y alrededores.' },
    ],
    partnerPaths: [
      { title: 'Instaladores de accesibilidad', body: 'Barras, rampas, umbrales, puntos de apoyo y rutas de movimiento más seguras.' },
      { title: 'Especialistas en baño', body: 'Duchas seguras, entrada al plato, apoyo de inodoro, ayudas de transferencia y antideslizantes.' },
      { title: 'Equipos eléctricos e iluminación', body: 'Iluminación por movimiento, visibilidad en escaleras, rutas nocturnas, interruptores y accesos.' },
      { title: 'Técnicos de seguridad inteligente', body: 'Sensores, alertas, botones de emergencia, conectividad y configuración para tranquilidad familiar.' },
      { title: 'Terapeutas ocupacionales', body: 'Evaluación centrada en la persona, contexto de movilidad y prioridades prácticas de adaptación.' },
      { title: 'Proveedores de seguimiento', body: 'Mantenimiento, ajustes menores, apoyo de entrega y visitas de seguimiento.' },
    ],
    resources: [
      { title: 'Briefings estructurados', body: 'Contexto del cliente, prioridades por estancia, fotos disponibles, alcance acordado, notas de acceso y prioridades de seguridad antes de la visita.' },
      { title: 'Playbooks de seguridad senior', body: 'Guías prácticas para baños, escaleras, entradas, dormitorios, iluminación, transferencias y entrega de seguridad inteligente.' },
      { title: 'Plantillas de propuesta y entrega', body: 'Formatos reutilizables para alcance, notas de finalización, registros de producto, comprobaciones de seguridad e instrucciones al cliente.' },
      { title: 'Bucle de calidad', body: 'CasaMia recoge feedback familiar, resultados de instalación y notas de seguimiento para que los mejores proveedores sigan mejorando.' },
      { title: 'Coordinación operativa', body: 'Apoyo con planificación, comunicación con clientes, cambios de alcance y expectativas de seguimiento.' },
      { title: 'Formación y onboarding', body: 'Módulos breves para entender comunicación senior, trabajo sin presión, documentación y estándares de aceptación.' },
    ],
    assets: [
      { title: 'Sello de colaborador aprobado', body: 'Insignia para web y propuestas tras revisión y aceptación en la red CasaMia.', format: 'Insignia SVG', usage: 'Pie de web, presupuestos, landing pages' },
      { title: 'Insignia de partner de seguridad senior', body: 'Sello más suave para perfiles y galerías centradas en hogares seguros para mayores.', format: 'Insignia SVG', usage: 'Portfolio, galerías antes/después, páginas locales' },
      { title: 'Bloque de firma de email', body: 'Firma breve para explicar la colaboración con CasaMia en comunicaciones diarias.', format: 'Firma HTML', usage: 'Firmas de email, facturas, seguimiento' },
      { title: 'Texto para anuncio social', body: 'Texto de lanzamiento para LinkedIn, Facebook o Google Business Profile al unirse al programa.', format: 'Texto breve', usage: 'Redes sociales y perfiles locales' },
      { title: 'Concepto de vinilo para ventana o vehículo', body: 'Concepto sencillo adaptable para vehículos, oficinas o showrooms aprobados.', format: 'Concepto SVG', usage: 'Vehículo, escaparate, mostrador' },
      { title: 'Párrafo de confianza para web', body: 'Texto para explicar en la web cómo se coordinan los proyectos CasaMia.', format: 'Texto breve', usage: 'Sobre nosotros, servicios, landing partner' },
    ],
    rules: [
      'Usar materiales CasaMia solo tras aprobación escrita.',
      'No sugerir que el proveedor pertenece o está empleado por CasaMia.',
      'No usar “certificado” salvo que CasaMia emita un programa específico.',
      'No sugerir respaldo público ni aprobación de ayudas.',
      'Retirar insignias y firmas si la colaboración termina o queda pausada.',
    ],
    standards: [
      'Registro profesional activo o datos equivalentes de actividad.',
      'Seguro adecuado para los servicios ofrecidos.',
      'Trabajo respetuoso en viviendas ocupadas por personas mayores.',
      'Capacidad para aportar disponibilidad, datos de precio y notas de finalización.',
      'Disposición a seguir normas CasaMia de entrega, seguridad y no cobro directo.',
      'Compromiso de documentar defectos materiales o alcance incompleto con honestidad.',
    ],
    onboarding: [
      'Enviar datos básicos de empresa y servicios online.',
      'CasaMia revisa cobertura, encaje de oficio, seguro y referencias.',
      'Llamada breve de onboarding sobre trato al cliente y estándares.',
      'Los proveedores aprobados reciben oportunidades cuando la cobertura encaja.',
    ],
    opportunities: [
      { city: 'Madrid', status: 'Alta prioridad', note: 'Gran área metropolitana y fuerte demanda de decisores familiares.' },
      { city: 'Barcelona', status: 'Alta prioridad', note: 'Viviendas urbanas densas, edificios antiguos y necesidad amplia de cobertura.' },
      { city: 'Valencia', status: 'Alta prioridad', note: 'Gran ciudad costera con oportunidad en accesibilidad y envejecimiento en casa.' },
      { city: 'Málaga', status: 'Construyendo red', note: 'Mercado senior e internacional en crecimiento en la costa.' },
      { city: 'Alicante', status: 'Construyendo red', note: 'Alto potencial de cobertura costera y necesidades recurrentes de adaptación.' },
      { city: 'Sevilla', status: 'Construyendo red', note: 'Hub regional para adaptación de vivienda y servicios prácticos de seguridad.' },
      { city: 'Bilbao', status: 'Próxima apertura', note: 'Cobertura prioritaria en el norte cuando se confirme profundidad de partners.' },
      { city: 'Zaragoza', status: 'Próxima apertura', note: 'Ciudad conectora clave para ampliar cobertura regional.' },
    ],
    cityLabel: (city: string) =>
      ({ Seville: 'Sevilla', Malaga: 'Málaga' })[city as 'Seville' | 'Malaga'] ?? city,
    tradeLabel: (trade: string) =>
      ({
        'Accessibility adaptations': 'Adaptaciones de accesibilidad',
        'Bathroom safety': 'Seguridad en baños',
        'Stair rails and handrails': 'Barandillas y pasamanos',
        'Electrical and lighting': 'Electricidad e iluminación',
        'Smart home and sensors': 'Hogar inteligente y sensores',
        'General building works': 'Obras generales',
        'Occupational therapy assessment': 'Evaluación de terapia ocupacional',
        'Maintenance and aftercare': 'Mantenimiento y seguimiento',
      })[trade] ?? trade,
  },
} as const

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function createPartnerBadgeSvg(title: string, subtitle: string, accent: 'blue' | 'green' = 'green') {
  const accentColor = accent === 'green' ? '#7DB841' : '#1F6A98'

  return `<svg width="900" height="420" viewBox="0 0 900 420" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="900" height="420" rx="42" fill="${accentColor}"/>
  <rect x="26" y="26" width="848" height="368" rx="32" fill="#FFFFFF"/>
  <rect x="52" y="52" width="796" height="316" rx="26" fill="#EAF5FC"/>
  <rect x="52" y="52" width="796" height="88" rx="26" fill="#071F3A"/>
  <text x="84" y="109" fill="#FFFFFF" font-family="Georgia, 'Times New Roman', serif" font-size="44" font-weight="700">Casa</text>
  <text x="197" y="109" fill="#3A9FD4" font-family="Georgia, 'Times New Roman', serif" font-size="44" font-weight="700">Mia</text>
  <text x="705" y="103" fill="#FFFFFF" font-family="Arial, Helvetica, sans-serif" font-size="18" font-weight="800" text-anchor="middle" letter-spacing="2">PARTNER NETWORK</text>
  <circle cx="158" cy="236" r="72" fill="#FFFFFF"/>
  <path d="M158 151L212 174V218C212 263 187 292 158 306C129 292 104 263 104 218V174L158 151Z" fill="${accentColor}"/>
  <path d="M130 226L151 247L190 201" stroke="#FFFFFF" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="270" y="218" fill="#071F3A" font-family="Georgia, 'Times New Roman', serif" font-size="52" font-weight="700">${title}</text>
  <text x="272" y="263" fill="#1F6A98" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="800">${subtitle}</text>
  <text x="272" y="305" fill="#344154" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="600">Senior home-safety projects coordinated through CasaMia.</text>
  <text x="272" y="332" fill="#344154" font-family="Arial, Helvetica, sans-serif" font-size="16" font-weight="600">Provider remains an independent business.</text>
</svg>`
}

function createMarketingAssetContent(title: string) {
  if (title.includes('Email')) {
    return `<table role="presentation" cellpadding="0" cellspacing="0" style="font-family: Arial, Helvetica, sans-serif; color:#071F3A;">
  <tr>
    <td style="border-left:4px solid #7DB841; padding-left:14px;">
      <div style="font-size:18px; font-weight:800;">[Provider Name]</div>
      <div style="font-size:13px; color:#344154; margin-top:2px;">CasaMia approved collaborator</div>
      <div style="font-size:12px; color:#1F6A98; font-weight:700; margin-top:8px;">Senior home-safety projects coordinated through CasaMia</div>
      <div style="font-size:11px; color:#667085; margin-top:6px;">Independent provider. No direct customer payment requests.</div>
    </td>
  </tr>
</table>`
  }

  if (title.includes('Social')) {
    return `We are pleased to collaborate with CasaMia on senior home-safety projects.

CasaMia coordinates resident-centred assessments, practical adaptation plans and family handover. Our role is to help deliver careful local work for older people who want to live more safely at home.

#SeniorSafety #AgeingAtHome #HomeAdaptations #CasaMia`
  }

  if (title.includes('Website')) {
    return `We collaborate with CasaMia on selected senior home-safety projects. CasaMia coordinates the customer journey, project brief and family communication, while our team supports local delivery within agreed scope and safety standards.`
  }

  if (title.includes('Window')) {
    return createPartnerBadgeSvg('CasaMia collaborator', 'Senior home-safety provider', 'green')
  }

  if (title.includes('Senior')) {
    return createPartnerBadgeSvg('Senior home-safety partner', 'In collaboration with CasaMia', 'green')
  }

  return createPartnerBadgeSvg('CasaMia approved collaborator', 'Senior home-safety network', 'green')
}

function downloadMarketingAsset(title: string, format: string) {
  const content = createMarketingAssetContent(title)
  const isSvg = format.includes('SVG')
  const isHtml = format.includes('HTML')
  const safeName = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const blob = new Blob([content], {
    type: isSvg ? 'image/svg+xml;charset=utf-8' : isHtml ? 'text/html;charset=utf-8' : 'text/plain;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `casamia-${safeName}.${isSvg ? 'svg' : isHtml ? 'html' : 'txt'}`
  link.click()
  URL.revokeObjectURL(url)
}

function getMarketingAssetVariant(title: string) {
  if (title.includes('Senior')) return 'senior'
  if (title.includes('Email')) return 'email'
  if (title.includes('Social')) return 'social'
  if (title.includes('Window')) return 'sticker'
  if (title.includes('Website')) return 'website'
  return 'seal'
}

export function ProviderPartnersPage() {
  const { i18n } = useTranslation()
  const isSpanish = i18n.language.toLowerCase().startsWith('es')
  const copy = isSpanish ? providerPartnerCopy.es : providerPartnerCopy.en
  const [values, setValues] = useState<ProviderFormValues>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submissionMessage, setSubmissionMessage] = useState('')
  const schema = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: copy.title,
      description: copy.metaDescription,
      url: 'https://casamia.com.es/provider-partners',
      inLanguage: isSpanish ? 'es-ES' : 'en',
      about: ['senior home safety provider network', 'home adaptation installation', 'provider onboarding'],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      '@id': 'https://casamia.com.es/provider-partners#provider-onboarding',
      name: copy.registrationTitle,
      description: copy.registrationBody,
      step: copy.onboarding.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: step,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      '@id': 'https://casamia.com.es/provider-partners#partner-profiles',
      name: copy.profilesTitle,
      itemListElement: copy.partnerPaths.map((path, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: path.title,
        description: path.body,
      })),
    },
  ]

  function updateValue<Field extends keyof ProviderFormValues>(field: Field, value: ProviderFormValues[Field]) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
    setSubmissionMessage('')
  }

  function toggleListValue(field: 'cities' | 'trades', value: string) {
    setValues((current) => {
      const selected = current[field].includes(value)
        ? current[field].filter((item) => item !== value)
        : [...current[field], value]

      return { ...current, [field]: selected }
    })
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  function validate() {
    const nextErrors: Record<string, string> = {}
    if (!values.businessName.trim()) nextErrors.businessName = copy.errors.businessName
    if (!values.contactName.trim()) nextErrors.contactName = copy.errors.contactName
    if (!values.email.trim()) nextErrors.email = copy.errors.email
    if (values.email.trim() && !isValidEmail(values.email)) nextErrors.email = copy.errors.validEmail
    if (!values.phone.trim()) nextErrors.phone = copy.errors.phone
    if (values.cities.length === 0) nextErrors.cities = copy.errors.cities
    if (values.trades.length === 0) nextErrors.trades = copy.errors.trades
    if (!values.experience.trim()) nextErrors.experience = copy.errors.experience
    if (!values.insuranceConfirmed) nextErrors.insuranceConfirmed = copy.errors.insuranceConfirmed
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validate()) return

    const result = await submitProviderApplication(values)
    if (!result.ok) {
      setSubmissionMessage(result.reason)
      return
    }

    setValues(initialValues)
    setSubmissionMessage(
        result.storedInBackend
          ? copy.submitted(result.application.id)
          : copy.saved(result.application.id),
    )
  }

  return (
    <>
      <SEO title={copy.title} description={copy.metaDescription} path="/provider-partners" schema={schema} />

      <section className="provider-hero">
        <div className="site-shell provider-hero-grid">
          <div>
            <p className="eyebrow">{copy.heroEyebrow}</p>
            <h1>{copy.heroTitle}</h1>
            <p>{copy.heroBody}</p>
            <div className="provider-hero-proof">
              <span>
                <TrendingUp size={18} aria-hidden="true" />
                {copy.proof[0]}
              </span>
              <span>
                <ShieldCheck size={18} aria-hidden="true" />
                {copy.proof[1]}
              </span>
              <span>
                <MapPin size={18} aria-hidden="true" />
                {copy.proof[2]}
              </span>
            </div>
            <div className="provider-hero-actions">
              <a className="btn btn-green" href="#provider-registration">
                {copy.apply}
                <ArrowRight size={20} aria-hidden="true" />
              </a>
              <a className="btn btn-white" href="#provider-standards">
                {copy.viewStandards}
              </a>
            </div>
          </div>
          <aside className="provider-hero-panel">
            <Building2 size={34} aria-hidden="true" />
            <h2>{copy.panelTitle}</h2>
            <p>{copy.panelBody}</p>
            <div className="provider-hero-mini-flow" aria-label={copy.workflowEyebrow}>
              <span>{isSpanish ? 'Contexto' : 'Context'}</span>
              <ArrowRight size={15} aria-hidden="true" />
              <span>{isSpanish ? 'Alcance' : 'Scope'}</span>
              <ArrowRight size={15} aria-hidden="true" />
              <span>{isSpanish ? 'Entrega' : 'Delivery'}</span>
            </div>
            <div className="provider-city-strip">
              {providerPriorityCities.slice(0, 6).map((city) => (
                <span key={city}>{copy.cityLabel(city)}</span>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="provider-workflow-section section-pad bg-white">
        <div className="site-shell provider-workflow-layout">
          <div>
            <p className="eyebrow">{copy.workflowEyebrow}</p>
            <h2 className="display-title">{copy.workflowTitle}</h2>
            <p>{copy.workflowBody}</p>
          </div>
          <div className="provider-workflow-grid">
            {copy.workflow.map((step, index) => {
              const icons = [UsersRound, ShieldCheck, Wrench, BadgeCheck]
              const Icon = icons[index] ?? CheckCircle2

              return (
                <article key={step.title} data-step={String(index + 1).padStart(2, '0')}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <Icon size={24} aria-hidden="true" />
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="provider-market-section section-pad">
        <div className="site-shell">
          <div className="provider-section-heading">
            <p className="eyebrow">{copy.marketEyebrow}</p>
            <h2 className="display-title">{copy.marketTitle}</h2>
            <p>{copy.marketBody}</p>
          </div>
          <div className="provider-market-grid">
            {copy.marketSignals.map((signal) => (
              <article key={signal.value}>
                <strong>{signal.value}</strong>
                <p>{signal.label}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="site-shell provider-two-column">
          <div>
            <p className="eyebrow">{copy.expertiseEyebrow}</p>
            <h2 className="display-title">{copy.expertiseTitle}</h2>
            <p>{copy.expertiseBody}</p>
          </div>
          <div className="provider-expertise-grid">
            {copy.expertisePillars.map((pillar) => (
              <article key={pillar.title}>
                <h3>{pillar.title}</h3>
                <p>{pillar.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="site-shell provider-benefit-grid">
          {copy.benefits.map((benefit) => (
            <article className="provider-benefit-card" key={benefit.title}>
              <BadgeCheck size={25} aria-hidden="true" />
              <h2>{benefit.title}</h2>
              <p>{benefit.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-pad bg-light-blue">
        <div className="site-shell">
          <div className="provider-section-heading">
            <p className="eyebrow">{copy.profilesEyebrow}</p>
            <h2 className="display-title">{copy.profilesTitle}</h2>
            <p>{copy.profilesBody}</p>
          </div>
          <div className="provider-path-grid">
            {copy.partnerPaths.map((path, index) => {
              const Icon = partnerPathIcons[index] ?? Wrench

              return (
                <article key={path.title}>
                  <Icon size={24} aria-hidden="true" />
                  <h3>{path.title}</h3>
                  <p>{path.body}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="site-shell provider-two-column">
          <div>
            <p className="eyebrow">{copy.toolsEyebrow}</p>
            <h2 className="display-title">{copy.toolsTitle}</h2>
            <p>{copy.toolsBody}</p>
          </div>
          <div className="provider-enable-grid">
            {copy.resources.map((resource) => (
              <article key={resource.title}>
                <CheckCircle2 size={18} aria-hidden="true" />
                <div>
                  <h3>{resource.title}</h3>
                  <p>{resource.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="provider-marketing-section section-pad">
        <div className="site-shell">
          <div className="provider-section-heading">
            <p className="eyebrow">{copy.marketingEyebrow}</p>
            <h2 className="display-title">{copy.marketingTitle}</h2>
            <p>{copy.marketingBody}</p>
          </div>

          <div className="provider-marketing-grid">
            {copy.assets.map((asset, index) => {
              const Icon = marketingAssetIcons[index] ?? BadgeCheck
              const variant = getMarketingAssetVariant(asset.title)

              return (
                <article key={asset.title}>
                  <div className={`provider-marketing-preview is-${variant}`}>
                    {variant === 'seal' || variant === 'senior' || variant === 'sticker' ? (
                      <div className="provider-brand-sample">
                        <div className="provider-brand-topline">
                          <span>Casa</span>
                          <span>Mia</span>
                        </div>
                        <div className="provider-brand-mark">
                          <ShieldCheck size={30} aria-hidden="true" />
                        </div>
                        <strong>
                          {variant === 'senior'
                            ? isSpanish
                              ? 'Partner de seguridad senior'
                              : 'Senior home-safety partner'
                            : variant === 'sticker'
                              ? isSpanish
                                ? 'Colaborador CasaMia'
                                : 'CasaMia collaborator'
                              : isSpanish
                                ? 'Colaborador aprobado'
                                : 'Approved collaborator'}
                        </strong>
                        <small>
                          {variant === 'sticker'
                            ? isSpanish
                              ? 'Vinilo para vehículo / ventana'
                              : 'Vehicle / window decal'
                            : isSpanish
                              ? 'Entrega local de confianza'
                              : 'Trusted local delivery'}
                        </small>
                      </div>
                    ) : variant === 'email' ? (
                      <div className="provider-signature-preview">
                        <strong>{isSpanish ? 'Nombre del proveedor' : 'Provider Name'}</strong>
                        <span>{isSpanish ? 'Colaborador aprobado CasaMia' : 'CasaMia approved collaborator'}</span>
                        <small>
                          {isSpanish
                            ? 'Proyectos de seguridad senior coordinados por CasaMia'
                            : 'Senior home-safety projects coordinated through CasaMia'}
                        </small>
                      </div>
                    ) : variant === 'social' ? (
                      <div className="provider-social-preview">
                        <span>{isSpanish ? 'Nueva colaboración' : 'New collaboration'}</span>
                        <strong>
                          {isSpanish
                            ? 'Colaboramos con CasaMia en proyectos de seguridad senior'
                            : 'Working with CasaMia on senior home-safety projects'}
                        </strong>
                        <small>#AgeingAtHome #HomeAdaptations</small>
                      </div>
                    ) : variant === 'website' ? (
                      <div className="provider-website-preview">
                        <span>{isSpanish ? 'En colaboración con' : 'In collaboration with'}</span>
                        <strong>
                          Casa<span>Mia</span>
                        </strong>
                        <small>
                          {isSpanish
                            ? 'Evaluación centrada en la persona, adaptación práctica y entrega familiar.'
                            : 'Resident-centred assessment, practical adaptation and family handover.'}
                        </small>
                      </div>
                    ) : (
                      <Icon size={30} aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <p className="provider-marketing-format">{asset.format}</p>
                    <h3>{asset.title}</h3>
                    <p>{asset.body}</p>
                    <span>{asset.usage}</span>
                  </div>
                  <button className="btn btn-white" type="button" onClick={() => downloadMarketingAsset(asset.title, asset.format)}>
                    {copy.sample}
                    <Download size={18} aria-hidden="true" />
                  </button>
                </article>
              )
            })}
          </div>

          <aside className="provider-marketing-rules">
            <h3>{copy.usageRules}</h3>
            <div>
              {copy.rules.map((rule) => (
                <p key={rule}>
                  <CheckCircle2 size={17} aria-hidden="true" />
                  {rule}
                </p>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="section-pad bg-light-blue" id="provider-standards">
        <div className="site-shell provider-two-column">
          <div>
            <p className="eyebrow">{copy.standardsEyebrow}</p>
            <h2 className="display-title">{copy.standardsTitle}</h2>
            <p>{copy.standardsBody}</p>
          </div>
          <div className="provider-list-card">
            {copy.standards.map((standard) => (
              <p key={standard}>
                <CheckCircle2 size={18} aria-hidden="true" />
                {standard}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="site-shell provider-two-column">
          <div className="provider-step-list">
            {copy.onboarding.map((step, index) => (
              <article key={step}>
                <span>{index + 1}</span>
                <p>{step}</p>
              </article>
            ))}
          </div>
          <div>
            <p className="eyebrow">{copy.coverageEyebrow}</p>
            <h2 className="display-title">{copy.coverageTitle}</h2>
            <p>{copy.coverageBody}</p>
          </div>
        </div>
      </section>

      <section className="section-pad provider-city-section">
        <div className="site-shell">
          <div className="provider-section-heading">
            <p className="eyebrow">{copy.cityEyebrow}</p>
            <h2 className="display-title">{copy.cityTitle}</h2>
            <p>{copy.cityBody}</p>
          </div>
          <div className="provider-city-grid">
            {copy.opportunities.map((opportunity) => (
              <article key={opportunity.city}>
                <div>
                  <strong>{opportunity.city}</strong>
                  <span>{opportunity.status}</span>
                </div>
                <p>{opportunity.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad provider-registration-section" id="provider-registration">
        <div className="site-shell provider-registration-layout">
          <div>
            <p className="eyebrow">{copy.registrationEyebrow}</p>
            <h2 className="display-title">{copy.registrationTitle}</h2>
            <p>{copy.registrationBody}</p>
          </div>

          <form className="provider-registration-form" onSubmit={handleSubmit}>
            <ProviderField error={errors.businessName} label={copy.fields.businessName}>
              <input value={values.businessName} onChange={(event) => updateValue('businessName', event.target.value)} />
            </ProviderField>
            <ProviderField error={errors.contactName} label={copy.fields.contactName}>
              <input value={values.contactName} onChange={(event) => updateValue('contactName', event.target.value)} />
            </ProviderField>
            <ProviderField error={errors.email} label={copy.fields.email}>
              <input type="email" value={values.email} onChange={(event) => updateValue('email', event.target.value)} />
            </ProviderField>
            <ProviderField error={errors.phone} label={copy.fields.phone}>
              <input value={values.phone} onChange={(event) => updateValue('phone', event.target.value)} />
            </ProviderField>
            <ProviderField label={copy.fields.website}>
              <input value={values.website} onChange={(event) => updateValue('website', event.target.value)} />
            </ProviderField>
            <ProviderField label={copy.fields.availability}>
              <input
                placeholder={copy.fields.availabilityPlaceholder}
                value={values.availability}
                onChange={(event) => updateValue('availability', event.target.value)}
              />
            </ProviderField>

            <fieldset className="provider-choice-group">
              <legend>{copy.fields.cities}</legend>
              <div>
                {providerPriorityCities.map((city) => (
                  <label key={city}>
                    <input
                      checked={values.cities.includes(city)}
                      type="checkbox"
                      onChange={() => toggleListValue('cities', city)}
                    />
                    <MapPin size={15} aria-hidden="true" />
                    {copy.cityLabel(city)}
                  </label>
                ))}
              </div>
              {errors.cities ? <small>{errors.cities}</small> : null}
            </fieldset>

            <fieldset className="provider-choice-group">
              <legend>{copy.fields.trades}</legend>
              <div>
                {providerTrades.map((trade) => (
                  <label key={trade}>
                    <input
                      checked={values.trades.includes(trade)}
                      type="checkbox"
                      onChange={() => toggleListValue('trades', trade)}
                    />
                    <ShieldCheck size={15} aria-hidden="true" />
                    {copy.tradeLabel(trade)}
                  </label>
                ))}
              </div>
              {errors.trades ? <small>{errors.trades}</small> : null}
            </fieldset>

            <ProviderField error={errors.experience} label={copy.fields.experience}>
              <textarea
                rows={4}
                value={values.experience}
                onChange={(event) => updateValue('experience', event.target.value)}
              />
            </ProviderField>

            <label className="provider-confirmation">
              <input
                checked={values.insuranceConfirmed}
                type="checkbox"
                onChange={(event) => updateValue('insuranceConfirmed', event.target.checked)}
              />
              <span>{copy.fields.insurance}</span>
            </label>
            {errors.insuranceConfirmed ? <small className="provider-error">{errors.insuranceConfirmed}</small> : null}

            {submissionMessage ? <p className="provider-submission-message">{submissionMessage}</p> : null}

            <button className="btn btn-green" type="submit">
              {copy.fields.submit}
              <ArrowRight size={20} aria-hidden="true" />
            </button>
          </form>
        </div>
      </section>
    </>
  )
}

function ProviderField({
  children,
  error,
  label,
}: {
  children: ReactNode
  error?: string
  label: string
}) {
  return (
    <label className="provider-field">
      <span>{label}</span>
      {children}
      {error ? <small>{error}</small> : null}
    </label>
  )
}
