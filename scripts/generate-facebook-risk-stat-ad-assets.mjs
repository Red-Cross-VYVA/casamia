import { createRequire } from 'node:module'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const require = createRequire(import.meta.url)
const { chromium } = require('playwright')

const root = process.cwd()
const outputDir = path.join(root, 'public', 'brand-assets', 'social', 'facebook-risk-stat-ads')
const fontDir = path.join(root, 'public', 'fonts')
const logoPath = path.join(root, 'public', 'apple-touch-icon.png')

const ads = [
  {
    id: '01-treinta-por-ciento-es',
    name: 'Treinta por ciento',
    image: 'public/images/solutions/living-risk-map.png',
    position: 'center 50%',
    accent: '#77bd32',
    source: 'Fuente: Sanidad',
    sourceUrl: 'https://www.sanidad.gob.es/gabinete/notasPrensa.do?id=6883',
    eyebrow: 'RIESGO REAL EN CASA',
    stat: '30%',
    statLabel: 'de las personas mayores de 65 sufre al menos una caída al año.',
    detail: 'CasaMia revisa baño, dormitorio, cocina y accesos para reducir riesgos antes del susto.',
    cta: 'Revisar mi hogar',
    primaryText: 'El 30% de las personas mayores de 65 años sufre al menos una caída al año. CasaMia revisa baño, dormitorio, cocina y accesos para detectar riesgos y crear un plan claro de adaptación.',
    headlineText: 'Riesgos reales en casa',
    description: 'Revisión CasaMia del hogar',
    url: 'https://www.casamia.com.es/es/home-safety-wizard?utm_source=facebook&utm_medium=paid_social&utm_campaign=risk_stats_spain&utm_content=thirty_percent_es',
  },
  {
    id: '02-cincuenta-por-ciento-es',
    name: 'Cincuenta por ciento',
    image: 'public/images/solutions/entrance-risk-map.png',
    position: 'center 50%',
    accent: '#2f9fd3',
    source: 'Fuente: Sanidad',
    sourceUrl: 'https://estilosdevidasaludable.sanidad.gob.es/seguridad/caidas/mayores/home.htm',
    eyebrow: 'A PARTIR DE 80 AÑOS',
    stat: '50%',
    statLabel: 'de las personas mayores de 80 sufre al menos una caída al año.',
    detail: 'CasaMia convierte recorridos, apoyos y obstáculos en prioridades claras de adaptación.',
    cta: 'Actuar antes',
    primaryText: 'A partir de los 80 años, el riesgo sube: Sanidad indica que el 50% se cae al menos una vez al año. CasaMia ayuda a revisar el hogar y priorizar cambios prácticos antes de que llegue la urgencia.',
    headlineText: 'Actúa antes de la primera caída',
    description: 'Plan práctico para adaptar el hogar',
    url: 'https://www.casamia.com.es/es/home-safety-wizard?utm_source=facebook&utm_medium=paid_social&utm_campaign=risk_stats_spain&utm_content=fifty_percent_es',
  },
  {
    id: '03-fractura-cadera-es',
    name: 'Fractura de cadera',
    image: 'public/images/solutions/bathroom-risk-map.png',
    position: 'center 48%',
    accent: '#f2b544',
    source: 'Fuente: Sanidad',
    sourceUrl: 'https://www.sanidad.gob.es/gabinete/notasPrensa.do?id=6883',
    eyebrow: 'CUANDO LA CAÍDA CAMBIA TODO',
    stat: '40%',
    statLabel: 'no recupera su nivel funcional tras una fractura de cadera.',
    detail: 'CasaMia revisa los riesgos del hogar antes de que una caída cambie la autonomía.',
    cta: 'Reducir riesgos',
    primaryText: 'Cerca del 40% de las personas que sufren una fractura de cadera no recupera su nivel funcional previo. CasaMia revisa los puntos críticos del hogar y crea un plan de adaptación por prioridades.',
    headlineText: 'Evita perder autonomía',
    description: 'Revisión CasaMia del hogar',
    url: 'https://www.casamia.com.es/es/home-safety-wizard?utm_source=facebook&utm_medium=paid_social&utm_campaign=risk_stats_spain&utm_content=hip_fracture_es',
  },
  {
    id: '04-primera-causa-es',
    name: 'Primera causa',
    image: 'public/images/solutions/first-thing-before-getting-up.jpg',
    position: 'center 43%',
    accent: '#77bd32',
    source: 'Fuente: Sanidad',
    sourceUrl: 'https://www.sanidad.gob.es/gabinete/notasPrensa.do?id=6883',
    eyebrow: 'EN MAYORES EN ESPAÑA',
    stat: '1ª causa',
    statLabel: 'de muerte por causas externas.',
    detail: 'CasaMia ayuda a anticiparse revisando riesgos reales y priorizando cambios en el hogar.',
    cta: 'Anticiparse ahora',
    primaryText: 'En España, las caídas son la primera causa de muerte por causas externas en personas mayores. CasaMia ayuda a anticiparse revisando riesgos del hogar y priorizando adaptaciones reales.',
    headlineText: 'Anticípate a los riesgos en casa',
    description: 'Revisión y plan CasaMia',
    url: 'https://www.casamia.com.es/es/home-safety-wizard?utm_source=facebook&utm_medium=paid_social&utm_campaign=risk_stats_spain&utm_content=first_cause_es',
  },
]

const mimeTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
}

async function dataUrl(filePath) {
  const buffer = await readFile(filePath)
  const mimeType = mimeTypes[path.extname(filePath).toLowerCase()]
  return `data:${mimeType};base64,${buffer.toString('base64')}`
}

function htmlEscape(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

async function pageMarkup(ad) {
  const [logoUrl, interUrl, playfairUrl, imageUrl] = await Promise.all([
    dataUrl(logoPath),
    dataUrl(path.join(fontDir, 'inter-latin.woff2')),
    dataUrl(path.join(fontDir, 'playfair-display-latin-normal.woff2')),
    dataUrl(path.join(root, ad.image)),
  ])

  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8">
      <style>
        @font-face { font-family: Inter; src: url('${interUrl}') format('woff2'); font-weight: 100 900; }
        @font-face { font-family: Playfair; src: url('${playfairUrl}') format('woff2'); font-weight: 400 900; }
        * { box-sizing: border-box; }
        html, body { margin: 0; width: 1080px; height: 1350px; overflow: hidden; }
        body { background: #10283e; color: #ffffff; font-family: Inter, Arial, sans-serif; }
        .ad { position: relative; width: 1080px; height: 1350px; overflow: hidden; background: #10283e; }
        .photo {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: ${ad.position};
          opacity: 0.52;
          filter: saturate(0.78) contrast(1.06);
        }
        .shade {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(16, 40, 62, 0.12) 0%, rgba(16, 40, 62, 0.72) 42%, rgba(16, 40, 62, 0.96) 100%),
            radial-gradient(circle at 18% 22%, rgba(255, 255, 255, 0.12), transparent 26%),
            linear-gradient(90deg, rgba(16, 40, 62, 0.18) 0%, rgba(16, 40, 62, 0.02) 48%, rgba(16, 40, 62, 0.38) 100%);
        }
        .brand {
          position: absolute;
          top: 54px;
          left: 54px;
          display: flex;
          align-items: center;
          gap: 16px;
          min-height: 82px;
          padding: 13px 24px 13px 14px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 18px 48px rgba(8, 31, 48, 0.22);
        }
        .brand img { width: 56px; height: 56px; display: block; }
        .brand span { font-size: 31px; font-weight: 900; line-height: 1; color: #10283e; }
        .source {
          position: absolute;
          top: 76px;
          right: 54px;
          padding: 15px 18px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.90);
          color: #10283e;
          font-size: 20px;
          font-weight: 900;
        }
        .content {
          position: absolute;
          left: 54px;
          right: 54px;
          bottom: 54px;
          display: grid;
          gap: 28px;
        }
        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          color: #ffffff;
          font-size: 25px;
          line-height: 1.1;
          font-weight: 950;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          text-shadow: 0 3px 18px rgba(0, 0, 0, 0.30);
        }
        .eyebrow::before {
          content: '';
          width: 58px;
          height: 9px;
          border-radius: 999px;
          background: ${ad.accent};
        }
        .stat-card {
          display: grid;
          gap: 22px;
          padding: 46px 52px 48px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.96);
          color: #10283e;
          box-shadow: 0 28px 70px rgba(8, 31, 48, 0.34);
        }
        .stat {
          color: ${ad.accent};
          font-family: Playfair, Georgia, serif;
          font-size: 156px;
          line-height: 0.86;
          font-weight: 900;
          letter-spacing: 0;
        }
        .stat-label {
          max-width: 880px;
          color: #10283e;
          font-size: 48px;
          line-height: 1.03;
          font-weight: 950;
        }
        .detail {
          max-width: 870px;
          color: #344b5f;
          font-size: 31px;
          line-height: 1.22;
          font-weight: 800;
        }
        .footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 26px;
          margin-top: 10px;
        }
        .promise {
          max-width: 390px;
          color: #176b95;
          font-size: 25px;
          line-height: 1.16;
          font-weight: 950;
        }
        .cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          min-width: 330px;
          min-height: 74px;
          padding: 0 30px;
          border-radius: 8px;
          background: ${ad.accent};
          color: ${ad.accent === '#f2b544' ? '#10283e' : '#ffffff'};
          font-size: 26px;
          font-weight: 950;
          box-shadow: 0 16px 38px rgba(8, 31, 48, 0.18);
        }
        .cta span { font-size: 35px; line-height: 1; transform: translateY(-1px); }
      </style>
    </head>
    <body>
      <main class="ad">
        <img class="photo" src="${imageUrl}" alt="">
        <div class="shade"></div>
        <div class="brand"><img src="${logoUrl}" alt=""><span>CasaMia</span></div>
        <div class="source">${htmlEscape(ad.source)}</div>
        <section class="content">
          <div class="eyebrow">${htmlEscape(ad.eyebrow)}</div>
          <div class="stat-card">
            <div class="stat">${htmlEscape(ad.stat)}</div>
            <div class="stat-label">${htmlEscape(ad.statLabel)}</div>
            <div class="detail">${htmlEscape(ad.detail)}</div>
            <div class="footer">
              <div class="promise">Riesgo real. Plan práctico. Sin compras a ciegas.</div>
              <div class="cta">${htmlEscape(ad.cta)} <span>→</span></div>
            </div>
          </div>
        </section>
      </main>
    </body>
  </html>`
}

function copyMarkdown() {
  const rows = ads.map((ad, index) => `## ${index + 1}. ${ad.name}

Image: \`${ad.id}.jpg\`

Primary text:

${ad.primaryText}

Headline: ${ad.headlineText}

Description: ${ad.description}

URL:

${ad.url}

Visual source note: ${ad.source} - ${ad.sourceUrl}
`).join('\n')

  return `# CasaMia Risk Stat Facebook Ad Concepts

Spanish-first paid ad concepts built around large risk statistics from Spain's Ministerio de Sanidad. The statistics are intentionally short on-image; use the ad text and landing page for nuance.

${rows}`
}

await mkdir(outputDir, { recursive: true })
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 })

for (const ad of ads) {
  await page.setContent(await pageMarkup(ad), { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({
    path: path.join(outputDir, `${ad.id}.jpg`),
    type: 'jpeg',
    quality: 94,
  })
}

await browser.close()
await writeFile(path.join(outputDir, 'facebook-risk-stat-ads.md'), copyMarkdown(), 'utf8')

console.log(`Generated ${ads.length} risk stat ad assets in ${outputDir}`)
