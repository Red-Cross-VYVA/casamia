import { Pause, Play } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import '../styles/manufacturer-marquee.css'

type SupportedLanguage = 'de' | 'en' | 'es' | 'fr' | 'nl'

type MarqueeCopy = {
  eyebrow: string
  title: string
  description: string
  pause: string
  play: string
  note: string
  categories: Record<CategoryKey, string>
}

type CategoryKey = 'access' | 'bathroom' | 'dailyLiving' | 'homecare' | 'mobility'

const copyByLanguage: Record<SupportedLanguage, MarqueeCopy> = {
  en: {
    eyebrow: 'Accessible home products',
    title: 'Designed for safer, easier living.',
    description:
      'Examples of manufacturers developing accessible home solutions across Spain and Europe.',
    pause: 'Pause brand carousel',
    play: 'Play brand carousel',
    note: 'Industry examples only. Inclusion does not imply a partnership or endorsement. Product suitability and availability vary.',
    categories: {
      access: 'Home access',
      bathroom: 'Accessible bathrooms',
      dailyLiving: 'Daily-living aids',
      homecare: 'Homecare equipment',
      mobility: 'Mobility support',
    },
  },
  es: {
    eyebrow: 'Productos para un hogar accesible',
    title: 'Diseñados para vivir con más seguridad y autonomía.',
    description:
      'Ejemplos de fabricantes que desarrollan soluciones de accesibilidad para el hogar en España y Europa.',
    pause: 'Pausar carrusel de marcas',
    play: 'Reproducir carrusel de marcas',
    note: 'Ejemplos del sector. Su inclusión no implica colaboración ni recomendación. La idoneidad y disponibilidad de cada producto pueden variar.',
    categories: {
      access: 'Acceso al hogar',
      bathroom: 'Baños accesibles',
      dailyLiving: 'Ayudas para el día a día',
      homecare: 'Equipamiento doméstico',
      mobility: 'Apoyo a la movilidad',
    },
  },
  de: {
    eyebrow: 'Produkte für ein barrierearmes Zuhause',
    title: 'Entwickelt für ein sichereres, selbstständigeres Leben.',
    description:
      'Beispiele für Hersteller von Lösungen für ein barrierearmes Zuhause in Spanien und Europa.',
    pause: 'Markenkarussell anhalten',
    play: 'Markenkarussell abspielen',
    note: 'Beispiele aus der Branche. Die Nennung bedeutet weder eine Partnerschaft noch eine Empfehlung. Eignung und Verfügbarkeit der Produkte können variieren.',
    categories: {
      access: 'Zugang zum Haus',
      bathroom: 'Barrierefreie Bäder',
      dailyLiving: 'Alltagshilfen',
      homecare: 'Hilfsmittel für zu Hause',
      mobility: 'Mobilitätshilfen',
    },
  },
  fr: {
    eyebrow: 'Produits pour un logement accessible',
    title: 'Conçus pour vivre chez soi avec plus de sécurité et d’autonomie.',
    description:
      'Exemples de fabricants développant des solutions d’accessibilité pour le logement en Espagne et en Europe.',
    pause: 'Mettre le carrousel en pause',
    play: 'Lire le carrousel de marques',
    note: 'Exemples du secteur. Leur présence n’implique ni partenariat ni recommandation. L’adéquation et la disponibilité des produits peuvent varier.',
    categories: {
      access: 'Accès au domicile',
      bathroom: 'Salles de bains accessibles',
      dailyLiving: 'Aides au quotidien',
      homecare: 'Équipement à domicile',
      mobility: 'Aides à la mobilité',
    },
  },
  nl: {
    eyebrow: 'Producten voor een toegankelijk huis',
    title: 'Ontworpen om veiliger en zelfstandiger thuis te wonen.',
    description:
      'Voorbeelden van fabrikanten die in Spanje en Europa oplossingen voor toegankelijke woningen ontwikkelen.',
    pause: 'Merkencarrousel pauzeren',
    play: 'Merkencarrousel afspelen',
    note: 'Voorbeelden uit de sector. Vermelding houdt geen partnerschap of aanbeveling in. Geschiktheid en beschikbaarheid kunnen verschillen.',
    categories: {
      access: 'Woningtoegang',
      bathroom: 'Toegankelijke badkamers',
      dailyLiving: 'Hulpmiddelen voor elke dag',
      homecare: 'Thuiszorgapparatuur',
      mobility: 'Mobiliteitshulpmiddelen',
    },
  },
}

const manufacturers: Array<{ name: string; className: string; category: CategoryKey }> = [
  { name: 'ROCA', className: 'is-roca', category: 'bathroom' },
  { name: 'KMINA', className: 'is-kmina', category: 'dailyLiving' },
  { name: 'FORTA', className: 'is-forta', category: 'mobility' },
  { name: 'GEBERIT', className: 'is-geberit', category: 'bathroom' },
  { name: 'Invacare', className: 'is-invacare', category: 'homecare' },
  { name: 'Stannah', className: 'is-stannah', category: 'access' },
  { name: 'TK Elevator', className: 'is-tk-elevator', category: 'access' },
  { name: 'Etac', className: 'is-etac', category: 'mobility' },
  { name: 'Pressalit', className: 'is-pressalit', category: 'bathroom' },
  { name: 'ROPOX', className: 'is-ropox', category: 'dailyLiving' },
]

function ManufacturerGroup({ copy, duplicate = false }: { copy: MarqueeCopy; duplicate?: boolean }) {
  return (
    <div className="manufacturer-marquee__group" aria-hidden={duplicate || undefined}>
      {manufacturers.map((manufacturer) => (
        <div className="manufacturer-marquee__brand" key={`${duplicate ? 'copy-' : ''}${manufacturer.name}`}>
          <span className={`manufacturer-marquee__wordmark ${manufacturer.className}`}>
            {manufacturer.name}
          </span>
          <span className="manufacturer-marquee__category">
            {copy.categories[manufacturer.category]}
          </span>
        </div>
      ))}
    </div>
  )
}

export function ManufacturerMarquee() {
  const { i18n } = useTranslation()
  const [isPaused, setIsPaused] = useState(false)
  const copy = useMemo(() => {
    const language = (i18n.resolvedLanguage || i18n.language || 'en').slice(0, 2) as SupportedLanguage
    return copyByLanguage[language] ?? copyByLanguage.en
  }, [i18n.language, i18n.resolvedLanguage])

  return (
    <section className="manufacturer-marquee-section" aria-labelledby="manufacturer-marquee-title">
      <div className="site-shell manufacturer-marquee__header">
        <div className="manufacturer-marquee__copy">
          <span className="manufacturer-marquee__eyebrow">{copy.eyebrow}</span>
          <h2 id="manufacturer-marquee-title">{copy.title}</h2>
          <p>{copy.description}</p>
        </div>

        <button
          className="manufacturer-marquee__toggle"
          type="button"
          aria-label={isPaused ? copy.play : copy.pause}
          aria-pressed={isPaused}
          onClick={() => setIsPaused((paused) => !paused)}
        >
          {isPaused ? <Play size={16} fill="currentColor" aria-hidden="true" /> : <Pause size={16} fill="currentColor" aria-hidden="true" />}
          <span>{isPaused ? copy.play : copy.pause}</span>
        </button>
      </div>

      <div className="manufacturer-marquee__viewport">
        <div className={`manufacturer-marquee__track${isPaused ? ' is-paused' : ''}`}>
          <ManufacturerGroup copy={copy} />
          <ManufacturerGroup copy={copy} duplicate />
        </div>
      </div>

      <p className="site-shell manufacturer-marquee__note">{copy.note}</p>
    </section>
  )
}
