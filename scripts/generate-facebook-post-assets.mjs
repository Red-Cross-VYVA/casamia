import { createRequire } from 'node:module'
import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const require = createRequire(import.meta.url)
const { chromium } = require('playwright')

const root = process.cwd()
const outputDir = path.join(root, 'public', 'brand-assets', 'social', 'facebook-starter-posts')
const fontDir = path.join(root, 'public', 'fonts')
const logoPath = path.join(root, 'public', 'apple-touch-icon.png')

const campaigns = [
  {
    id: '01-welcome-safer-homes',
    image: 'public/images/solutions/close-up-senior-couple-together-love.jpg',
    position: 'center 42%',
    copy: {
      en: {
        eyebrow: 'HOME SUPPORT ACROSS SPAIN',
        heading: 'Safer homes. Clearer next steps.',
        detail: 'Practical guidance for living confidently at home.',
        cta: 'Discover CasaMia',
      },
      es: {
        eyebrow: 'APOYO EN EL HOGAR EN TODA ESPAÑA',
        heading: 'Un hogar más seguro. Pasos más claros.',
        detail: 'Orientación práctica para vivir con confianza en casa.',
        cta: 'Conoce CasaMia',
      },
    },
  },
  {
    id: '02-home-safety-review',
    image: 'public/images/assessment/casamia-inspector-tablet.jpg',
    position: 'center 45%',
    copy: {
      en: {
        eyebrow: 'FREE HOME SAFETY REPORT',
        heading: 'Start with a home safety review.',
        detail: 'A clear room-by-room view of what matters most.',
        cta: 'Start your free review',
      },
      es: {
        eyebrow: 'INFORME GRATUITO DE SEGURIDAD',
        heading: 'Empieza con una evaluación del hogar.',
        detail: 'Una visión clara, estancia por estancia, de lo que más importa.',
        cta: 'Inicia tu evaluación gratuita',
      },
    },
  },
  {
    id: '03-bathroom-safety',
    image: 'public/images/before-after/bathroom-after.jpg',
    position: 'center 50%',
    copy: {
      en: {
        eyebrow: 'BATHROOM SAFETY',
        heading: 'Small changes. Greater peace of mind.',
        detail: 'Support rails, safer access and practical installation.',
        cta: 'Explore bathroom options',
      },
      es: {
        eyebrow: 'SEGURIDAD EN EL BAÑO',
        heading: 'Pequeños cambios. Mucha más tranquilidad.',
        detail: 'Barras de apoyo, acceso más seguro e instalación práctica.',
        cta: 'Ver opciones para el baño',
      },
    },
  },
  {
    id: '04-grant-guidance',
    image: 'public/images/blog/grants-readiness.webp',
    position: 'center 46%',
    copy: {
      en: {
        eyebrow: 'GRANT GUIDANCE',
        heading: 'Could your home qualify for support?',
        detail: 'Understand the likely route before you start the paperwork.',
        cta: 'Check grant guidance',
      },
      es: {
        eyebrow: 'ORIENTACIÓN SOBRE AYUDAS',
        heading: '¿Puede tu hogar acceder a ayudas?',
        detail: 'Conoce la vía más probable antes de iniciar los trámites.',
        cta: 'Consulta las ayudas',
      },
    },
  },
  {
    id: '05-core-safety-packs',
    collage: [
      'public/images/service-gallery/01-grab-bars-and-support-points.jpg',
      'public/images/service-card-products/underbed-lighting.webp',
      'public/images/service-card-products/threshold-ramp.webp',
      'public/images/service-card-products/motion-light.webp',
    ],
    copy: {
      en: {
        eyebrow: 'STARTER PACKS',
        heading: 'Start with the essentials.',
        detail: 'Focused safety improvements for the rooms you use every day.',
        cta: 'Explore starter packs',
      },
      es: {
        eyebrow: 'PACKS INICIALES',
        heading: 'Empieza por lo esencial.',
        detail: 'Mejoras de seguridad para las estancias que usas cada día.',
        cta: 'Ver packs iniciales',
      },
    },
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

const htmlEscape = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')

async function mediaMarkup(campaign) {
  if (campaign.collage) {
    const images = await Promise.all(campaign.collage.map(async (image) =>
      `<img src="${await dataUrl(path.join(root, image))}" alt="">`))
    return `<div class="collage">${images.join('')}</div>`
  }

  return `<img class="hero-image" src="${await dataUrl(path.join(root, campaign.image))}" alt="" style="object-position:${campaign.position}">`
}

async function pageMarkup(campaign, language) {
  const copy = campaign.copy[language]
  const [logoUrl, interUrl, playfairUrl, media] = await Promise.all([
    dataUrl(logoPath),
    dataUrl(path.join(fontDir, 'inter-latin.woff2')),
    dataUrl(path.join(fontDir, 'playfair-display-latin-normal.woff2')),
    mediaMarkup(campaign),
  ])

  return `<!doctype html>
  <html><head><meta charset="utf-8"><style>
    @font-face { font-family: Inter; src: url('${interUrl}') format('woff2'); font-weight: 100 900; }
    @font-face { font-family: Playfair; src: url('${playfairUrl}') format('woff2'); font-weight: 400 900; }
    * { box-sizing: border-box; }
    html, body { margin: 0; width: 1080px; height: 1080px; overflow: hidden; }
    body { background: #f7fbfd; color: #10283e; font-family: Inter, sans-serif; }
    .post { position: relative; width: 1080px; height: 1080px; background: #fff; }
    .media { position: relative; width: 100%; height: 600px; overflow: hidden; background: #dbe9ef; }
    .hero-image { width: 100%; height: 100%; object-fit: cover; display: block; }
    .collage { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; width: 100%; height: 100%; background: #fff; }
    .collage img { width: 100%; height: 296px; object-fit: cover; display: block; }
    .media::after { content: ''; position: absolute; inset: auto 0 0; height: 130px; background: linear-gradient(transparent, rgba(8,38,59,.26)); }
    .brand { position: absolute; z-index: 2; top: 48px; left: 54px; display: flex; align-items: center; gap: 15px; padding: 12px 22px 12px 12px; background: rgba(255,255,255,.96); border-radius: 6px; box-shadow: 0 6px 22px rgba(8,38,59,.14); }
    .brand img { width: 56px; height: 56px; object-fit: contain; }
    .brand span { font-size: 32px; line-height: 1; font-weight: 800; color: #10283e; }
    .content { position: relative; height: 480px; padding: 48px 64px 52px; border-top: 8px solid #2f9fd3; }
    .eyebrow { margin-bottom: 17px; color: #4e8b20; font-size: 19px; line-height: 1.2; font-weight: 800; letter-spacing: 1.7px; }
    h1 { margin: 0; max-width: 900px; color: #10283e; font-family: Playfair, Georgia, serif; font-size: 66px; line-height: 1.03; font-weight: 700; letter-spacing: 0; }
    .detail { margin: 16px 0 0; max-width: 900px; color: #43576a; font-size: 25px; line-height: 1.35; font-weight: 500; }
    .footer { position: absolute; left: 64px; right: 64px; bottom: 48px; display: flex; align-items: center; justify-content: space-between; }
    .cta { display: inline-flex; align-items: center; gap: 18px; min-height: 58px; padding: 0 24px; border-radius: 6px; background: #77bd32; color: #10283e; font-size: 22px; font-weight: 800; }
    .cta b { font-size: 31px; line-height: 1; transform: translateY(-1px); }
    .site { color: #176b95; font-size: 20px; font-weight: 800; }
  </style></head><body>
    <main class="post">
      <section class="media">${media}</section>
      <div class="brand"><img src="${logoUrl}" alt=""><span>CasaMia</span></div>
      <section class="content">
        <div class="eyebrow">${htmlEscape(copy.eyebrow)}</div>
        <h1>${htmlEscape(copy.heading)}</h1>
        <p class="detail">${htmlEscape(copy.detail)}</p>
        <div class="footer">
          <div class="cta">${htmlEscape(copy.cta)} <b>→</b></div>
          <div class="site">casamia.com.es</div>
        </div>
      </section>
    </main>
  </body></html>`
}

await mkdir(outputDir, { recursive: true })
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1 })

for (const campaign of campaigns) {
  for (const language of ['en', 'es']) {
    await page.setContent(await pageMarkup(campaign, language), { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({
      path: path.join(outputDir, `${campaign.id}-${language}.jpg`),
      type: 'jpeg',
      quality: 92,
    })
  }
}

await browser.close()
console.log(`Generated ${campaigns.length * 2} Facebook post assets in ${outputDir}`)
