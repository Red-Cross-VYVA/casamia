import type { WizardResult } from '../types/wizard'

export type WizardConsumerPlan = Exclude<WizardResult['selectedPlan'], 'business-consultation'>

export type WizardPlanPackage = {
  id: WizardConsumerPlan
  price: string
  summary: string
  outcome: string
  components: string[]
}

const englishPackages: WizardPlanPackage[] = [
  {
    id: 'assessment',
    price: 'EUR 99',
    summary: 'A professional home review and a clear action plan.',
    outcome: 'Know what to improve first, with no obligation to continue.',
    components: [
      'Home visit with a qualified reviewer',
      'Room-by-room safety and access review',
      'Key measurements for recommended work',
      'Written priorities and proposed next steps',
      'Visit fee credited when eligible work goes ahead',
    ],
  },
  {
    id: 'home-safety',
    price: 'From EUR 300',
    summary: 'Practical adaptations, professionally managed from review to handover.',
    outcome: 'A safer home with the right products, installation and follow-through.',
    components: [
      'Home assessment and agreed scope',
      'Selected safety products and adaptations',
      'Verified local installation professional',
      'CasaMia scheduling and project coordination',
      'Final safety check and customer handover',
    ],
  },
  {
    id: 'smart-safety',
    price: 'Custom quote',
    summary: 'Connected support for alerts, lighting and everyday reassurance.',
    outcome: 'Simple technology that supports safety without complicating daily life.',
    components: [
      'Home and device compatibility review',
      'Selected alerts, sensors or motion lighting',
      'Professional setup, testing and alert routing',
      'User and family handover',
      'Optional ongoing connected support',
    ],
  },
]

const spanishPackages: WizardPlanPackage[] = [
  {
    id: 'assessment',
    price: '99 EUR',
    summary: 'Revisión profesional de la vivienda y un plan de acción claro.',
    outcome: 'Sabrás qué mejorar primero, sin obligación de continuar.',
    components: [
      'Visita a domicilio con un profesional cualificado',
      'Revisión de seguridad y accesos estancia por estancia',
      'Medidas clave para las mejoras recomendadas',
      'Prioridades y siguientes pasos por escrito',
      'Importe de la visita descontable en obras elegibles',
    ],
  },
  {
    id: 'home-safety',
    price: 'Desde 300 EUR',
    summary: 'Adaptaciones prácticas gestionadas desde la revisión hasta la entrega.',
    outcome: 'Una vivienda más segura, con producto, instalación y seguimiento incluidos.',
    components: [
      'Evaluación de la vivienda y alcance acordado',
      'Productos y adaptaciones de seguridad seleccionados',
      'Instalador local verificado',
      'Coordinación de agenda y trabajos por CasaMia',
      'Comprobación final de seguridad y entrega',
    ],
  },
  {
    id: 'smart-safety',
    price: 'Presupuesto a medida',
    summary: 'Apoyo conectado para alertas, iluminación y tranquilidad diaria.',
    outcome: 'Tecnología sencilla que aporta seguridad sin complicar la rutina.',
    components: [
      'Revisión de la vivienda y compatibilidad',
      'Alertas, sensores o iluminación con movimiento',
      'Instalación, pruebas y configuración de avisos',
      'Explicación al usuario y la familia',
      'Soporte conectado continuo opcional',
    ],
  },
]

export function getWizardPlanPackages(language: string): WizardPlanPackage[] {
  return language.toLowerCase().startsWith('es') ? spanishPackages : englishPackages
}
