import { createRequire } from 'node:module'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const require = createRequire(import.meta.url)
const { chromium } = require('playwright')

const root = process.cwd()
const outputDir = path.join(root, 'public', 'brand-assets', 'social', 'facebook-paid-ads')
const fontDir = path.join(root, 'public', 'fonts')
const logoPath = path.join(root, 'public', 'apple-touch-icon.png')

const ads = [
  {
    id: '01-family-concern-es',
    image: 'public/images/solutions/close-up-senior-couple-together-love.jpg',
    position: 'center 44%',
    accent: '#77bd32',
    eyebrow: 'RIESGOS EN EL HOGAR',
    headline: '¿La casa de tus padres está preparada?',
    detail: 'Caídas, obstáculos y rutinas difíciles. CasaMia crea un plan claro para adaptar el hogar.',
    proof: 'Principales ciudades',
    cta: 'Revisar mi hogar',
    primaryText: 'Para familias que quieren reducir riesgos reales en casa: caídas, obstáculos y rutinas diarias que ya preocupan. CasaMia revisa la situación y crea un plan claro para adaptar el hogar.',
    headlineText: 'Revisa la casa de tus padres',
    description: 'Baño, dormitorio, cocina y accesos',
    url: 'https://www.casamia.com.es/es/home-safety-wizard?utm_source=facebook&utm_medium=paid_social&utm_campaign=home_safety_review_madrid&utm_content=family_concern_es',
  },
  {
    id: '02-bathroom-first-es',
    image: 'public/images/before-after/bathroom-after.jpg',
    position: 'center 50%',
    accent: '#2f9fd3',
    eyebrow: 'RIESGO EN EL BAÑO',
    headline: '¿El baño ya no es tan fácil de usar?',
    detail: 'Resbalones, giros y apoyos inseguros. CasaMia crea un plan práctico para adaptarlo.',
    proof: 'Sin obras a ciegas',
    cta: 'Revisar el baño',
    primaryText: 'El baño suele concentrar los momentos que más preocupan: entrar, girar, ducharse, levantarse o secarse sin un apoyo seguro. CasaMia revisa la rutina y crea un plan práctico para adaptarlo.',
    headlineText: 'Revisa el baño antes de adaptar',
    description: 'Plan práctico para reducir riesgos',
    url: 'https://www.casamia.com.es/es/home-safety-wizard?utm_source=facebook&utm_medium=paid_social&utm_campaign=home_safety_review_madrid&utm_content=bathroom_first_es',
  },
  {
    id: '03-clear-plan-es',
    image: 'public/images/assessment/casamia-inspector-tablet.jpg',
    position: 'center 45%',
    accent: '#f2b544',
    eyebrow: 'SIN COMPRAS A CIEGAS',
    headline: 'Primero entiende qué hace falta.',
    detail: 'Después decide si necesitas fotos, una visita o un pack inicial.',
    proof: 'Sin lista confusa de productos',
    cta: 'Ver mis prioridades',
    primaryText: 'No compres barras, sensores o reformas a ciegas. Primero revisamos la rutina diaria y los puntos de riesgo para crear un plan práctico.',
    headlineText: 'Un plan antes de instalar',
    description: 'CasaMia revisa la necesidad real',
    url: 'https://www.casamia.com.es/es/home-safety-wizard?utm_source=facebook&utm_medium=paid_social&utm_campaign=home_safety_review_madrid&utm_content=clear_plan_es',
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
        body { background: #eef7fb; color: #10283e; font-family: Inter, Arial, sans-serif; }
        .ad {
          position: relative;
          width: 1080px;
          height: 1350px;
          overflow: hidden;
          background: #f7fbfd;
        }
        .photo {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: ${ad.position};
          filter: saturate(0.98) contrast(1.03);
        }
        .shade {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(8, 31, 48, 0.04) 0%, rgba(8, 31, 48, 0.10) 42%, rgba(8, 31, 48, 0.88) 100%),
            linear-gradient(90deg, rgba(8, 31, 48, 0.14) 0%, rgba(8, 31, 48, 0.02) 48%, rgba(8, 31, 48, 0.22) 100%);
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
          box-shadow: 0 18px 48px rgba(8, 31, 48, 0.20);
        }
        .brand img { width: 56px; height: 56px; display: block; }
        .brand span { font-size: 31px; font-weight: 900; line-height: 1; color: #10283e; }
        .panel {
          position: absolute;
          left: 54px;
          right: 54px;
          bottom: 54px;
          min-height: 470px;
          padding: 48px 54px 48px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 24px 70px rgba(8, 31, 48, 0.26);
        }
        .eyebrow {
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 0 0 24px;
          color: #2e741a;
          font-size: 24px;
          line-height: 1.1;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .eyebrow::before {
          content: '';
          width: 52px;
          height: 8px;
          border-radius: 999px;
          background: ${ad.accent};
        }
        h1 {
          margin: 0;
          max-width: 820px;
          font-family: Playfair, Georgia, serif;
          font-size: 78px;
          line-height: 0.98;
          font-weight: 800;
          letter-spacing: 0;
          color: #10283e;
        }
        .detail {
          margin: 25px 0 0;
          max-width: 820px;
          color: #344b5f;
          font-size: 32px;
          line-height: 1.22;
          font-weight: 750;
        }
        .meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 28px;
          margin-top: 42px;
        }
        .proof {
          max-width: 330px;
          color: #176b95;
          font-size: 24px;
          line-height: 1.15;
          font-weight: 900;
        }
        .cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          min-width: 320px;
          min-height: 74px;
          padding: 0 30px;
          border-radius: 8px;
          background: ${ad.accent};
          color: ${ad.accent === '#f2b544' ? '#10283e' : '#ffffff'};
          font-size: 26px;
          font-weight: 950;
          box-shadow: 0 16px 38px rgba(8, 31, 48, 0.16);
        }
        .cta span { font-size: 35px; line-height: 1; transform: translateY(-1px); }
      </style>
    </head>
    <body>
      <main class="ad">
        <img class="photo" src="${imageUrl}" alt="">
        <div class="shade"></div>
        <div class="brand"><img src="${logoUrl}" alt=""><span>CasaMia</span></div>
        <section class="panel">
          <p class="eyebrow">${htmlEscape(ad.eyebrow)}</p>
          <h1>${htmlEscape(ad.headline)}</h1>
          <p class="detail">${htmlEscape(ad.detail)}</p>
          <div class="meta">
            <div class="proof">${htmlEscape(ad.proof)}</div>
            <div class="cta">${htmlEscape(ad.cta)} <span>→</span></div>
          </div>
        </section>
      </main>
    </body>
  </html>`
}

function copyMarkdown() {
  const rows = ads.map((ad, index) => `## ${index + 1}. ${ad.headline}

Image: \`${ad.id}.jpg\`

Primary text:

${ad.primaryText}

Headline: ${ad.headlineText}

Description: ${ad.description}

URL:

${ad.url}
`).join('\n')

  return `# CasaMia Paid Facebook Ad Concepts

These Spanish-first ad concepts are built for Meta feed testing in a 4:5 mobile-friendly format.

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
await writeFile(path.join(outputDir, 'facebook-paid-ads.md'), copyMarkdown(), 'utf8')

console.log(`Generated ${ads.length} paid ad assets in ${outputDir}`)
