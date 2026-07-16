import { MapPin } from 'lucide-react'
import { useState } from 'react'

export type SpainCoverageCopy = {
  title: string
  badge: string
  legend: string
  hint: string
  repSingular: string
  repPlural: string
  orderNow: string
}

type CoveragePoint = {
  id: string
  label: {
    en: string
    es: string
  }
  x: number
  y: number
  reps: number
  names: string[]
}

const coveragePoints = [
  {
    id: 'galicia',
    label: { en: 'Galicia', es: 'Galicia' },
    x: 129,
    y: 126,
    reps: 2,
    names: ['Lucía Ferreiro', 'Mateo Vidal'],
  },
  {
    id: 'basque-country',
    label: { en: 'Basque Country', es: 'País Vasco' },
    x: 371,
    y: 102,
    reps: 2,
    names: ['Iker Arrieta', 'Ane Lasa'],
  },
  {
    id: 'catalonia',
    label: { en: 'Catalonia', es: 'Cataluña' },
    x: 499,
    y: 163,
    reps: 4,
    names: ['Marta Soler', 'Pau Riera', 'Núria Vidal', 'Oriol Serra'],
  },
  {
    id: 'madrid',
    label: { en: 'Madrid', es: 'Madrid' },
    x: 307,
    y: 197,
    reps: 5,
    names: ['Clara Martín', 'Javier Rojas', 'Sofía León', 'Diego Campos', 'Elena Mora'],
  },
  {
    id: 'valencia',
    label: { en: 'Valencia', es: 'Valencia' },
    x: 443,
    y: 247,
    reps: 3,
    names: ['Amparo Costa', 'Hugo Ferrer', 'Laia Torres'],
  },
  {
    id: 'andalusia',
    label: { en: 'Andalusia', es: 'Andalucía' },
    x: 291,
    y: 319,
    reps: 4,
    names: ['Carmen Ruiz', 'Manuel Vega', 'Inés Molina', 'Rafael Soto'],
  },
  {
    id: 'balearic-islands',
    label: { en: 'Balearic Islands', es: 'Baleares' },
    x: 552,
    y: 251,
    reps: 2,
    names: ['Marina Pons', 'Toni Ferrà'],
  },
  {
    id: 'canary-islands',
    label: { en: 'Canary Islands', es: 'Canarias' },
    x: 158,
    y: 371,
    reps: 2,
    names: ['Nayra Suárez', 'Álvaro Cabrera'],
  },
] satisfies CoveragePoint[]

function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function SpainCoverageMap({
  copy,
  language,
}: {
  copy: SpainCoverageCopy
  language: string
}) {
  const [activePoint, setActivePoint] = useState<CoveragePoint | null>(null)
  const isSpanish = language.startsWith('es')
  const tooltipWidth = 228
  const tooltipHeight = activePoint ? 116 + activePoint.names.length * 17 : 0
  const tooltipButtonY = activePoint ? 75 + activePoint.names.length * 17 : 0
  const tooltipX = activePoint
    ? clampNumber(activePoint.x - tooltipWidth / 2, 16, 640 - tooltipWidth - 16)
    : 0
  const tooltipY = activePoint
    ? activePoint.y > 180
      ? activePoint.y - tooltipHeight - 30
      : activePoint.y + 30
    : 0

  return (
    <aside className="about-map-card" aria-label={copy.title}>
      <div className="about-map-header">
        <span>
          <MapPin size={18} aria-hidden="true" />
          {copy.badge}
        </span>
        <strong>{copy.legend}</strong>
      </div>

      <svg
        className="about-spain-map"
        viewBox="0 0 640 430"
        role="img"
        aria-label={isSpanish ? 'Mapa de cobertura de representantes en España' : 'Representative coverage map of Spain'}
        onMouseLeave={() => setActivePoint(null)}
      >
        <defs>
          <linearGradient id="aboutSpainLand" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#eaf5fc" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
          <filter id="aboutPointGlow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          className="about-map-land"
          d="M127 89 L221 58 L332 64 L414 92 L496 111 L555 166 L536 235 L473 292 L382 334 L276 324 L194 288 L131 231 L93 157 Z"
          fill="url(#aboutSpainLand)"
        />
        <path
          className="about-map-portugal"
          d="M111 137 L158 120 L170 177 L158 246 L192 289 L146 272 L107 221 L84 159 Z"
        />
        <path className="about-map-island" d="M540 247 q26 -17 52 0 q-21 21 -52 0Z" />
        <path className="about-map-island" d="M112 370 q31 -20 68 -4 q-24 24 -68 4Z" />

        {coveragePoints.map((point) => (
          <g
            className={`about-map-marker${activePoint?.id === point.id ? ' is-active' : ''}`}
            key={point.id}
            role="button"
            tabIndex={0}
            transform={`translate(${point.x} ${point.y})`}
            aria-label={`${isSpanish ? point.label.es : point.label.en}: ${point.reps} ${
              point.reps === 1 ? copy.repSingular : copy.repPlural
            }. ${point.names.join(', ')}`}
            onBlur={() => setActivePoint(null)}
            onClick={() => setActivePoint(point)}
            onFocus={() => setActivePoint(point)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                setActivePoint(point)
              }
            }}
            onMouseEnter={() => setActivePoint(point)}
          >
            <title>
              {isSpanish ? point.label.es : point.label.en}: {point.reps}{' '}
              {point.reps === 1 ? copy.repSingular : copy.repPlural}
            </title>
            <circle className="about-map-pulse" r="19" />
            <circle className="about-map-point" r="8" filter="url(#aboutPointGlow)" />
          </g>
        ))}

        {activePoint ? (
          <g className="about-map-tooltip" transform={`translate(${tooltipX} ${tooltipY})`}>
            <rect width={tooltipWidth} height={tooltipHeight} rx="14" />
            <text className="about-map-tooltip-title" x="17" y="27">
              {isSpanish ? activePoint.label.es : activePoint.label.en}
            </text>
            <text className="about-map-tooltip-meta" x="17" y="48">
              {activePoint.reps} {activePoint.reps === 1 ? copy.repSingular : copy.repPlural}
            </text>
            {activePoint.names.map((name, index) => (
              <text className="about-map-tooltip-name" key={name} x="17" y={73 + index * 17}>
                {name}
              </text>
            ))}
            <a
              aria-label={`${copy.orderNow}: ${isSpanish ? activePoint.label.es : activePoint.label.en}`}
              className="about-map-tooltip-cta"
              href={`/order?zone=${activePoint.id}`}
            >
              <rect x="17" y={tooltipButtonY} width={tooltipWidth - 34} height="34" rx="17" />
              <text x={tooltipWidth / 2} y={tooltipButtonY + 22} textAnchor="middle">
                {copy.orderNow}
              </text>
            </a>
          </g>
        ) : null}
      </svg>

      <p className="about-map-hint">{copy.hint}</p>

      <div className="about-region-list" aria-label={copy.legend}>
        {coveragePoints.map((point) => (
          <button
            className={activePoint?.id === point.id ? 'is-active' : ''}
            key={point.id}
            type="button"
            onBlur={() => setActivePoint(null)}
            onClick={() => setActivePoint(point)}
            onFocus={() => setActivePoint(point)}
            onMouseEnter={() => setActivePoint(point)}
            onMouseLeave={() => setActivePoint(null)}
          >
            <span>{isSpanish ? point.label.es : point.label.en}</span>
            <strong>
              {point.reps} {point.reps === 1 ? copy.repSingular : copy.repPlural}
            </strong>
          </button>
        ))}
      </div>
    </aside>
  )
}
