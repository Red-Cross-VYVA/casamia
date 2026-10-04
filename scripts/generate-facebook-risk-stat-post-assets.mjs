import { createRequire } from 'node:module'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const require = createRequire(import.meta.url)
const { chromium } = require('playwright')

const root = process.cwd()
const outputDir = path.join(root, 'public', 'brand-assets', 'social', 'facebook-risk-stat-posts')
const fontDir = path.join(root, 'public', 'fonts')
const logoPath = path.join(root, 'public', 'apple-touch-icon.png')

const posts = [
  {
    id: '01-treinta-por-ciento-es',
    title: '30% mayores de 65',
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
    caption: 'El 30% de las personas mayores de 65 años sufre al menos una caída al año.\n\nNo se trata de alarmar. Se trata de mirar la casa con calma: baño, dormitorio, cocina, accesos y rutinas diarias.\n\nCasaMia ayuda a detectar riesgos y convertirlos en un plan claro de adaptación.\n\nEmpieza la revisión: https://www.casamia.com.es/es/home-safety-wizard?utm_source=facebook&utm_medium=organic_social&utm_campaign=risk_stats_spain&utm_content=thirty_percent_es\n\nFuente: Ministerio de Sanidad.\n\n#CasaMia #PrevencionDeCaidas #HogarSeguro #España',
  },
  {
    id: '02-cincuenta-por-ciento-es',
    title: '50% mayores de 80',
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
    caption: 'A partir de los 80 años, Sanidad indica que el 50% de las personas mayores sufre al menos una caída al año.\n\nEl riesgo suele estar en detalles muy concretos: una alfombra, un acceso, una rutina nocturna, una ducha difícil o un apoyo mal colocado.\n\nCasaMia revisa el hogar y prioriza cambios prácticos antes de que llegue la urgencia.\n\nEmpieza la revisión: https://www.casamia.com.es/es/home-safety-wizard?utm_source=facebook&utm_medium=organic_social&utm_campaign=risk_stats_spain&utm_content=fifty_percent_es\n\nFuente: Ministerio de Sanidad.\n\n#CasaMia #HogarSeguro #Mayores #PrevencionDeCaidas',
  },
  {
    id: '03-fractura-cadera-es',
    title: '40% fractura de cadera',
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
    caption: 'Cerca del 40% de las personas que sufren una fractura de cadera no recupera su nivel funcional previo.\n\nPor eso CasaMia empieza por revisar riesgos reales del hogar: baño, dormitorio, cocina, accesos y recorridos diarios.\n\nLa idea no es comprar por comprar. Es priorizar lo que puede proteger autonomía.\n\nEmpieza la revisión: https://www.casamia.com.es/es/home-safety-wizard?utm_source=facebook&utm_medium=organic_social&utm_campaign=risk_stats_spain&utm_content=hip_fracture_es\n\nFuente: Ministerio de Sanidad.\n\n#CasaMia #Autonomia #SeguridadEnCasa #PrevencionDeCaidas',
  },
  {
    id: '04-primera-causa-es',
    title: 'Primera causa externa',
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
    caption: 'En España, las caídas son la primera causa de muerte por causas externas en personas mayores.\n\nAnticiparse no significa hacer una gran obra de golpe. Significa revisar la vivienda real, entender las rutinas y decidir qué cambios tienen más sentido primero.\n\nCasaMia ayuda a convertir esa revisión en un plan práctico.\n\nEmpieza la revisión: https://www.casamia.com.es/es/home-safety-wizard?utm_source=facebook&utm_medium=organic_social&utm_campaign=risk_stats_spain&utm_content=first_cause_es\n\nFuente: Ministerio de Sanidad.\n\n#CasaMia #HogarSeguro #CuidadoEnCasa #PrevencionDeCaidas',
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

async function pageMarkup(post) {
  const [logoUrl, interUrl, playfairUrl, imageUrl] = await Promise.all([
    dataUrl(logoPath),
    dataUrl(path.join(fontDir, 'inter-latin.woff2')),
    dataUrl(path.join(fontDir, 'playfair-display-latin-normal.woff2')),
    dataUrl(path.join(root, post.image)),
  ])

  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8">
      <style>
        @font-face { font-family: Inter; src: url('${interUrl}') format('woff2'); font-weight: 100 900; }
        @font-face { font-family: Playfair; src: url('${playfairUrl}') format('woff2'); font-weight: 400 900; }
        * { box-sizing: border-box; }
        html, body { margin: 0; width: 1080px; height: 1080px; overflow: hidden; }
        body { background: #10283e; color: #ffffff; font-family: Inter, Arial, sans-serif; }
        .post { position: relative; width: 1080px; height: 1080px; overflow: hidden; background: #10283e; }
        .photo {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: ${post.position};
          opacity: 0.54;
          filter: saturate(0.78) contrast(1.06);
        }
        .shade {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(16, 40, 62, 0.16) 0%, rgba(16, 40, 62, 0.64) 42%, rgba(16, 40, 62, 0.94) 100%),
            linear-gradient(90deg, rgba(16, 40, 62, 0.16) 0%, rgba(16, 40, 62, 0.02) 48%, rgba(16, 40, 62, 0.34) 100%);
        }
        .brand {
          position: absolute;
          top: 46px;
          left: 54px;
          display: flex;
          align-items: center;
          gap: 15px;
          min-height: 78px;
          padding: 12px 23px 12px 14px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 18px 48px rgba(8, 31, 48, 0.20);
        }
        .brand img { width: 54px; height: 54px; display: block; }
        .brand span { font-size: 31px; font-weight: 900; line-height: 1; color: #10283e; }
        .source {
          position: absolute;
          top: 66px;
          right: 54px;
          padding: 14px 18px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.92);
          color: #10283e;
          font-size: 19px;
          font-weight: 900;
        }
        .content {
          position: absolute;
          left: 54px;
          right: 54px;
          bottom: 46px;
          display: grid;
          gap: 22px;
        }
        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          color: #ffffff;
          font-size: 23px;
          line-height: 1.1;
          font-weight: 950;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-shadow: 0 3px 18px rgba(0, 0, 0, 0.30);
        }
        .eyebrow::before {
          content: '';
          width: 58px;
          height: 9px;
          border-radius: 999px;
          background: ${post.accent};
        }
        .stat-card {
          display: grid;
          gap: 18px;
          padding: 40px 52px 42px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.96);
          color: #10283e;
          box-shadow: 0 28px 70px rgba(8, 31, 48, 0.34);
        }
        .stat {
          color: ${post.accent};
          font-family: Playfair, Georgia, serif;
          font-size: 144px;
          line-height: 0.84;
          font-weight: 900;
          letter-spacing: 0;
        }
        .stat-label {
          max-width: 860px;
          color: #10283e;
          font-size: 43px;
          line-height: 1.04;
          font-weight: 950;
        }
        .detail {
          max-width: 860px;
          color: #344b5f;
          font-size: 27px;
          line-height: 1.22;
          font-weight: 850;
        }
        .footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          margin-top: 4px;
        }
        .promise {
          max-width: 390px;
          color: #176b95;
          font-size: 23px;
          line-height: 1.16;
          font-weight: 950;
        }
        .cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          min-width: 300px;
          min-height: 68px;
          padding: 0 28px;
          border-radius: 8px;
          background: ${post.accent};
          color: ${post.accent === '#f2b544' ? '#10283e' : '#ffffff'};
          font-size: 24px;
          font-weight: 950;
          box-shadow: 0 16px 38px rgba(8, 31, 48, 0.18);
        }
        .cta span { font-size: 33px; line-height: 1; transform: translateY(-1px); }
      </style>
    </head>
    <body>
      <main class="post">
        <img class="photo" src="${imageUrl}" alt="">
        <div class="shade"></div>
        <div class="brand"><img src="${logoUrl}" alt=""><span>CasaMia</span></div>
        <div class="source">${htmlEscape(post.source)}</div>
        <section class="content">
          <div class="eyebrow">${htmlEscape(post.eyebrow)}</div>
          <div class="stat-card">
            <div class="stat">${htmlEscape(post.stat)}</div>
            <div class="stat-label">${htmlEscape(post.statLabel)}</div>
            <div class="detail">${htmlEscape(post.detail)}</div>
            <div class="footer">
              <div class="promise">Riesgo real. Plan práctico. Sin compras a ciegas.</div>
              <div class="cta">${htmlEscape(post.cta)} <span>→</span></div>
            </div>
          </div>
        </section>
      </main>
    </body>
  </html>`
}

function copyMarkdown() {
  const rows = posts.map((post, index) => `## ${index + 1}. ${post.title}

Image: \`${post.id}.jpg\`

Caption:

${post.caption}

Visual source note: ${post.source} - ${post.sourceUrl}
`).join('\n')

  return `# CasaMia Risk Stat Facebook Posts

Organic Spanish Facebook posts using the same Sanidad-based risk statistics as the paid ad concepts.

${rows}`
}

await mkdir(outputDir, { recursive: true })
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1 })

for (const post of posts) {
  await page.setContent(await pageMarkup(post), { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({
    path: path.join(outputDir, `${post.id}.jpg`),
    type: 'jpeg',
    quality: 94,
  })
}

await browser.close()
await writeFile(path.join(outputDir, 'facebook-risk-stat-posts.md'), copyMarkdown(), 'utf8')

console.log(`Generated ${posts.length} Facebook risk stat post assets in ${outputDir}`)
