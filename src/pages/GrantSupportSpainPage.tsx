import {
  ArrowRight,
  BadgeEuro,
  Building2,
  CheckCircle2,
  FileCheck2,
  HeartHandshake,
  Home,
  Landmark,
  Menu,
  Wrench,
  X,
} from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { SEO } from '../components/SEO'
import { SafeImage } from '../components/SafeImage'
import { CASAMIA_CONTACT_PHONE } from '../constants/contact'
import {
  emptyGrantAnswers,
  evaluateGrantEligibility,
  sampleGrantProgrammes,
  spanishAutonomousCommunities,
  type GrantAnswers,
  type GrantEligibilityResult,
} from '../services/grantSupportSpain'
import { trackEvent } from '../utils/analytics'

import '../styles/grant-support-spain.css'

type CheckerQuestion = {
  id: keyof GrantAnswers
  title: string
  help?: string
  type: 'location' | 'single' | 'multi'
  options?: string[]
}

const phoneHref = CASAMIA_CONTACT_PHONE ? `tel:${CASAMIA_CONTACT_PHONE.replace(/\s+/g, '')}` : 'tel:+34900000000'
const whatsappHref = 'https://wa.me/34900000000?text=Hola%20Casamia%2C%20quiero%20comprobar%20una%20ayuda%20para%20adaptar%20una%20vivienda.'

const fundingChannels = [
  {
    icon: <Landmark size={24} />,
    title: 'Planes estatales de vivienda',
    body:
      'Los planes estatales de vivienda y rehabilitación financian actuaciones de accesibilidad, conservación y mejora. Se gestionan habitualmente a través de las comunidades autónomas y pueden cubrir desde pequeñas adaptaciones hasta proyectos de rehabilitación importantes.',
  },
  {
    icon: <Building2 size={24} />,
    title: 'Ayudas autonómicas',
    body:
      'Cada comunidad autónoma puede tener programas propios para adaptar baños, eliminar barreras, instalar rampas, salvaescaleras, ascensores y otras soluciones de accesibilidad.',
  },
  {
    icon: <Home size={24} />,
    title: 'Ayuntamientos y diputaciones',
    body:
      'Muchos ayuntamientos, diputaciones y oficinas municipales de vivienda ofrecen ayudas complementarias para personas mayores, vulnerabilidad y eliminación de barreras.',
  },
  {
    icon: <HeartHandshake size={24} />,
    title: 'Apoyo por discapacidad o dependencia',
    body:
      'Un grado reconocido de discapacidad, movilidad reducida o dependencia puede abrir ayudas específicas, mejorar la prioridad o reforzar la justificación de la adaptación.',
  },
]

const regionExamples = [
  'Andalucía',
  'Comunidad Valenciana',
  'Comunidad de Madrid',
  'Cataluña',
  'Galicia',
  'Castilla y León',
  'Castilla-La Mancha',
  'País Vasco',
  'Murcia',
  'Aragón',
  'Asturias',
  'Cantabria',
  'Navarra',
  'La Rioja',
  'Extremadura',
  'Baleares',
  'Canarias',
]

const fundingExamples = [
  ['Baño y seguridad', 'La ayuda pública puede cubrir parte o gran parte del coste subvencionable.'],
  ['Equipamiento accesible', 'Rampas, plataformas, salvaescaleras o ascensores pueden recibir porcentajes significativos.'],
  ['Rehabilitación completa', 'Algunos programas pueden alcanzar varios miles de euros o más.'],
  ['Edificios y zonas comunes', 'Las actuaciones comunitarias pueden tener importes máximos superiores.'],
]

const adaptationGroups: Array<[string, string[]]> = [
  ['Baños accesibles', ['Cambiar bañera por ducha', 'Suelo antideslizante', 'Barras de apoyo', 'WC accesible', 'Lavabo adaptado', 'Asiento de ducha', 'Entrada más ancha']],
  ['Movilidad y circulación', ['Ampliar puertas', 'Eliminar escalones', 'Mejorar pasillos', 'Circulación con silla', 'Rampas', 'Pasamanos', 'Suelo más seguro']],
  ['Accesibilidad vertical', ['Salvaescaleras', 'Plataformas elevadoras', 'Ascensores domésticos', 'Ascensores del edificio', 'Soluciones de entrada']],
  ['Adaptación de cocina', ['Encimeras accesibles', 'Almacenaje a menor altura', 'Electrodomésticos reubicados', 'Controles seguros', 'Mejor circulación']],
  ['Seguridad y tecnología', ['Detectores de humo o gas', 'Iluminación automática', 'Interruptores accesibles', 'Aviso de emergencia', 'Sensores de seguridad']],
  ['Adaptación general', ['Dormitorio accesible', 'Entradas adaptadas', 'Terrazas seguras', 'Mejora de iluminación', 'Evaluación completa']],
]

const checkerQuestions: CheckerQuestion[] = [
  { id: 'location', title: '¿Dónde está situada la vivienda?', type: 'location' },
  { id: 'applicantFor', title: '¿Para quién estás comprobando la ayuda?', type: 'single', options: ['Para mí', 'Para mi madre o padre', 'Para otro familiar', 'Para una persona a la que cuido', 'Para una comunidad de propietarios', 'Otro'] },
  { id: 'age', title: '¿Qué edad tiene la persona que necesita la adaptación?', type: 'single', options: ['Menos de 60', 'De 60 a 64', 'De 65 a 74', 'De 75 a 84', '85 o más'] },
  { id: 'disability', title: '¿Tiene reconocida alguna discapacidad?', type: 'single', options: ['No', 'Sí, inferior al 33%', 'Sí, del 33% al 64%', 'Sí, del 65% o superior', 'Solicitud en trámite', 'No lo sé'] },
  { id: 'dependency', title: '¿Tiene reconocido algún grado de dependencia?', type: 'single', options: ['No', 'Grado I', 'Grado II', 'Grado III', 'Solicitud en trámite', 'No lo sé'] },
  { id: 'difficulties', title: '¿Qué dificultades existen actualmente en la vivienda?', type: 'multi', options: ['Dificultad para entrar o salir', 'Dificultad para utilizar la bañera', 'Riesgo de caídas', 'Dificultad para utilizar escaleras', 'Utiliza bastón o andador', 'Utiliza silla de ruedas', 'Necesita ayuda para actividades diarias', 'Problemas de visión', 'Problemas de orientación', 'Problemas de seguridad', 'Otra situación'] },
  { id: 'habitualResidence', title: '¿Es la vivienda habitual de la persona?', type: 'single', options: ['Sí', 'No', 'Será su vivienda habitual', 'No lo sé'] },
  { id: 'padron', title: '¿La persona está empadronada en esta vivienda?', type: 'single', help: 'El padrón ayuda a demostrar que la vivienda es el domicilio habitual.', options: ['Sí', 'No', 'Está empadronada en otro domicilio', 'El trámite está pendiente', 'No lo sé'] },
  { id: 'propertyRelation', title: '¿Cuál es la relación con la vivienda?', type: 'single', options: ['Propietario', 'Copropietario', 'Usufructuario', 'Inquilino con permiso del propietario', 'Inquilino sin permiso todavía', 'Familiar del propietario', 'Comunidad de propietarios', 'Otra situación'] },
  { id: 'housingType', title: '¿Qué tipo de vivienda es?', type: 'single', options: ['Piso', 'Apartamento', 'Casa adosada', 'Vivienda unifamiliar', 'Casa rural', 'Edificio residencial', 'Zona común de una comunidad', 'Otra'] },
  { id: 'income', title: '¿Cuál es aproximadamente el ingreso anual del hogar?', type: 'single', help: 'Muchas ayudas utilizan el IPREM para priorizar hogares con ingresos bajos o medios.', options: ['Ingresos bajos', 'Ingresos medios', 'Ingresos altos', 'No lo sé', 'Prefiero que Casamia me ayude a calcularlo'] },
  { id: 'adaptations', title: '¿Qué cambios necesitas realizar?', type: 'multi', options: ['Cambiar bañera por ducha', 'Adaptar completamente el baño', 'Instalar barras de apoyo', 'Colocar suelo antideslizante', 'Eliminar escalones', 'Construir una rampa', 'Instalar un salvaescaleras', 'Instalar una plataforma elevadora', 'Instalar o adaptar un ascensor', 'Ampliar puertas', 'Adaptar la cocina', 'Mejorar iluminación y seguridad', 'Incorporar tecnología de seguridad', 'Realizar una evaluación completa de accesibilidad', 'Otro'] },
  { id: 'propertyArea', title: '¿Dónde debe realizarse la adaptación?', type: 'single', options: ['Dentro de la vivienda', 'En la entrada privada', 'En las zonas comunes del edificio', 'En varios espacios', 'No lo sé'] },
  { id: 'documents', title: '¿Tienes algún documento relacionado con la necesidad?', type: 'multi', options: ['Certificado médico', 'Resolución de discapacidad', 'Resolución de dependencia', 'Informe de Servicios Sociales', 'Informe de terapia ocupacional', 'Informe técnico', 'Presupuesto', 'Fotografías', 'Ninguno todavía'] },
  { id: 'workStatus', title: '¿En qué situación se encuentra la obra?', type: 'single', options: ['Solo estoy buscando información', 'Necesito una valoración profesional', 'Ya tengo un presupuesto', 'Ya tengo un informe técnico', 'La obra no ha comenzado', 'He reservado la obra', 'La obra ya ha comenzado', 'La obra ya está terminada'] },
  { id: 'otherAid', title: '¿Has solicitado otra ayuda para esta adaptación?', type: 'single', options: ['No', 'Sí, está solicitada', 'Sí, está concedida', 'Sí, ya fue recibida', 'No lo sé'] },
  { id: 'timing', title: '¿Cuándo quieres realizar la adaptación?', type: 'single', options: ['Lo antes posible', 'En los próximos tres meses', 'En los próximos seis meses', 'Durante el próximo año', 'Todavía no lo sé'] },
]

const services = [
  'Comprobación de ayudas',
  'Evaluación del hogar',
  'Informe de accesibilidad',
  'Diseño de adaptación',
  'Presupuesto subvencionable',
  'Coordinación técnica',
  'Preparación documental',
  'Gestión de autorizaciones',
  'Ejecución de la reforma',
  'Seguimiento del expediente',
  'Justificación de gastos',
  'Servicio post-reforma',
]

const documents = [
  'DNI o NIE',
  'Padrón',
  'Documento de propiedad',
  'Contrato de alquiler',
  'Autorización del propietario',
  'Resolución de discapacidad',
  'Resolución de dependencia',
  'Informe médico',
  'Informe de Servicios Sociales',
  'Informe de terapia ocupacional',
  'Informe técnico',
  'Presupuesto de reforma',
  'Fotografías',
  'Documentos de ingresos',
  'Certificado bancario',
  'Aprobación de comunidad',
  'Licencias municipales',
  'Información sobre otras ayudas',
]

const faqs = [
  ['¿Hay ayudas para mayores de 60 años?', 'Sí. Existen programas que utilizan los 60 o 65 años como criterio, además de ayudas relacionadas con discapacidad, dependencia, movilidad, ingresos y accesibilidad.'],
  ['¿Todas las personas mayores pueden solicitar una ayuda?', 'Muchas personas mayores pueden acceder a alguna vía de apoyo. La ayuda concreta depende de la comunidad autónoma, municipio, vivienda, ingresos, tipo de obra y convocatoria disponible.'],
  ['¿Puedo recibir ayuda para cambiar la bañera por una ducha?', 'Sí. La adaptación del baño es una de las actuaciones más habituales en los programas de adaptación funcional y accesibilidad.'],
  ['¿Puedo recibir ayuda para un salvaescaleras?', 'Sí. Los salvaescaleras, plataformas y otras soluciones de movilidad pueden incluirse en programas regionales, municipales o de accesibilidad.'],
  ['¿Puede solicitarla un inquilino?', 'Sí, en muchos casos, siempre que la vivienda sea habitual y exista autorización escrita del propietario cuando sea necesaria.'],
  ['¿Necesito estar empadronado?', 'El empadronamiento suele ser un requisito importante para demostrar que se trata de la vivienda habitual.'],
  ['¿Necesito un certificado médico?', 'Depende de la ayuda. Algunos programas solicitan certificado médico, informe social, reconocimiento de discapacidad, dependencia o informe técnico.'],
  ['¿Cuánto dinero puedo recibir?', 'Las cantidades varían. Algunos programas cubren un porcentaje de la obra y otros establecen una cantidad máxima por vivienda, persona o actuación.'],
  ['¿Puede cubrirse toda la obra?', 'En algunos programas y situaciones prioritarias, la ayuda puede cubrir una parte muy elevada del coste. Casamia comprobará el porcentaje aplicable a tu caso.'],
  ['¿Puedo empezar la obra antes de solicitarla?', 'En muchos programas es recomendable u obligatorio solicitar la ayuda antes de iniciar la obra. Casamia revisará las condiciones antes de que tomes una decisión.'],
  ['¿Qué ocurre si no hay una convocatoria abierta?', 'Casamia puede identificar programas próximos, ayudas alternativas, convocatorias municipales o vías complementarias.'],
  ['¿Casamia garantiza la concesión?', 'Casamia identifica programas, prepara el caso y ayuda durante todo el proceso. La resolución final corresponde a la administración pública.'],
]

const resultCopy: Record<GrantEligibilityResult['level'], { title: string; body: string; cta: string }> = {
  'high-likelihood': {
    title: 'Tu caso tiene una alta posibilidad de acceder a una ayuda.',
    body: 'Tus respuestas coinciden con varios de los criterios utilizados habitualmente en los programas de adaptación y accesibilidad.',
    cta: 'Quiero que Casamia tramite mi caso',
  },
  'good-possibility': {
    title: 'Tu caso presenta buenas posibilidades.',
    body: 'Existen indicadores favorables y es probable que podamos identificar una ayuda adecuada. Debemos comprobar la convocatoria activa y algunos documentos.',
    cta: 'Solicitar verificación gratuita',
  },
  'review-required': {
    title: 'Puede existir una ayuda aplicable a tu situación.',
    body: 'Necesitamos revisar algunos datos, como la localización, los ingresos, la situación de la vivienda o el estado de la obra.',
    cta: 'Revisar mi caso con Casamia',
  },
  'alternative-support': {
    title: 'Vamos a buscar una vía de apoyo adecuada.',
    body: 'Aunque no hemos identificado una coincidencia directa, pueden existir ayudas municipales, sociales, fiscales, energéticas, de dependencia o de discapacidad.',
    cta: 'Solicitar una búsqueda personalizada',
  },
}

export function GrantSupportSpainPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<GrantAnswers>(emptyGrantAnswers)
  const [completed, setCompleted] = useState(false)
  const [leadSubmitted, setLeadSubmitted] = useState(false)
  const result = useMemo(() => evaluateGrantEligibility(answers), [answers])
  const currentQuestion = checkerQuestions[step]
  const schema = useMemo(() => buildGrantSchema(), [])

  const updateAnswer = (id: keyof GrantAnswers, value: string) => {
    setAnswers((current) => ({ ...current, [id]: value }))
  }

  const toggleMulti = (id: 'difficulties' | 'adaptations' | 'documents', value: string) => {
    setAnswers((current) => {
      const selected = new Set(current[id])
      if (selected.has(value)) selected.delete(value)
      else selected.add(value)
      return { ...current, [id]: [...selected] }
    })
  }

  const nextStep = () => {
    trackEvent('grant_checker_step_completed', { step: step + 1 })
    if (step === checkerQuestions.length - 1) {
      setCompleted(true)
      trackEvent('grant_checker_completed', { result_category: result.level })
      return
    }
    setStep((current) => current + 1)
  }

  return (
    <>
      <SEO
        title="Ayudas para adaptar vivienda de personas mayores en España"
        description="Comprueba ayudas y subvenciones para adaptar una vivienda de personas mayores, discapacidad, dependencia o movilidad reducida. Casamia revisa tu caso y coordina la reforma."
        path="/grants-for-home-adaptations-spain"
        image="/images/blog/grants-euro-symbol.jpg"
        schema={schema}
      />
      <div className="grant-spain-page">
        <header className="grant-spain-subnav">
          <a className="grant-spain-logo" href="#top">Casamia</a>
          <button className="grant-spain-menu" type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="grant-spain-links">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
            Menú
          </button>
          <nav id="grant-spain-links" className={menuOpen ? 'is-open' : ''}>
            {['Ayudas disponibles', 'Comprobar elegibilidad', 'Adaptaciones', 'Cómo funciona', 'Preguntas frecuentes', 'Contacto'].map((item) => (
              <a key={item} href={`#${slugify(item)}`}>{item}</a>
            ))}
          </nav>
          <a className="grant-spain-call" href={phoneHref} onClick={() => trackEvent('grant_call_clicked')}>Llamar</a>
          <a className="grant-spain-primary" href="#comprobar-elegibilidad" onClick={() => trackEvent('grant_checker_started')}>Comprobar mi ayuda</a>
        </header>

        <section className="grant-spain-hero" id="top">
          <div className="site-shell grant-spain-hero-grid">
            <div>
              <p className="grant-spain-kicker">Tu hogar puede adaptarse. Y existen ayudas para hacerlo.</p>
              <h1>Existen ayudas para adaptar el hogar de las personas mayores.</h1>
              <p>En España, las administraciones públicas ofrecen subvenciones y programas para mejorar la accesibilidad, eliminar barreras y permitir que las personas mayores continúen viviendo en casa con seguridad e independencia.</p>
              <p>Casamia comprueba qué ayudas pueden corresponderte, prepara la adaptación y te acompaña durante todo el proceso.</p>
              <div className="grant-spain-actions">
                <a className="grant-spain-button" href="#comprobar-elegibilidad" onClick={() => trackEvent('grant_cta_clicked', { cta: 'hero_checker' })}>Comprobar si puedo recibir una ayuda <ArrowRight size={18} /></a>
                <a className="grant-spain-button is-secondary" href="#contacto">Solicitar una valoración gratuita</a>
              </div>
              <p className="grant-spain-trust">Comprobación inicial gratuita · Sin compromiso · Resultado orientativo inmediato</p>
            </div>
            <SafeImage src="/images/blog/grants-euro-symbol.jpg" alt="Símbolo del euro como referencia a programas de apoyo europeos y públicos" className="grant-spain-hero-image" imgClassName="grant-spain-hero-img" loading="eager" />
          </div>
        </section>

        <Section id="ayudas-disponibles" eyebrow="Adaptamos la vivienda y simplificamos la ayuda." title="Sí, puedes obtener ayuda para adaptar tu vivienda.">
          <p className="grant-spain-lead">Las ayudas para accesibilidad y adaptación del hogar están disponibles a través de programas estatales, autonómicos, provinciales y municipales. También existen apoyos específicos para personas mayores, discapacidad, dependencia e ingresos bajos o medios.</p>
          <div className="grant-spain-card-grid four">
            {fundingChannels.map((card) => <InfoCard key={card.title} {...card} />)}
          </div>
          <div className="grant-spain-callout">Casamia revisa todas las vías disponibles. No nos limitamos a buscar una sola subvención.</div>
          <p className="grant-spain-region-line">Ejemplos de revisión autonómica: {regionExamples.join(', ')}.</p>
        </Section>

        <Section eyebrow="Importes orientativos" title="¿Cuánta ayuda se puede recibir?">
          <p className="grant-spain-lead">Dependiendo de la convocatoria, la localización, la situación personal y el tipo de obra, las ayudas pueden cubrir una parte importante del proyecto.</p>
          <div className="grant-spain-example-grid">{fundingExamples.map(([title, body]) => <article key={title}><strong>{title}</strong><p>{body}</p></article>)}</div>
          <p className="grant-spain-note">Existen programas con límites aproximados de 8.000 €, 10.000 €, 12.500 €, 18.000 € o más, porcentajes reforzados para mayores, discapacidad o dependencia y ayudas municipales para obras o equipos concretos. Casamia confirma el importe aplicable antes de preparar la solicitud.</p>
        </Section>

        <Section id="adaptaciones" eyebrow="Reformas subvencionables" title="¿Qué reformas pueden recibir ayuda?">
          <div className="grant-spain-card-grid three">
            {adaptationGroups.map(([title, items]) => (
              <article className="grant-spain-adaptation-card" key={title}>
                <Wrench size={22} />
                <h3>{title}</h3>
                <ul>{(items as string[]).map((item) => <li key={item}>{item}</li>)}</ul>
              </article>
            ))}
          </div>
          <p className="grant-spain-note">Las ayudas suelen incluir tanto materiales como mano de obra cuando forman parte de una actuación subvencionable.</p>
        </Section>

        <section className="grant-spain-checker-section" id="comprobar-elegibilidad">
          <div className="site-shell grant-spain-checker-grid">
            <div className="grant-spain-checker-copy">
              <p className="grant-spain-kicker">Comprobación gratuita</p>
              <h2>Comprueba ahora si puedes acceder a una ayuda</h2>
              <p>Responde a unas preguntas sencillas. No necesitas tener toda la documentación preparada.</p>
            </div>
            <div className="grant-spain-checker" aria-live="polite">
              {!completed ? (
                <>
                  <div className="grant-spain-progress"><span style={{ width: `${((step + 1) / checkerQuestions.length) * 100}%` }} /></div>
                  <p className="grant-spain-step">Paso {step + 1} de {checkerQuestions.length}</p>
                  <h3>{currentQuestion.title}</h3>
                  {currentQuestion.help ? <p className="grant-spain-help">{currentQuestion.help}</p> : null}
                  <QuestionInput question={currentQuestion} answers={answers} updateAnswer={updateAnswer} toggleMulti={toggleMulti} />
                  {answers.workStatus && ['La obra ya ha comenzado', 'La obra ya está terminada'].includes(answers.workStatus) ? (
                    <p className="grant-spain-warning">Todavía puede haber opciones, pero algunas ayudas exigen presentar la solicitud antes de comenzar. Casamia revisará si existe una vía compatible.</p>
                  ) : null}
                  <div className="grant-spain-checker-actions">
                    <button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>Atrás</button>
                    <button type="button" onClick={nextStep}>{step === checkerQuestions.length - 1 ? 'Ver resultado' : 'Siguiente'}</button>
                  </div>
                </>
              ) : (
                <EligibilityResultPanel result={result} onEdit={() => setCompleted(false)} />
              )}
            </div>
          </div>
        </section>

        {completed ? <LeadCapture result={result} submitted={leadSubmitted} setSubmitted={setLeadSubmitted} /> : null}

        <Section id="como-funciona" eyebrow="Un solo equipo" title="Casamia hace que solicitar la ayuda sea sencillo.">
          <ol className="grant-spain-timeline">
            {['Comprobamos tu situación', 'Buscamos todas las ayudas disponibles', 'Visitamos la vivienda', 'Definimos la reforma', 'Reunimos la documentación', 'Apoyamos la solicitud', 'Ejecutamos y justificamos'].map((title, index) => (
              <li key={title}><span>{index + 1}</span><strong>{title}</strong><p>{['Analizamos edad, movilidad, discapacidad, dependencia, vivienda, ingresos y localización.', 'Revisamos programas estatales, autonómicos, provinciales, municipales y sociales.', 'Evaluamos riesgos, barreras y mejoras necesarias para vivir con mayor seguridad.', 'Diseñamos una solución adaptada y preparamos un presupuesto detallado.', 'Ayudamos a preparar certificados, informes, fotografías, autorizaciones y formularios.', 'Coordinamos presentación, seguimiento y respuesta a requerimientos.', 'Realizamos la reforma y organizamos facturas, certificados y evidencias.'][index]}</p></li>
            ))}
          </ol>
          <div className="grant-spain-callout">Un solo equipo para comprobar la ayuda, adaptar la vivienda y completar el proceso.</div>
        </Section>

        <Section eyebrow="Servicios Casamia" title="Todo lo que podemos coordinar.">
          <div className="grant-spain-pill-grid">{services.map((item) => <span key={item}><CheckCircle2 size={16} />{item}</span>)}</div>
        </Section>

        <Section eyebrow="Lista personalizada" title="Documentación que pueden solicitarte">
          <div className="grant-spain-document-grid">{documents.map((item) => <span key={item}><FileCheck2 size={16} />{item}</span>)}</div>
          <p className="grant-spain-note">No necesitas tenerlo todo preparado. Casamia crea una lista personalizada para tu caso.</p>
        </Section>

        <Section eyebrow="Catálogo configurable" title="Programas de ejemplo para mantener y verificar.">
          <div className="grant-spain-programme-grid">{sampleGrantProgrammes.map((programme) => <article key={programme.id}><strong>{programme.name}</strong><span>{programme.authorityLevel}</span><p>{programme.notes.join(' ')}</p></article>)}</div>
        </Section>

        <Section id="preguntas-frecuentes" eyebrow="Preguntas frecuentes" title="Respuestas claras antes de empezar.">
          <div className="grant-spain-faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
        </Section>

        <section className="grant-spain-final" id="contacto">
          <div className="site-shell">
            <h2>Tu hogar puede ser más seguro, accesible e independiente.</h2>
            <p>Las ayudas existen. El primer paso es identificar cuál corresponde a tu situación.</p>
            <div className="grant-spain-actions">
              <a className="grant-spain-button" href="#comprobar-elegibilidad">Comprobar mi ayuda</a>
              <a className="grant-spain-button is-secondary" href={phoneHref}>Hablar con Casamia</a>
            </div>
            <small>La comprobación es orientativa. La concesión y el importe final dependen de requisitos, plazos, disponibilidad presupuestaria y resolución de la administración competente.</small>
          </div>
        </section>

        <div className="grant-spain-mobile-ctas">
          <a href={phoneHref}>Llamar</a>
          <a href={whatsappHref}>WhatsApp</a>
        </div>
      </div>
    </>
  )
}

function Section({ id, eyebrow, title, children }: { id?: string; eyebrow: string; title: string; children: ReactNode }) {
  return <section className="grant-spain-section" id={id}><div className="site-shell"><p className="grant-spain-kicker">{eyebrow}</p><h2>{title}</h2>{children}</div></section>
}

function InfoCard({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return <article className="grant-spain-info-card"><span>{icon}</span><h3>{title}</h3><p>{body}</p></article>
}

function QuestionInput({ question, answers, updateAnswer, toggleMulti }: { question: CheckerQuestion; answers: GrantAnswers; updateAnswer: (id: keyof GrantAnswers, value: string) => void; toggleMulti: (id: 'difficulties' | 'adaptations' | 'documents', value: string) => void }) {
  if (question.type === 'location') {
    return <div className="grant-spain-location-grid">
      <label>Comunidad Autónoma<select value={answers.location?.autonomousCommunity ?? ''} onChange={(event) => updateLocation(answers, updateAnswer, 'autonomousCommunity', event.target.value)}><option value="">Seleccionar</option>{spanishAutonomousCommunities.map((item) => <option key={item}>{item}</option>)}</select></label>
      {(['province', 'municipality', 'postalCode'] as const).map((field) => <label key={field}>{field === 'province' ? 'Provincia' : field === 'municipality' ? 'Municipio' : 'Código postal'}<input value={answers.location?.[field] ?? ''} onChange={(event) => updateLocation(answers, updateAnswer, field, event.target.value)} /></label>)}
    </div>
  }
  if (question.type === 'multi') {
    const selected = answers[question.id] as string[]
    return <div className="grant-spain-option-grid">{question.options?.map((option) => <button className={selected.includes(option) ? 'is-selected' : ''} key={option} type="button" onClick={() => toggleMulti(question.id as 'difficulties' | 'adaptations' | 'documents', option)}>{option}</button>)}</div>
  }
  return <div className="grant-spain-option-grid">{question.options?.map((option) => <button className={answers[question.id] === option ? 'is-selected' : ''} key={option} type="button" onClick={() => updateAnswer(question.id, option)}>{option}</button>)}</div>
}

function updateLocation(answers: GrantAnswers, updateAnswer: (id: keyof GrantAnswers, value: string) => void, field: keyof NonNullable<GrantAnswers['location']>, value: string) {
  updateAnswer('location', { ...(answers.location ?? {}), [field]: value } as unknown as string)
}

function EligibilityResultPanel({ result, onEdit }: { result: GrantEligibilityResult; onEdit: () => void }) {
  const copy = resultCopy[result.level]
  return <div className="grant-spain-result"><BadgeEuro size={34} /><h3>{copy.title}</h3><p>{copy.body}</p><ResultList title="Indicadores favorables" items={result.favourableFactors} /><ResultList title="Según tus respuestas, Casamia revisará" items={result.availableFundingRoutes} /><ResultList title="Información pendiente" items={result.informationToVerify} /><ResultList title="Adaptaciones que pueden encajar" items={result.likelyEligibleAdaptations} /><ResultList title="Documentos recomendados" items={result.recommendedDocuments} /><p className="grant-spain-next"><strong>Siguiente paso:</strong> {result.recommendedNextAction}</p><div className="grant-spain-checker-actions"><button type="button" onClick={onEdit}>Editar respuestas</button><a href="#contacto-caso">{copy.cta}</a></div></div>
}

function ResultList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null
  return <div className="grant-spain-result-list"><strong>{title}</strong><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></div>
}

function LeadCapture({ result, submitted, setSubmitted }: { result: GrantEligibilityResult; submitted: boolean; setSubmitted: (value: boolean) => void }) {
  return <section className="grant-spain-lead-capture" id="contacto-caso"><div className="site-shell grant-spain-lead-grid"><div><p className="grant-spain-kicker">Enviar caso</p><h2>Casamia puede revisar tu ruta de ayuda.</h2><p>No ocultamos el resultado detrás de un formulario. Si quieres avanzar, envíanos el caso y preparamos la siguiente revisión.</p><p className="grant-spain-note">Preparado para conectar con Airtable, CRM, email interno, WhatsApp y sistema de evaluación Casamia.</p></div><form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); trackEvent('grant_lead_submitted', { result_category: result.level }) }}>{['Nombre', 'Teléfono', 'Email', 'Comunidad Autónoma', 'Municipio', 'Método de contacto preferido', 'Horario preferido'].map((label) => <label key={label}>{label}<input required={['Nombre', 'Teléfono'].includes(label)} /></label>)}<label>Descripción breve<textarea rows={4} /></label><label className="grant-spain-consent"><input required type="checkbox" />Acepto que Casamia use estos datos para revisar mi caso y contactarme.</label><button type="submit">Enviar mi caso a Casamia</button><div className="grant-spain-secondary-links"><a href={phoneHref}>Llamar</a><a href={whatsappHref}>WhatsApp</a><Link to="/home-safety-assessment">Solicitar visita</Link></div>{submitted ? <p className="grant-spain-success">Caso preparado. Casamia revisará la información y te contactará.</p> : null}</form></div></section>
}

function slugify(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, '-')
}

function buildGrantSchema() {
  const path = 'https://casamia.com.es/grants-for-home-adaptations-spain'
  return [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://casamia.com.es/' }, { '@type': 'ListItem', position: 2, name: 'Ayudas para adaptar vivienda', item: path }] },
    { '@context': 'https://schema.org', '@type': 'Service', name: 'Comprobación de ayudas para adaptar vivienda', serviceType: 'Ayudas accesibilidad vivienda España', areaServed: 'España', provider: { '@id': 'https://casamia.com.es/#organization' } },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) },
  ]
}
