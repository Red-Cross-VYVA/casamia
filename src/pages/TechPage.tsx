import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BellRing,
  Bluetooth,
  Check,
  ChevronRight,
  CircleCheckBig,
  Cloud,
  Database,
  HeartPulse,
  House,
  Laptop,
  Link2,
  LockKeyhole,
  MonitorSmartphone,
  Network,
  PhoneCall,
  Radio,
  Scale,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  Thermometer,
  UserRoundCheck,
  UsersRound,
  Video,
  Wifi,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { SafeImage } from '../components/SafeImage'
import { SEO } from '../components/SEO'
import { formatServicePrice, useServicesByRoom } from '../services/serviceCatalogue'
import '../styles/tech-page.css'

type LanguageKey = 'en' | 'es'

type TechIconName =
  | 'activity'
  | 'bell'
  | 'bluetooth'
  | 'cloud'
  | 'database'
  | 'heart'
  | 'home'
  | 'laptop'
  | 'link'
  | 'lock'
  | 'monitor'
  | 'network'
  | 'phone'
  | 'radio'
  | 'scale'
  | 'shield'
  | 'smartphone'
  | 'stethoscope'
  | 'thermometer'
  | 'user'
  | 'users'
  | 'video'
  | 'wifi'
  | 'wrench'

const iconMap: Record<TechIconName, LucideIcon> = {
  activity: Activity,
  bell: BellRing,
  bluetooth: Bluetooth,
  cloud: Cloud,
  database: Database,
  heart: HeartPulse,
  home: House,
  laptop: Laptop,
  link: Link2,
  lock: LockKeyhole,
  monitor: MonitorSmartphone,
  network: Network,
  phone: PhoneCall,
  radio: Radio,
  scale: Scale,
  shield: ShieldCheck,
  smartphone: Smartphone,
  stethoscope: Stethoscope,
  thermometer: Thermometer,
  user: UserRoundCheck,
  users: UsersRound,
  video: Video,
  wifi: Wifi,
  wrench: Wrench,
}

const techCopy = {
  en: {
    lang: 'en',
    seoTitle: 'Connected Health Devices, Home Clinic & Telehealth Spain',
    seoDescription:
      'CasaMia connects compatible health and safety devices to your existing app or care system, or provides a complete resident app, family view, professional dashboard, Home Clinic and telehealth setup.',
    serviceType: 'Connected health device integration, Home Clinic and telehealth setup',
    hero: {
      eyebrow: 'Connected health at home',
      title: 'Connect the health technology you already have.',
      accent: 'Or let us provide the complete system.',
      body:
        'CasaMia connects compatible health, wellbeing and safety devices to the app or care platform you already use. If you do not have one, we provide the resident experience, family view and professional dashboard—installed, configured and supported as one service.',
      primaryCta: 'Plan my integration',
      secondaryCta: 'Explore the service',
      proof: ['Keep your current system', 'Connect compatible devices', 'CasaMia platform available'],
      visualEyebrow: 'One connected service',
      visualTitle: 'From device to the right person',
      visualSummary: 'Health and home-safety devices connect through an integration and setup layer to your existing system or the CasaMia platform.',
      sources: ['Health devices', 'Home safety', 'Daily routines'],
      hub: 'Integration & setup',
      routeLabel: 'API · Cloud · Device',
      destinations: ['Your app or system', 'CasaMia platform'],
      checks: ['Compatibility reviewed', 'Permissions agreed', 'People onboarded'],
    },
    sectionNav: {
      label: 'Explore connected care',
      items: [
        { label: 'How we connect', href: '#integration-paths' },
        { label: 'Home Clinic', href: '#home-clinic' },
        { label: 'Telehealth', href: '#telehealth' },
        { label: 'Delivery & support', href: '#delivery' },
        { label: 'Available components', href: '#connected-inclusions' },
      ],
    },
    paths: {
      eyebrow: 'Start with what you already have',
      title: 'Three starting points. One accountable integration partner.',
      body:
        'We begin with your devices, digital tools, users and desired outcome—then build only the connection and support layer you need.',
      items: [
        {
          icon: 'link' as TechIconName,
          number: '01',
          title: 'You already have an app or care system',
          body:
            'We assess its documented APIs, webhooks or approved data-transfer options and design the connection around your current workflow.',
          outcome: 'Keep the system your team already knows.',
        },
        {
          icon: 'bluetooth' as TechIconName,
          number: '02',
          title: 'Your devices work in separate apps',
          body:
            'We review compatibility, connect useful information where feasible and organise alerts so they reach the right person.',
          outcome: 'Replace fragmented notifications with a clearer flow.',
        },
        {
          icon: 'monitor' as TechIconName,
          number: '03',
          title: 'You need the complete solution',
          body:
            'CasaMia can provide the resident app, family access, professional dashboard, device setup, onboarding and ongoing support.',
          outcome: 'One service, from equipment to daily use.',
        },
      ],
    },
    devices: {
      eyebrow: 'Device integration',
      title: 'Bring the devices. We make them useful together.',
      body:
        'CasaMia can assess compatible health, wellbeing and home-safety technology, connect the useful signals and make the resulting information easier to act on.',
      items: [
        {
          icon: 'heart' as TechIconName,
          title: 'Health measurements',
          body: 'Connected blood-pressure monitors, pulse oximeters, thermometers, scales and other supported devices.',
        },
        {
          icon: 'bell' as TechIconName,
          title: 'Safety and response',
          body: 'SOS buttons, fall-support devices, movement, access, smoke, water and environmental alerts.',
        },
        {
          icon: 'activity' as TechIconName,
          title: 'Daily wellbeing',
          body: 'Medication routines, hydration prompts, check-ins, activity support and agreed reminders.',
        },
        {
          icon: 'wifi' as TechIconName,
          title: 'Connectivity and setup',
          body: 'Pairing, accounts, Wi-Fi or cellular checks, vendor-cloud review and connection testing.',
        },
      ],
      compatibilityTitle: 'Compatibility comes first',
      compatibilityBody:
        'Not every device exposes a safe or supported connection. We confirm technical and contractual compatibility before promising an integration. If a direct connection is not possible, we recommend a suitable device or a practical alternative.',
    },
    integration: {
      eyebrow: 'Integration architecture',
      title: 'From the device to the person who needs the information.',
      body:
        'Where technically feasible, CasaMia uses documented APIs, webhooks, vendor-cloud connections or controlled data exchange. Together we define what moves, who can see it, what creates an alert and what stays in the source system.',
      columns: [
        {
          icon: 'radio' as TechIconName,
          label: '1. Sources',
          items: ['Vitals devices', 'Wearables', 'Safety sensors', 'Voice and routines'],
        },
        {
          icon: 'network' as TechIconName,
          label: '2. CasaMia integration layer',
          items: ['Compatibility rules', 'Identity and consent', 'Alert logic', 'Connection health'],
        },
        {
          icon: 'cloud' as TechIconName,
          label: '3. Destination',
          items: ['Your application', 'Care or operational system', 'CasaMia resident app', 'Family or professional view'],
        },
      ],
      footer: 'Resident · Family · Authorised professional · Care team',
    },
    homeClinic: {
      eyebrow: 'The CasaMia Home Clinic',
      title: 'Useful health support at home—without making the home feel clinical.',
      body:
        'Home Clinic combines a selected set of compatible devices, simple measurement routines and one organised digital view. CasaMia installs and pairs the equipment, explains each step and helps make agreed information available to approved family members or professionals.',
      imageAlt: 'Connected blood pressure monitor prepared for a guided health measurement at home',
      visualLabel: 'Home Clinic ready',
      visualItems: ['Device paired', 'Routine explained', 'Readings organised'],
      highlights: [
        'Guided measurements at home',
        'Device and connection checks',
        'Clear history of agreed readings',
        'Reminders for selected routines',
        'Information prepared for appointments',
        'Optional family or professional visibility',
      ],
      boundary:
        'Home Clinic supports organisation and communication. It does not diagnose conditions or replace advice from a qualified healthcare professional.',
    },
    telehealth: {
      eyebrow: 'Telehealth option',
      title: 'Make the video consultation easy before it begins.',
      body:
        'CasaMia can add a telehealth option so the resident can join a scheduled consultation from home. We configure the chosen device, test the connection, provide reminders and prepare agreed information for the appointment.',
      features: [
        'Simple access to video consultations',
        'Camera, sound and connection checks',
        'Appointment reminders',
        'Agreed readings ready for review',
        'Family participation where consented',
        'Follow-up actions kept together',
      ],
      boundary:
        'Consultations are delivered by the chosen healthcare provider. Availability, medical advice and clinical responsibility remain with that provider.',
      visual: {
        eyebrow: 'Appointment ready',
        secure: 'Connection tested',
        title: 'Video consultation',
        time: 'Today · 16:30',
        checks: ['Connection tested', 'Camera and sound ready', 'Selected readings prepared'],
        action: 'Join consultation',
      },
    },
    monitoring: {
      eyebrow: 'Monitoring and alerts',
      title: 'Useful signals. Clear next steps. Less unnecessary noise.',
      body:
        'CasaMia configures notifications around the household’s needs and the responsibilities agreed with family or professionals. Alerts can be routed by type, priority and time of day.',
      items: [
        { icon: 'wifi' as TechIconName, title: 'Connection', body: 'Device offline or pairing problem' },
        { icon: 'activity' as TechIconName, title: 'Routine', body: 'Agreed check or measurement missed' },
        { icon: 'bell' as TechIconName, title: 'Attention', body: 'Safety or wellbeing signal needs review' },
        { icon: 'user' as TechIconName, title: 'Response', body: 'Named contact receives the next step' },
      ],
      boundary:
        'CasaMia monitoring is not an emergency service unless a specifically contracted response service states otherwise.',
    },
    platforms: {
      eyebrow: 'Use your platform—or ours',
      title: 'Keep your current system, or let CasaMia provide the digital layer.',
      body:
        'The delivery model changes with your starting point. The goal is the same: one understandable experience for the resident and clear, permission-based information for everyone supporting them.',
      yourSystem: {
        kicker: 'Connect to what you have',
        visualLabel: 'API / webhook',
        title: 'Your app or care system',
        body:
          'We connect compatible information to your application, care platform or operational dashboard where the system’s supported interfaces allow it.',
        points: ['Current workflows retained', 'Supported interfaces reviewed', 'Data and alert ownership documented'],
      },
      ourSystem: {
        kicker: 'No platform? We provide one',
        visualLabel: 'CasaMia platform view',
        title: 'CasaMia connected-care platform',
        body:
          'A simpler resident experience, family access and a professional dashboard for agreed reminders, readings, alerts and follow-up.',
        points: ['Resident app and optional VYVA voice support', 'Family view with role-based access', 'Professional dashboard and support'],
      },
    },
    delivery: {
      eyebrow: 'What CasaMia actually delivers',
      title: 'One accountable service from discovery to support.',
      body:
        'We do more than pair a device. CasaMia coordinates the practical, technical and human work required to make connected care usable in real life.',
      items: [
        { title: 'Discover', body: 'Inventory devices, systems, users, connectivity and the outcome you need.' },
        { title: 'Design', body: 'Confirm compatibility, data flows, permissions, alerts and response responsibilities.' },
        { title: 'Connect', body: 'Procure where needed, install, integrate, configure and test the complete route.' },
        { title: 'Onboard', body: 'Train residents, families, staff and authorised professionals with a clear handover.' },
        { title: 'Support', body: 'Maintain agreed connections, resolve issues and adapt the setup as needs change.' },
      ],
      imageAlt: 'CasaMia connected-care equipment and onboarding materials prepared in a home',
    },
    governance: {
      eyebrow: 'Privacy, reliability and responsibility',
      title: 'Connected care only works when everyone knows what happens next.',
      body:
        'Before activation, CasaMia documents who may access each type of information, which alerts each person receives and who is responsible for responding. We aim to collect and share only what the agreed service needs.',
      items: [
        { icon: 'lock' as TechIconName, title: 'Consent and access', body: 'Role-based access and agreed visibility for residents, families and professionals.' },
        { icon: 'shield' as TechIconName, title: 'Clear boundaries', body: 'Clinical, emergency and response responsibilities are documented before launch.' },
        { icon: 'wrench' as TechIconName, title: 'Reliability first', body: 'Connectivity, device placement, fallbacks and support routes are tested before handover.' },
      ],
    },
    catalogue: {
      eyebrow: 'Available connected components',
      title: 'Current smart-safety components, maintained by CasaMia.',
      body:
        'This live list reflects CasaMia’s current connected-safety catalogue. Home Clinic, telehealth and custom integrations are scoped separately after a compatibility review.',
      countLabel: 'active services',
      groupLabel: 'Current catalogue',
      empty: 'No connected components are currently available. Ask CasaMia for a compatibility review.',
      cardTitle: 'Connected components and setup',
      cardBody:
        'CasaMia checks compatibility, installs where needed, configures alerts and explains the handover. This list is maintained as the available components change.',
      cta: 'Configure smart safety',
    },
    faq: {
      eyebrow: 'Questions before you connect',
      title: 'Clear answers about devices, systems and responsibility.',
      items: [
        {
          question: 'Can CasaMia connect every health device?',
          answer:
            'We can review many health and safety devices, but a direct integration depends on the manufacturer’s supported interfaces, permissions, connectivity and contractual conditions. We confirm compatibility before proposing a connection.',
        },
        {
          question: 'Can we keep our current app or care system?',
          answer:
            'Yes, when that system exposes a supported and authorised integration route. CasaMia first reviews the available APIs, webhooks or approved exchange methods and then scopes the work clearly.',
        },
        {
          question: 'What if we have devices but no app or dashboard?',
          answer:
            'CasaMia can provide the complete digital layer: a simple resident experience, family access, a professional dashboard and optional VYVA voice support, together with setup and onboarding.',
        },
        {
          question: 'Does Home Clinic diagnose or provide medical advice?',
          answer:
            'No. Home Clinic helps organise compatible devices, routines and agreed information. Diagnosis and medical advice remain with qualified healthcare professionals.',
        },
        {
          question: 'Who provides the telehealth consultation?',
          answer:
            'The chosen or participating healthcare provider delivers the consultation. CasaMia supports access, device readiness, reminders and information preparation where agreed.',
        },
        {
          question: 'Who receives an alert?',
          answer:
            'That is agreed before activation. Alerts can be routed by type, priority and schedule to named family members, care staff or contracted response services. CasaMia does not assume emergency responsibility unless explicitly contracted.',
        },
      ],
    },
    final: {
      eyebrow: 'Start with your real setup',
      title: 'Tell us what you already have. We will show you the clearest way to connect it.',
      body:
        'Bring a device list, an existing system or simply the outcome you need. CasaMia will review the starting point and define a practical connected-care plan.',
      primaryCta: 'Discuss my integration',
      secondaryCta: 'I need the complete platform',
    },
  },
  es: {
    lang: 'es',
    seoTitle: 'Dispositivos de Salud Conectados, Clínica en Casa y Telesalud',
    seoDescription:
      'CasaMia conecta dispositivos compatibles de salud y seguridad con tu app o sistema asistencial, o proporciona una solución completa con app, panel familiar, Clínica en Casa y telesalud.',
    serviceType: 'Integración de dispositivos de salud, Clínica en Casa y configuración de telesalud',
    hero: {
      eyebrow: 'Salud conectada en casa',
      title: 'Conecta la tecnología de salud que ya tienes.',
      accent: 'O deja que proporcionemos el sistema completo.',
      body:
        'CasaMia conecta dispositivos compatibles de salud, bienestar y seguridad con la aplicación o plataforma asistencial que ya utilizas. Si no dispones de una, proporcionamos la experiencia para la persona usuaria, la vista familiar y el panel profesional, todo instalado, configurado y respaldado como un único servicio.',
      primaryCta: 'Planificar mi integración',
      secondaryCta: 'Explorar el servicio',
      proof: ['Conserva tu sistema actual', 'Conecta dispositivos compatibles', 'Plataforma CasaMia disponible'],
      visualEyebrow: 'Un único servicio conectado',
      visualTitle: 'Del dispositivo a la persona adecuada',
      visualSummary: 'Los dispositivos de salud y seguridad se conectan mediante una capa de integración y configuración con tu sistema actual o con la plataforma CasaMia.',
      sources: ['Dispositivos de salud', 'Seguridad del hogar', 'Rutinas diarias'],
      hub: 'Integración y configuración',
      routeLabel: 'API · Nube · Dispositivo',
      destinations: ['Tu app o sistema', 'Plataforma CasaMia'],
      checks: ['Compatibilidad revisada', 'Permisos acordados', 'Usuarios formados'],
    },
    sectionNav: {
      label: 'Explorar la atención conectada',
      items: [
        { label: 'Cómo conectamos', href: '#integration-paths' },
        { label: 'Clínica en Casa', href: '#home-clinic' },
        { label: 'Telesalud', href: '#telehealth' },
        { label: 'Entrega y soporte', href: '#delivery' },
        { label: 'Componentes disponibles', href: '#connected-inclusions' },
      ],
    },
    paths: {
      eyebrow: 'Partimos de lo que ya tienes',
      title: 'Tres puntos de partida. Un único socio responsable de la integración.',
      body:
        'Empezamos por tus dispositivos, herramientas digitales, usuarios y objetivo; después creamos solo la conexión y el soporte que necesitas.',
      items: [
        {
          icon: 'link' as TechIconName,
          number: '01',
          title: 'Ya tienes una app o sistema asistencial',
          body:
            'Revisamos sus APIs, webhooks u opciones autorizadas de intercambio de datos y diseñamos la conexión en torno a tu flujo actual.',
          outcome: 'Conserva el sistema que tu equipo ya conoce.',
        },
        {
          icon: 'bluetooth' as TechIconName,
          number: '02',
          title: 'Tus dispositivos funcionan en apps separadas',
          body:
            'Revisamos la compatibilidad, conectamos la información útil cuando es viable y organizamos las alertas para que lleguen a quien corresponde.',
          outcome: 'Sustituye avisos fragmentados por un flujo más claro.',
        },
        {
          icon: 'monitor' as TechIconName,
          number: '03',
          title: 'Necesitas la solución completa',
          body:
            'CasaMia puede proporcionar la app para la persona, acceso familiar, panel profesional, configuración de dispositivos, formación y soporte.',
          outcome: 'Un único servicio, desde el equipo hasta el uso diario.',
        },
      ],
    },
    devices: {
      eyebrow: 'Integración de dispositivos',
      title: 'Tú aportas los dispositivos. Nosotros hacemos que sean útiles juntos.',
      body:
        'CasaMia puede evaluar tecnología compatible de salud, bienestar y seguridad doméstica, conectar las señales útiles y facilitar que la información se convierta en una acción clara.',
      items: [
        {
          icon: 'heart' as TechIconName,
          title: 'Mediciones de salud',
          body: 'Tensiómetros conectados, pulsioxímetros, termómetros, básculas y otros dispositivos compatibles.',
        },
        {
          icon: 'bell' as TechIconName,
          title: 'Seguridad y respuesta',
          body: 'Botones SOS, detección o asistencia ante caídas y alertas de movimiento, acceso, humo, agua o entorno.',
        },
        {
          icon: 'activity' as TechIconName,
          title: 'Bienestar diario',
          body: 'Rutinas de medicación, avisos de hidratación, seguimientos, actividad y recordatorios acordados.',
        },
        {
          icon: 'wifi' as TechIconName,
          title: 'Conectividad y configuración',
          body: 'Vinculación, cuentas, Wi-Fi o red móvil, revisión de nube del fabricante y pruebas de conexión.',
        },
      ],
      compatibilityTitle: 'La compatibilidad es lo primero',
      compatibilityBody:
        'No todos los dispositivos permiten una conexión segura o compatible. Confirmamos la viabilidad técnica y contractual antes de prometer una integración. Si no es posible una conexión directa, proponemos un dispositivo adecuado o una alternativa práctica.',
    },
    integration: {
      eyebrow: 'Arquitectura de integración',
      title: 'Del dispositivo a la persona que necesita la información.',
      body:
        'Cuando es técnicamente viable, CasaMia utiliza APIs documentadas, webhooks, nubes de fabricante o intercambios controlados de datos. Juntos definimos qué se comparte, quién puede verlo, qué genera una alerta y qué permanece en el sistema de origen.',
      columns: [
        {
          icon: 'radio' as TechIconName,
          label: '1. Orígenes',
          items: ['Dispositivos de constantes', 'Wearables', 'Sensores de seguridad', 'Voz y rutinas'],
        },
        {
          icon: 'network' as TechIconName,
          label: '2. Capa de integración CasaMia',
          items: ['Reglas de compatibilidad', 'Identidad y consentimiento', 'Lógica de alertas', 'Estado de conexión'],
        },
        {
          icon: 'cloud' as TechIconName,
          label: '3. Destino',
          items: ['Tu aplicación', 'Sistema asistencial u operativo', 'App CasaMia', 'Vista familiar o profesional'],
        },
      ],
      footer: 'Persona usuaria · Familia · Profesional autorizado · Equipo asistencial',
    },
    homeClinic: {
      eyebrow: 'La Clínica en Casa de CasaMia',
      title: 'Apoyo práctico para la salud en casa, sin convertirla en un entorno clínico.',
      body:
        'Clínica en Casa combina dispositivos compatibles seleccionados, rutinas sencillas de medición y una vista digital organizada. CasaMia instala y vincula los equipos, explica cada paso y facilita que la información acordada esté disponible para familiares o profesionales autorizados.',
      imageAlt: 'Tensiómetro conectado preparado para una medición guiada de salud en casa',
      visualLabel: 'Clínica en Casa lista',
      visualItems: ['Dispositivo vinculado', 'Rutina explicada', 'Lecturas organizadas'],
      highlights: [
        'Mediciones guiadas en casa',
        'Comprobación de dispositivos y conexión',
        'Historial claro de lecturas acordadas',
        'Recordatorios de rutinas seleccionadas',
        'Información preparada para consultas',
        'Visibilidad familiar o profesional opcional',
      ],
      boundary:
        'Clínica en Casa facilita la organización y la comunicación. No realiza diagnósticos ni sustituye el asesoramiento de un profesional sanitario cualificado.',
    },
    telehealth: {
      eyebrow: 'Opción de telesalud',
      title: 'Facilita la videoconsulta antes de que empiece.',
      body:
        'CasaMia puede incorporar una opción de telesalud para que la persona participe en una consulta programada desde casa. Configuramos el dispositivo elegido, comprobamos la conexión, enviamos recordatorios y preparamos la información acordada para la cita.',
      features: [
        'Acceso sencillo a videoconsultas',
        'Comprobación de cámara, sonido y conexión',
        'Recordatorios antes de la cita',
        'Lecturas acordadas listas para revisión',
        'Participación familiar con consentimiento',
        'Seguimiento organizado en un único lugar',
      ],
      boundary:
        'Las consultas las presta el proveedor sanitario elegido. La disponibilidad, el asesoramiento médico y la responsabilidad clínica corresponden a dicho proveedor.',
      visual: {
        eyebrow: 'Cita preparada',
        secure: 'Conexión comprobada',
        title: 'Videoconsulta',
        time: 'Hoy · 16:30',
        checks: ['Conexión comprobada', 'Cámara y sonido listos', 'Lecturas seleccionadas preparadas'],
        action: 'Entrar en la consulta',
      },
    },
    monitoring: {
      eyebrow: 'Monitorización y alertas',
      title: 'Señales útiles. Próximos pasos claros. Menos avisos innecesarios.',
      body:
        'CasaMia configura las notificaciones según las necesidades del hogar y las responsabilidades acordadas con familiares o profesionales. Las alertas pueden dirigirse por tipo, prioridad y horario.',
      items: [
        { icon: 'wifi' as TechIconName, title: 'Conexión', body: 'Dispositivo desconectado o problema de vinculación' },
        { icon: 'activity' as TechIconName, title: 'Rutina', body: 'Seguimiento o medición acordada pendiente' },
        { icon: 'bell' as TechIconName, title: 'Atención', body: 'Señal de seguridad o bienestar que requiere revisión' },
        { icon: 'user' as TechIconName, title: 'Respuesta', body: 'El contacto designado recibe el siguiente paso' },
      ],
      boundary:
        'La monitorización de CasaMia no constituye un servicio de emergencias salvo que exista un servicio de respuesta específicamente contratado.',
    },
    platforms: {
      eyebrow: 'Usa tu plataforma o la nuestra',
      title: 'Conserva tu sistema actual o deja que CasaMia proporcione la capa digital.',
      body:
        'El modelo de entrega cambia según tu punto de partida. El objetivo es el mismo: una experiencia comprensible para la persona y datos claros, con permisos, para quienes la apoyan.',
      yourSystem: {
        kicker: 'Conecta lo que ya tienes',
        visualLabel: 'API / webhook',
        title: 'Tu app o sistema asistencial',
        body:
          'Conectamos información compatible con tu aplicación, plataforma asistencial o panel operativo cuando sus interfaces lo permiten.',
        points: ['Se conservan los flujos actuales', 'Revisamos las interfaces compatibles', 'Documentamos la propiedad de datos y alertas'],
      },
      ourSystem: {
        kicker: '¿Sin plataforma? La proporcionamos',
        visualLabel: 'Vista CasaMia en directo',
        title: 'Plataforma de atención conectada CasaMia',
        body:
          'Una experiencia sencilla para la persona, acceso familiar y un panel profesional para recordatorios, lecturas, alertas y seguimientos acordados.',
        points: ['App para la persona y asistencia VYVA opcional', 'Vista familiar con acceso por roles', 'Panel profesional y soporte'],
      },
    },
    delivery: {
      eyebrow: 'Qué entrega realmente CasaMia',
      title: 'Un único servicio responsable desde el análisis hasta el soporte.',
      body:
        'Hacemos mucho más que vincular un dispositivo. CasaMia coordina el trabajo práctico, técnico y humano necesario para que la atención conectada funcione en la vida real.',
      items: [
        { title: 'Analizar', body: 'Inventariamos dispositivos, sistemas, usuarios, conectividad y el resultado que necesitas.' },
        { title: 'Diseñar', body: 'Confirmamos compatibilidad, flujos de datos, permisos, alertas y responsabilidades.' },
        { title: 'Conectar', body: 'Suministramos cuando hace falta, instalamos, integramos, configuramos y probamos.' },
        { title: 'Formar', body: 'Acompañamos a personas usuarias, familias, equipos y profesionales autorizados.' },
        { title: 'Dar soporte', body: 'Mantenemos las conexiones acordadas, resolvemos incidencias y adaptamos la solución.' },
      ],
      imageAlt: 'Equipo de atención conectada CasaMia y materiales de formación preparados en una vivienda',
    },
    governance: {
      eyebrow: 'Privacidad, fiabilidad y responsabilidad',
      title: 'La atención conectada solo funciona cuando todos saben qué ocurre después.',
      body:
        'Antes de activar el servicio, CasaMia documenta quién puede acceder a cada tipo de información, qué alertas recibe cada persona y quién es responsable de responder. Procuramos recoger y compartir solo lo necesario para el servicio acordado.',
      items: [
        { icon: 'lock' as TechIconName, title: 'Consentimiento y acceso', body: 'Acceso por roles y visibilidad acordada para personas, familias y profesionales.' },
        { icon: 'shield' as TechIconName, title: 'Límites claros', body: 'Las responsabilidades clínicas, de emergencia y respuesta se documentan antes de empezar.' },
        { icon: 'wrench' as TechIconName, title: 'Fiabilidad primero', body: 'Probamos conectividad, ubicación, alternativas y soporte antes de la entrega.' },
      ],
    },
    catalogue: {
      eyebrow: 'Componentes conectados disponibles',
      title: 'Componentes actuales de seguridad inteligente, mantenidos por CasaMia.',
      body:
        'Esta lista en vivo refleja el catálogo actual de seguridad conectada de CasaMia. Clínica en Casa, telesalud e integraciones a medida se definen por separado tras revisar la compatibilidad.',
      countLabel: 'servicios activos',
      groupLabel: 'Catálogo actual',
      empty: 'Ahora mismo no hay componentes conectados disponibles. Solicita a CasaMia una revisión de compatibilidad.',
      cardTitle: 'Componentes conectados y configuración',
      cardBody:
        'CasaMia comprueba la compatibilidad, instala cuando hace falta, configura las alertas y explica la entrega. Esta lista se mantiene actualizada a medida que cambian los componentes disponibles.',
      cta: 'Configurar seguridad inteligente',
    },
    faq: {
      eyebrow: 'Preguntas antes de conectar',
      title: 'Respuestas claras sobre dispositivos, sistemas y responsabilidad.',
      items: [
        {
          question: '¿Puede CasaMia conectar cualquier dispositivo de salud?',
          answer:
            'Podemos revisar numerosos dispositivos de salud y seguridad, pero una integración directa depende de las interfaces compatibles del fabricante, los permisos, la conectividad y las condiciones contractuales. Confirmamos la compatibilidad antes de proponer una conexión.',
        },
        {
          question: '¿Podemos conservar nuestra app o sistema asistencial?',
          answer:
            'Sí, cuando el sistema ofrece una vía de integración compatible y autorizada. CasaMia revisa primero las APIs, webhooks u opciones de intercambio disponibles y después define claramente el alcance.',
        },
        {
          question: '¿Qué ocurre si tenemos dispositivos, pero no una app o un panel?',
          answer:
            'CasaMia puede proporcionar la capa digital completa: una experiencia sencilla para la persona, acceso familiar, panel profesional y asistencia VYVA por voz opcional, además de configuración y formación.',
        },
        {
          question: '¿Clínica en Casa diagnostica o da consejo médico?',
          answer:
            'No. Clínica en Casa ayuda a organizar dispositivos compatibles, rutinas e información acordada. El diagnóstico y el consejo médico corresponden a profesionales sanitarios cualificados.',
        },
        {
          question: '¿Quién presta la consulta de telesalud?',
          answer:
            'La consulta la presta el proveedor sanitario elegido o participante. CasaMia facilita el acceso, la preparación del dispositivo, los recordatorios y la información acordada.',
        },
        {
          question: '¿Quién recibe una alerta?',
          answer:
            'Se acuerda antes de activar el servicio. Las alertas se pueden dirigir por tipo, prioridad y horario a familiares, equipos asistenciales o servicios de respuesta contratados. CasaMia no asume responsabilidad de emergencias salvo contratación expresa.',
        },
      ],
    },
    final: {
      eyebrow: 'Empieza por tu situación real',
      title: 'Cuéntanos qué tienes. Te mostraremos la forma más clara de conectarlo.',
      body:
        'Puedes traer una lista de dispositivos, un sistema existente o simplemente el resultado que necesitas. CasaMia revisará el punto de partida y definirá un plan práctico de atención conectada.',
      primaryCta: 'Hablar de mi integración',
      secondaryCta: 'Necesito la plataforma completa',
    },
  },
} as const

function getTechCopy(language: string) {
  return language.toLowerCase().startsWith('es') ? techCopy.es : techCopy.en
}

const spanishCatalogueLabels: Record<string, string> = {
  'Emergency support': 'Apoyo de emergencia',
  'Simple controls': 'Controles sencillos',
  'Family reassurance': 'Tranquilidad familiar',
  'Emergency call button': 'Botón de llamada de emergencia',
  'Voice hub setup': 'Configuración de asistente por voz',
  'Family alert setup': 'Configuración de alertas familiares',
  'Fall detection review': 'Evaluación de detección de caídas',
  'Professional monitoring option': 'Opción de monitorización profesional',
}

function localiseCatalogueLabel(value: string, language: LanguageKey) {
  return language === 'es' ? spanishCatalogueLabels[value] ?? value : value
}

function formatTechServicePrice(
  service: Parameters<typeof formatServicePrice>[0],
  language: LanguageKey,
) {
  const price = formatServicePrice(service)

  if (language !== 'es') return price
  if (price === 'Quote after review') return 'Precio tras revisión'
  if (price === 'Included after review') return 'Incluido tras revisión'

  return price.replace(/^From /, 'Desde ')
}

function TechIcon({ name, size = 24 }: { name: TechIconName; size?: number }) {
  const Icon = iconMap[name]
  return <Icon aria-hidden="true" size={size} />
}

function HeroIntegrationVisual({ copy }: { copy: (typeof techCopy)[LanguageKey]['hero'] }) {
  return (
    <div className="cm-tech-hero-card" role="img" aria-label={copy.visualSummary}>
      <div className="cm-tech-hero-card-heading">
        <span><Network size={18} aria-hidden="true" />{copy.visualEyebrow}</span>
        <strong>{copy.visualTitle}</strong>
      </div>

      <div className="cm-tech-hero-route">
        <div className="cm-tech-route-sources">
          {copy.sources.map((source, index) => (
            <span key={source}>
              {index === 0 ? <HeartPulse size={18} aria-hidden="true" /> : index === 1 ? <ShieldCheck size={18} aria-hidden="true" /> : <Activity size={18} aria-hidden="true" />}
              {source}
            </span>
          ))}
        </div>

        <span className="cm-tech-route-line" aria-hidden="true"><ChevronRight size={20} /></span>

        <div className="cm-tech-route-hub">
          <span><Link2 size={24} aria-hidden="true" /></span>
          <strong>{copy.hub}</strong>
          <small>{copy.routeLabel}</small>
        </div>

        <span className="cm-tech-route-line" aria-hidden="true"><ChevronRight size={20} /></span>

        <div className="cm-tech-route-destinations">
          {copy.destinations.map((destination, index) => (
            <span key={destination}>
              {index === 0 ? <Database size={18} aria-hidden="true" /> : <MonitorSmartphone size={18} aria-hidden="true" />}
              {destination}
            </span>
          ))}
        </div>
      </div>

      <div className="cm-tech-hero-checks">
        {copy.checks.map((item) => (
          <span key={item}><CircleCheckBig size={16} aria-hidden="true" />{item}</span>
        ))}
      </div>
    </div>
  )
}

function TelehealthVisual({ copy }: { copy: (typeof techCopy)[LanguageKey]['telehealth']['visual'] }) {
  return (
    <div className="cm-tech-video-card" aria-hidden="true">
      <div className="cm-tech-video-topbar">
        <span><Video size={18} />{copy.eyebrow}</span>
        <span className="cm-tech-video-live"><i />{copy.secure}</span>
      </div>
      <div className="cm-tech-video-body">
        <span className="cm-tech-video-avatar"><Stethoscope size={42} /></span>
        <strong>{copy.title}</strong>
        <p>{copy.time}</p>
      </div>
      <div className="cm-tech-video-checks">
        {copy.checks.map((item) => <span key={item}><Check size={15} />{item}</span>)}
      </div>
      <span className="cm-tech-video-action"><Video size={17} />{copy.action}</span>
    </div>
  )
}

export function TechPage() {
  const { i18n } = useTranslation()
  const copy = getTechCopy(i18n.language)
  const connectedServices = useServicesByRoom('connected')
  const connectedGroups = Array.from(
    connectedServices.reduce((groups, service) => {
      const items = groups.get(service.category) ?? []
      groups.set(service.category, [...items, service])
      return groups
    }, new Map<string, typeof connectedServices>()),
  )
  const schema = useMemo(() => [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: copy.seoTitle,
      description: copy.seoDescription,
      inLanguage: copy.lang,
      url: 'https://casamia.es/tech',
      areaServed: { '@type': 'Country', name: 'Spain' },
      provider: { '@type': 'Organization', name: 'CasaMia', url: 'https://casamia.es' },
      serviceType: copy.serviceType,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      inLanguage: copy.lang,
      mainEntity: copy.faq.items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    },
  ], [copy])

  return (
    <div className="cm-tech-page" lang={copy.lang}>
      <SEO title={copy.seoTitle} description={copy.seoDescription} path="/tech" schema={schema} />

      <section className="cm-tech-hero" aria-labelledby="cm-tech-title">
        <div className="site-shell cm-tech-hero-grid">
          <div className="cm-tech-hero-copy">
            <p className="cm-tech-eyebrow is-inverse"><span />{copy.hero.eyebrow}</p>
            <h1 id="cm-tech-title">
              {copy.hero.title}
              <em>{copy.hero.accent}</em>
            </h1>
            <p className="cm-tech-hero-intro">{copy.hero.body}</p>

            <div className="cm-tech-hero-actions">
              <Link className="btn btn-green" to="/why-us?service=connected-health&intent=integration#contact-form">
                {copy.hero.primaryCta}<ArrowRight size={19} aria-hidden="true" />
              </Link>
              <a className="btn cm-tech-btn-ghost" href="#integration-paths">
                {copy.hero.secondaryCta}<ChevronRight size={19} aria-hidden="true" />
              </a>
            </div>

            <ul className="cm-tech-proof-list" aria-label={copy.hero.visualEyebrow}>
              {copy.hero.proof.map((item) => (
                <li key={item}><Check size={16} aria-hidden="true" />{item}</li>
              ))}
            </ul>
          </div>

          <HeroIntegrationVisual copy={copy.hero} />
        </div>
      </section>

      <nav className="cm-tech-section-nav" aria-label={copy.sectionNav.label}>
        <div className="site-shell">
          {copy.sectionNav.items.map((item) => (
            <a href={item.href} key={item.href}>{item.label}</a>
          ))}
        </div>
      </nav>

      <section className="cm-tech-section cm-tech-paths" id="integration-paths" aria-labelledby="cm-tech-paths-title">
        <div className="site-shell">
          <header className="cm-tech-section-heading is-centered">
            <p className="cm-tech-eyebrow"><span />{copy.paths.eyebrow}</p>
            <h2 id="cm-tech-paths-title">{copy.paths.title}</h2>
            <p>{copy.paths.body}</p>
          </header>

          <div className="cm-tech-path-grid">
            {copy.paths.items.map((item) => (
              <article className="cm-tech-path-card" key={item.number}>
                <div className="cm-tech-path-card-top">
                  <span className="cm-tech-icon"><TechIcon name={item.icon} /></span>
                  <strong>{item.number}</strong>
                </div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                <div><BadgeCheck size={18} aria-hidden="true" />{item.outcome}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cm-tech-section cm-tech-devices" aria-labelledby="cm-tech-devices-title">
        <div className="site-shell cm-tech-devices-grid">
          <div>
            <header className="cm-tech-section-heading">
              <p className="cm-tech-eyebrow"><span />{copy.devices.eyebrow}</p>
              <h2 id="cm-tech-devices-title">{copy.devices.title}</h2>
              <p>{copy.devices.body}</p>
            </header>

            <div className="cm-tech-device-grid">
              {copy.devices.items.map((item) => (
                <article className="cm-tech-device-card" key={item.title}>
                  <span className="cm-tech-icon"><TechIcon name={item.icon} /></span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="cm-tech-compatibility-card">
            <span className="cm-tech-compatibility-mark"><ShieldCheck size={34} aria-hidden="true" /></span>
            <h3>{copy.devices.compatibilityTitle}</h3>
            <span>{copy.devices.compatibilityBody}</span>
            <Link to="/why-us?service=connected-health&intent=integration#contact-form">
              {copy.hero.primaryCta}<ArrowRight size={18} aria-hidden="true" />
            </Link>
          </aside>
        </div>
      </section>

      <section className="cm-tech-section cm-tech-integration" aria-labelledby="cm-tech-integration-title">
        <div className="site-shell">
          <header className="cm-tech-section-heading is-centered is-inverse">
            <p className="cm-tech-eyebrow is-inverse"><span />{copy.integration.eyebrow}</p>
            <h2 id="cm-tech-integration-title">{copy.integration.title}</h2>
            <p>{copy.integration.body}</p>
          </header>

          <ol className="cm-tech-architecture">
            {copy.integration.columns.map((column, index) => (
              <li key={column.label}>
                <div className="cm-tech-architecture-card">
                  <span className="cm-tech-architecture-icon"><TechIcon name={column.icon} size={27} /></span>
                  <h3>{column.label}</h3>
                  <ul>
                    {column.items.map((item) => <li key={item}><Check size={15} aria-hidden="true" />{item}</li>)}
                  </ul>
                </div>
                {index < copy.integration.columns.length - 1 ? (
                  <span className="cm-tech-architecture-arrow" aria-hidden="true"><ArrowRight size={22} /></span>
                ) : null}
              </li>
            ))}
          </ol>
          <p className="cm-tech-architecture-audience"><UsersRound size={19} aria-hidden="true" />{copy.integration.footer}</p>
        </div>
      </section>

      <section className="cm-tech-section cm-tech-clinic" id="home-clinic" aria-labelledby="cm-tech-clinic-title">
        <div className="site-shell cm-tech-clinic-grid">
          <div className="cm-tech-clinic-visual">
            <SafeImage
              src="/images/service-gallery/10-health-and-vitals-monitoring.jpg"
              alt={copy.homeClinic.imageAlt}
              className="cm-tech-clinic-image"
              imgClassName="cm-tech-clinic-img"
            />
            <div className="cm-tech-clinic-overlay">
              <span><HeartPulse size={19} aria-hidden="true" />{copy.homeClinic.visualLabel}</span>
              {copy.homeClinic.visualItems.map((item) => (
                <p key={item}><CircleCheckBig size={15} aria-hidden="true" />{item}</p>
              ))}
            </div>
          </div>

          <div className="cm-tech-clinic-copy">
            <header className="cm-tech-section-heading">
              <p className="cm-tech-eyebrow"><span />{copy.homeClinic.eyebrow}</p>
              <h2 id="cm-tech-clinic-title">{copy.homeClinic.title}</h2>
              <p>{copy.homeClinic.body}</p>
            </header>

            <ul className="cm-tech-check-grid">
              {copy.homeClinic.highlights.map((item) => (
                <li key={item}><Check size={16} aria-hidden="true" />{item}</li>
              ))}
            </ul>
            <p className="cm-tech-boundary"><ShieldCheck size={19} aria-hidden="true" />{copy.homeClinic.boundary}</p>
          </div>
        </div>
      </section>

      <section className="cm-tech-section cm-tech-care-options" id="telehealth" aria-labelledby="cm-tech-telehealth-title">
        <div className="site-shell cm-tech-care-grid">
          <article className="cm-tech-telehealth-card">
            <div className="cm-tech-care-copy">
              <p className="cm-tech-eyebrow"><span />{copy.telehealth.eyebrow}</p>
              <h2 id="cm-tech-telehealth-title">{copy.telehealth.title}</h2>
              <p>{copy.telehealth.body}</p>
              <ul>
                {copy.telehealth.features.map((item) => <li key={item}><Check size={16} aria-hidden="true" />{item}</li>)}
              </ul>
              <p className="cm-tech-boundary is-compact"><ShieldCheck size={18} aria-hidden="true" />{copy.telehealth.boundary}</p>
            </div>
            <TelehealthVisual copy={copy.telehealth.visual} />
          </article>

          <article className="cm-tech-monitoring-card">
            <header>
              <p className="cm-tech-eyebrow is-inverse"><span />{copy.monitoring.eyebrow}</p>
              <h2>{copy.monitoring.title}</h2>
              <p>{copy.monitoring.body}</p>
            </header>
            <ol className="cm-tech-alert-flow">
              {copy.monitoring.items.map((item, index) => (
                <li key={item.title}>
                  <span><TechIcon name={item.icon} size={20} /></span>
                  <div><strong>{item.title}</strong><p>{item.body}</p></div>
                  {index < copy.monitoring.items.length - 1 ? <ChevronRight size={18} aria-hidden="true" /> : null}
                </li>
              ))}
            </ol>
            <p className="cm-tech-monitoring-boundary"><ShieldCheck size={18} aria-hidden="true" />{copy.monitoring.boundary}</p>
          </article>
        </div>
      </section>

      <section className="cm-tech-section cm-tech-platforms" aria-labelledby="cm-tech-platforms-title">
        <div className="site-shell">
          <header className="cm-tech-section-heading is-centered">
            <p className="cm-tech-eyebrow"><span />{copy.platforms.eyebrow}</p>
            <h2 id="cm-tech-platforms-title">{copy.platforms.title}</h2>
            <p>{copy.platforms.body}</p>
          </header>

          <div className="cm-tech-platform-grid">
            <article className="cm-tech-platform-card is-yours">
              <div className="cm-tech-platform-visual" aria-hidden="true">
                <span><Database size={30} aria-hidden="true" /></span>
                <div>
                  <i /><i /><i />
                </div>
                <small><Link2 size={14} />{copy.platforms.yourSystem.visualLabel}</small>
              </div>
              <div className="cm-tech-platform-copy">
                <p>{copy.platforms.yourSystem.kicker}</p>
                <h3>{copy.platforms.yourSystem.title}</h3>
                <span>{copy.platforms.yourSystem.body}</span>
                <ul>{copy.platforms.yourSystem.points.map((item) => <li key={item}><Check size={16} aria-hidden="true" />{item}</li>)}</ul>
              </div>
            </article>

            <article className="cm-tech-platform-card is-ours">
              <div className="cm-tech-platform-visual" aria-hidden="true">
                <span><MonitorSmartphone size={30} aria-hidden="true" /></span>
                <div className="cm-tech-mini-dashboard">
                  <i /><i /><i /><i />
                </div>
                <small><Activity size={14} />{copy.platforms.ourSystem.visualLabel}</small>
              </div>
              <div className="cm-tech-platform-copy">
                <p>{copy.platforms.ourSystem.kicker}</p>
                <h3>{copy.platforms.ourSystem.title}</h3>
                <span>{copy.platforms.ourSystem.body}</span>
                <ul>{copy.platforms.ourSystem.points.map((item) => <li key={item}><Check size={16} aria-hidden="true" />{item}</li>)}</ul>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="cm-tech-section cm-tech-delivery" id="delivery" aria-labelledby="cm-tech-delivery-title">
        <div className="site-shell cm-tech-delivery-layout">
          <div className="cm-tech-delivery-intro">
            <header className="cm-tech-section-heading">
              <p className="cm-tech-eyebrow"><span />{copy.delivery.eyebrow}</p>
              <h2 id="cm-tech-delivery-title">{copy.delivery.title}</h2>
              <p>{copy.delivery.body}</p>
            </header>
            <SafeImage
              src="/images/service-gallery/12-smart-setup-and-user-training.jpg"
              alt={copy.delivery.imageAlt}
              className="cm-tech-delivery-image"
              imgClassName="cm-tech-delivery-img"
            />
          </div>

          <ol className="cm-tech-delivery-list">
            {copy.delivery.items.map((item, index) => (
              <li key={item.title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <div><h3>{item.title}</h3><p>{item.body}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="cm-tech-governance" aria-labelledby="cm-tech-governance-title">
        <div className="site-shell">
          <div className="cm-tech-governance-panel">
            <header>
              <p className="cm-tech-eyebrow"><span />{copy.governance.eyebrow}</p>
              <h2 id="cm-tech-governance-title">{copy.governance.title}</h2>
              <p>{copy.governance.body}</p>
            </header>
            <div className="cm-tech-governance-grid">
              {copy.governance.items.map((item) => (
                <article key={item.title}>
                  <span><TechIcon name={item.icon} size={22} /></span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="cm-tech-section cm-tech-catalogue" id="connected-inclusions" aria-labelledby="cm-tech-catalogue-title">
        <div className="site-shell">
          <header className="cm-tech-section-heading">
            <p className="cm-tech-eyebrow"><span />{copy.catalogue.eyebrow}</p>
            <h2 id="cm-tech-catalogue-title">{copy.catalogue.title}</h2>
            <p>{copy.catalogue.body}</p>
          </header>

          <article className="cm-tech-catalogue-card">
            <header>
              <div>
                <p>{copy.catalogue.groupLabel}</p>
                <h3>{copy.catalogue.cardTitle}</h3>
                <span>{copy.catalogue.cardBody}</span>
              </div>
              <div className="cm-tech-service-count">
                <strong>{connectedServices.length}</strong>
                <span>{copy.catalogue.countLabel}</span>
              </div>
            </header>

            {connectedGroups.length ? (
              <div className="cm-tech-catalogue-groups">
                {connectedGroups.map(([category, services]) => (
                  <section key={category}>
                    <h4>{localiseCatalogueLabel(category, copy.lang)}</h4>
                    <ul>
                      {services.map((service) => (
                        <li key={service.id}>
                          <span><Check size={15} aria-hidden="true" /></span>
                          <div>
                            <strong>{localiseCatalogueLabel(service.name, copy.lang)}</strong>
                            <small>{formatTechServicePrice(service, copy.lang)}</small>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            ) : <p className="cm-tech-catalogue-empty">{copy.catalogue.empty}</p>}

            <Link className="btn btn-navy" to="/configure?room=connected">
              {copy.catalogue.cta}<ArrowRight size={19} aria-hidden="true" />
            </Link>
          </article>
        </div>
      </section>

      <section className="cm-tech-section cm-tech-faq" aria-labelledby="cm-tech-faq-title">
        <div className="site-shell cm-tech-faq-layout">
          <header className="cm-tech-section-heading">
            <p className="cm-tech-eyebrow"><span />{copy.faq.eyebrow}</p>
            <h2 id="cm-tech-faq-title">{copy.faq.title}</h2>
          </header>
          <div className="cm-tech-faq-list">
            {copy.faq.items.map((item) => (
              <details key={item.question}>
                <summary>{item.question}<span aria-hidden="true">+</span></summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="cm-tech-final" aria-labelledby="cm-tech-final-title">
        <div className="site-shell">
          <div className="cm-tech-final-panel">
            <div>
              <p className="cm-tech-eyebrow is-inverse"><span />{copy.final.eyebrow}</p>
              <h2 id="cm-tech-final-title">{copy.final.title}</h2>
              <p>{copy.final.body}</p>
            </div>
            <div className="cm-tech-final-actions">
              <Link className="btn btn-green" to="/why-us?service=connected-health&intent=integration#contact-form">
                {copy.final.primaryCta}<ArrowRight size={19} aria-hidden="true" />
              </Link>
              <Link className="btn cm-tech-btn-ghost" to="/why-us?service=connected-health&intent=platform#contact-form">
                {copy.final.secondaryCta}<ChevronRight size={19} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
