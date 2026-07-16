export const preventionFactSources = {
  census: 'https://www.census.gov/library/stories/2020/06/old-housing-new-needs.html',
  healthMinistry: 'https://www.sanidad.gob.es/gabinete/notasPrensa.do?id=6883',
  ineHomeCare: 'https://www.ine.es/dyngs/Prensa/es/m2ECV2024.htm',
  whoEurope: 'https://www.who.int/europe/news-room/questions-and-answers/item/long-term-care',
} as const

export type PreventionFactSource = keyof typeof preventionFactSources

export type PreventionFact = {
  value: string
  label: string
  source: PreventionFactSource
  sourceName: string
}

export type PreventionSupportingStat = {
  value: string
  label: string
}

type PreventionRotatorCopy = {
  body: string
  facts: PreventionFact[]
  supportingStats: PreventionSupportingStat[]
  controls: {
    carouselLabel: string
    previous: string
    next: string
    pause: string
    play: string
    showFact: string
    fact: string
    of: string
    source: string
  }
}

type LanguageKey = 'de' | 'en' | 'es' | 'fr' | 'nl'

const preventionCopy = {
  en: {
    body:
      'As balance, mobility and vision change, a familiar home can become harder to navigate. The consequences are serious, but many hazards can be found and addressed before a crisis.',
    facts: [
      {
        value: 'ONLY 10%',
        label: 'of U.S. homes are fully “aging-ready.”',
        source: 'census',
        sourceName: 'U.S. Census Bureau',
      },
      {
        value: 'AROUND 30%',
        label: 'of people 65+ experience at least one fall each year.',
        source: 'healthMinistry',
        sourceName: 'Spain’s Ministry of Health',
      },
      {
        value: 'NEARLY 40%',
        label: 'of hip-fracture patients do not regain their prior function.',
        source: 'healthMinistry',
        sourceName: 'Spain’s Ministry of Health',
      },
      {
        value: '37.1%',
        label: 'of Spanish households needing care at home had an unmet need.',
        source: 'ineHomeCare',
        sourceName: 'Spain’s National Statistics Institute',
      },
      {
        value: 'FEWER THAN 1 IN 4',
        label: 'older people with care needs across WHO Europe can access home-based care.',
        source: 'whoEurope',
        sourceName: 'WHO Europe',
      },
      {
        value: '3,000+',
        label: 'people 65+ die from falls in Spain each year.',
        source: 'healthMinistry',
        sourceName: 'Spain’s Ministry of Health',
      },
    ],
    supportingStats: [
      { value: '≈30%', label: 'of people 65+ fall at least once a year' },
      { value: '≈40%', label: 'of hip-fracture patients do not regain prior function' },
      {
        value: '37.1%',
        label: 'of Spanish households needing home care had an unmet need',
      },
    ],
    controls: {
      carouselLabel: 'Risks of ageing in place',
      previous: 'Previous fact',
      next: 'Next fact',
      pause: 'Pause automatic rotation',
      play: 'Start automatic rotation',
      showFact: 'Show fact',
      fact: 'Fact',
      of: 'of',
      source: 'Source',
    },
  },
  es: {
    body:
      'A medida que cambian el equilibrio, la movilidad y la visión, una vivienda conocida puede volverse más difícil de usar. Las consecuencias son serias, pero muchos riesgos pueden detectarse y corregirse antes de una crisis.',
    facts: [
      {
        value: 'SOLO EL 10%',
        label: 'de las viviendas de EE. UU. está adaptada para envejecer en casa.',
        source: 'census',
        sourceName: 'Oficina del Censo de EE. UU.',
      },
      {
        value: 'CERCA DEL 30%',
        label: 'de las personas de 65 años o más sufre al menos una caída al año.',
        source: 'healthMinistry',
        sourceName: 'Ministerio de Sanidad',
      },
      {
        value: 'CASI EL 40%',
        label: 'de quienes sufren una fractura de cadera no recupera su función previa.',
        source: 'healthMinistry',
        sourceName: 'Ministerio de Sanidad',
      },
      {
        value: '37,1%',
        label: 'de los hogares españoles que necesita cuidados en casa tiene una necesidad no cubierta.',
        source: 'ineHomeCare',
        sourceName: 'Instituto Nacional de Estadística',
      },
      {
        value: 'MENOS DE 1 DE CADA 4',
        label:
          'personas mayores con necesidades asistenciales en la región europea de la OMS accede a cuidados en casa.',
        source: 'whoEurope',
        sourceName: 'OMS Europa',
      },
      {
        value: 'MÁS DE 3.000',
        label: 'personas de 65 años o más mueren por caídas cada año en España.',
        source: 'healthMinistry',
        sourceName: 'Ministerio de Sanidad',
      },
    ],
    supportingStats: [
      { value: '≈30%', label: 'de las personas de 65 años o más sufre al menos una caída al año' },
      { value: '≈40%', label: 'de quienes sufren una fractura de cadera no recupera su función previa' },
      {
        value: '37,1%',
        label: 'de los hogares españoles que necesita cuidados en casa tiene una necesidad no cubierta',
      },
    ],
    controls: {
      carouselLabel: 'Riesgos de envejecer en casa',
      previous: 'Dato anterior',
      next: 'Dato siguiente',
      pause: 'Pausar la rotación automática',
      play: 'Iniciar la rotación automática',
      showFact: 'Mostrar dato',
      fact: 'Dato',
      of: 'de',
      source: 'Fuente',
    },
  },
  de: {
    body:
      'Wenn sich Gleichgewicht, Mobilität und Sehkraft verändern, kann eine vertraute Wohnung schwieriger zu nutzen sein. Die Folgen sind ernst, doch viele Gefahren lassen sich erkennen und beheben, bevor es zu einer Krise kommt.',
    facts: [
      {
        value: 'NUR 10 %',
        label: 'der US-Wohnungen sind fürs Älterwerden zu Hause geeignet.',
        source: 'census',
        sourceName: 'U.S. Census Bureau',
      },
      {
        value: 'RUND 30 %',
        label: 'der Menschen ab 65 stürzen mindestens einmal pro Jahr.',
        source: 'healthMinistry',
        sourceName: 'Spanisches Gesundheitsministerium',
      },
      {
        value: 'FAST 40 %',
        label: 'der Menschen mit Hüftfraktur erreichen ihr früheres Funktionsniveau nicht wieder.',
        source: 'healthMinistry',
        sourceName: 'Spanisches Gesundheitsministerium',
      },
      {
        value: '37,1 %',
        label: 'der spanischen Haushalte mit Bedarf an häuslicher Betreuung konnten diesen Bedarf nicht decken.',
        source: 'ineHomeCare',
        sourceName: 'Spanisches Statistikamt',
      },
      {
        value: 'WENIGER ALS 1 VON 4',
        label: 'pflegebedürftigen Menschen ab 65 in der WHO-Region Europa hat Zugang zu häuslicher Betreuung.',
        source: 'whoEurope',
        sourceName: 'WHO Europa',
      },
      {
        value: 'ÜBER 3.000',
        label: 'Menschen ab 65 sterben in Spanien jedes Jahr infolge von Stürzen.',
        source: 'healthMinistry',
        sourceName: 'Spanisches Gesundheitsministerium',
      },
    ],
    supportingStats: [
      { value: '≈30 %', label: 'der Menschen ab 65 stürzen mindestens einmal pro Jahr' },
      { value: '≈40 %', label: 'der Menschen mit Hüftfraktur erreichen ihr früheres Funktionsniveau nicht wieder' },
      {
        value: '37,1 %',
        label: 'der spanischen Haushalte mit Bedarf an häuslicher Betreuung konnten ihn nicht decken',
      },
    ],
    controls: {
      carouselLabel: 'Risiken beim Älterwerden zu Hause',
      previous: 'Vorherige Zahl',
      next: 'Nächste Zahl',
      pause: 'Automatischen Wechsel pausieren',
      play: 'Automatischen Wechsel starten',
      showFact: 'Zahl anzeigen',
      fact: 'Zahl',
      of: 'von',
      source: 'Quelle',
    },
  },
  fr: {
    body:
      'Lorsque l’équilibre, la mobilité et la vue évoluent, un logement familier peut devenir plus difficile à utiliser. Les conséquences sont sérieuses, mais de nombreux risques peuvent être détectés et corrigés avant une crise.',
    facts: [
      {
        value: 'SEULEMENT 10 %',
        label: 'des logements aux États-Unis sont adaptés au vieillissement à domicile.',
        source: 'census',
        sourceName: 'Bureau du recensement des États-Unis',
      },
      {
        value: 'ENVIRON 30 %',
        label: 'des personnes de 65 ans ou plus chutent au moins une fois par an.',
        source: 'healthMinistry',
        sourceName: 'Ministère espagnol de la Santé',
      },
      {
        value: 'PRÈS DE 40 %',
        label: 'des personnes ayant une fracture de la hanche ne retrouvent pas leur fonction antérieure.',
        source: 'healthMinistry',
        sourceName: 'Ministère espagnol de la Santé',
      },
      {
        value: '37,1 %',
        label: 'des ménages espagnols ayant besoin d’aide à domicile ont un besoin non couvert.',
        source: 'ineHomeCare',
        sourceName: 'Institut national de la statistique espagnol',
      },
      {
        value: 'MOINS D’1 SUR 4',
        label:
          'des personnes de 65 ans ou plus ayant besoin d’aide dans la région européenne de l’OMS accède aux soins à domicile.',
        source: 'whoEurope',
        sourceName: 'OMS Europe',
      },
      {
        value: 'PLUS DE 3 000',
        label: 'personnes de 65 ans ou plus meurent chaque année des suites d’une chute en Espagne.',
        source: 'healthMinistry',
        sourceName: 'Ministère espagnol de la Santé',
      },
    ],
    supportingStats: [
      { value: '≈30 %', label: 'des personnes de 65 ans ou plus chutent au moins une fois par an' },
      { value: '≈40 %', label: 'des personnes ayant une fracture de la hanche ne retrouvent pas leur fonction antérieure' },
      {
        value: '37,1 %',
        label: 'des ménages espagnols ayant besoin d’aide à domicile avaient un besoin non couvert',
      },
    ],
    controls: {
      carouselLabel: 'Risques liés au vieillissement à domicile',
      previous: 'Chiffre précédent',
      next: 'Chiffre suivant',
      pause: 'Mettre la rotation automatique en pause',
      play: 'Démarrer la rotation automatique',
      showFact: 'Afficher le chiffre',
      fact: 'Chiffre',
      of: 'sur',
      source: 'Source',
    },
  },
  nl: {
    body:
      'Wanneer evenwicht, mobiliteit en zicht veranderen, kan een vertrouwd huis moeilijker te gebruiken worden. De gevolgen zijn ernstig, maar veel risico’s kunnen worden opgespoord en aangepakt voordat er een crisis ontstaat.',
    facts: [
      {
        value: 'SLECHTS 10%',
        label: 'van de woningen in de VS is geschikt om thuis ouder te worden.',
        source: 'census',
        sourceName: 'U.S. Census Bureau',
      },
      {
        value: 'ONGEVEER 30%',
        label: 'van de mensen van 65 jaar en ouder valt minstens één keer per jaar.',
        source: 'healthMinistry',
        sourceName: 'Spaans ministerie van Volksgezondheid',
      },
      {
        value: 'BIJNA 40%',
        label: 'van de mensen met een heupfractuur herwint het eerdere functioneren niet.',
        source: 'healthMinistry',
        sourceName: 'Spaans ministerie van Volksgezondheid',
      },
      {
        value: '37,1%',
        label: 'van de Spaanse huishoudens die thuiszorg nodig hebben, heeft een onvervulde behoefte.',
        source: 'ineHomeCare',
        sourceName: 'Spaans nationaal statistiekbureau',
      },
      {
        value: 'MINDER DAN 1 OP DE 4',
        label: 'zorgbehoevende 65-plussers in de Europese WHO-regio heeft toegang tot thuiszorg.',
        source: 'whoEurope',
        sourceName: 'WHO Europa',
      },
      {
        value: 'MEER DAN 3.000',
        label: '65-plussers overlijden in Spanje elk jaar door een val.',
        source: 'healthMinistry',
        sourceName: 'Spaans ministerie van Volksgezondheid',
      },
    ],
    supportingStats: [
      { value: '≈30%', label: 'van de mensen van 65 jaar en ouder valt minstens één keer per jaar' },
      { value: '≈40%', label: 'van de mensen met een heupfractuur herwint het eerdere functioneringsniveau niet' },
      {
        value: '37,1%',
        label: 'van de Spaanse huishoudens met behoefte aan thuiszorg kon die behoefte niet vervullen',
      },
    ],
    controls: {
      carouselLabel: 'Risico’s van thuis ouder worden',
      previous: 'Vorig feit',
      next: 'Volgend feit',
      pause: 'Automatisch wisselen pauzeren',
      play: 'Automatisch wisselen starten',
      showFact: 'Feit tonen',
      fact: 'Feit',
      of: 'van',
      source: 'Bron',
    },
  },
} satisfies Record<LanguageKey, PreventionRotatorCopy>

export function getPreventionRotatorCopy(language: string): PreventionRotatorCopy {
  const languageKey = language.toLowerCase().split('-')[0] as LanguageKey
  return preventionCopy[languageKey] ?? preventionCopy.en
}
