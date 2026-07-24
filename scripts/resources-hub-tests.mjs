import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const page = await readFile(new URL('../src/pages/BlogPage.tsx', import.meta.url), 'utf8')
const costToolPage = await readFile(new URL('../src/pages/HomeVsResidenceCostPage.tsx', import.meta.url), 'utf8')
const articlePage = await readFile(new URL('../src/pages/BlogArticlePage.tsx', import.meta.url), 'utf8')
const footer = await readFile(new URL('../src/components/Footer.tsx', import.meta.url), 'utf8')
const nav = await readFile(new URL('../src/components/Nav.tsx', import.meta.url), 'utf8')
const seo = await readFile(new URL('../src/components/SEO.tsx', import.meta.url), 'utf8')
const app = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8')
const sitemap = await readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8')
const globalStyles = await readFile(new URL('../src/index.css', import.meta.url), 'utf8')
const styles = await readFile(new URL('../src/styles/resources-hub.css', import.meta.url), 'utf8')

assert.match(
  page,
  /const resourceJourneys = \[/,
  'The Resources hub must include guided journeys for families who are unsure where to start.',
)
assert.match(
  app,
  /\/tools\/home-vs-residence-cost-calculator[\s\S]*<HomeVsResidenceCostPage \/>/,
  'The home-vs-residence planning calculator must be exposed as a public route.',
)
assert.match(
  costToolPage,
  /Compare adapting the home with moving to a residence[\s\S]*Compara adaptar la vivienda con mudarse a una residencia/,
  'The cost comparison tool must support English and Spanish decision framing.',
)
assert.match(
  costToolPage,
  /residenceCost \* months \+ setupCost[\s\S]*adaptationBudget - grantSupport[\s\S]*homeSupport \* months/,
  'The cost comparison tool must compare residence cost with adaptation, support and possible grant assumptions.',
)
assert.match(
  costToolPage,
  /'@type': 'WebApplication'[\s\S]*home-vs-residence-cost-calculator#tool/,
  'The cost comparison tool must publish WebApplication structured data.',
)
assert.match(
  page,
  /Home vs residence cost planner[\s\S]*\/tools\/home-vs-residence-cost-calculator/,
  'The Resources hub must expose the home-vs-residence cost planner.',
)
assert.match(
  page,
  /localizeBlogArticles\(blogArticles, language\)/,
  'The Resources hub must render from the shared article catalogue.',
)
assert.match(
  articlePage,
  /familyChecklist[\s\S]*commonQuestions[\s\S]*blog-next-step-card/,
  'Resource article pages must turn guide content into checklist, FAQ and next-step blocks.',
)
assert.match(
  await readFile(new URL('../src/constants/blogContent.ts', import.meta.url), 'utf8'),
  /family-conversation-before-home-safety-visit[\s\S]*Before a Home Safety Visit[\s\S]*Start the guided review/,
  'The Resources catalogue must include a practical family conversation and visit-prep guide.',
)
assert.match(
  await readFile(new URL('../src/constants/blogContentLocalization.ts', import.meta.url), 'utf8'),
  /family-conversation-before-home-safety-visit[\s\S]*Antes de una visita de seguridad[\s\S]*Empezar revisión guiada/,
  'The practical family conversation guide must include Spanish localisation.',
)
assert.match(
  page,
  /Something changed recently[\s\S]*One room is creating worry[\s\S]*The family needs a plan/,
  'The Resources hub must route users by real-life situation, not only by article type.',
)
assert.match(
  page,
  /const familyStarterPrompts = \[[\s\S]*What changed recently\?[\s\S]*What decision is needed this week\?/,
  'The Resources hub must include a practical family starter prompt sequence.',
)
assert.match(
  page,
  /10-minute family starter[\s\S]*Primeros 10 minutos en familia/,
  'The family starter guidance must be available in English and Spanish.',
)
assert.match(
  page,
  /Algo ha cambiado hace poco[\s\S]*Una estancia preocupa más[\s\S]*La familia necesita un plan/,
  'The guided Resources journeys must be available in Spanish.',
)
assert.match(
  page,
  /'@type': 'FAQPage'[\s\S]*copy\.faqItems\.map/,
  'The Resources hub must publish FAQ structured data.',
)
assert.match(
  page,
  /'@type': 'HowTo'[\s\S]*blog#family-starter[\s\S]*familyStarterPrompts\.map/,
  'The family starter must publish HowTo structured data for search engines.',
)
assert.match(
  page,
  /Which resource should I start with\?[\s\S]*¿Por qué recurso debería empezar\?/,
  'The Resources FAQ must answer the user’s starting-point question in English and Spanish.',
)
assert.match(
  page,
  /Public authorities make the final grant decision[\s\S]*La autoridad pública decide la aprobación final/,
  'Grant guidance must stay helpful without implying CasaMia can guarantee approval.',
)
assert.match(
  page,
  /resource-journey-card/,
  'The guided journeys must render as a distinct visual section.',
)
assert.match(
  page,
  /resource-family-starter-section[\s\S]*home-safety-assessment#self-inspection-tool/,
  'The family starter section must guide users into the practical home safety review.',
)
assert.match(
  styles,
  /\.resource-journey-section[\s\S]*\.resource-journey-card/,
  'The Resources journeys must have dedicated styling.',
)
assert.match(
  styles,
  /\.resource-family-starter-section[\s\S]*\.resource-family-prompt-card[\s\S]*\.resource-family-decision-card/,
  'The family starter section must have dedicated visual styling.',
)
assert.match(
  styles,
  /\.resource-faq-section[\s\S]*\.resource-faq-list/,
  'The Resources FAQ must have dedicated styling.',
)
assert.match(
  nav,
  /link\.to === '\/blog'[\s\S]*Resources by situation[\s\S]*View all resources/,
  'The main navigation must expose the Resources hub as a practical education menu.',
)
assert.match(
  nav,
  /match: \['\/blog', '\/resources', '\/tools', '\/service-areas'\]/,
  'The Resources navigation item must stay active for public tools and service-area guidance.',
)
assert.match(
  nav,
  /Fall prevention[\s\S]*Bathroom safety[\s\S]*Night-time safety/,
  'The Resources navigation must expose high-intent practical guide routes.',
)
assert.match(
  nav,
  /Recursos por situación[\s\S]*Ver todos los recursos/,
  'The Resources navigation must include Spanish copy.',
)
assert.match(
  footer,
  /resourcesTitle: 'Useful resources'[\s\S]*Printable home checklist[\s\S]*home-vs-residence-cost-calculator[\s\S]*home-adaptation-grants-spain-family-guide[\s\S]*bathroom-safety-seniors-costly-mistakes/,
  'The global footer must expose practical Resources links for discovery and SEO.',
)
assert.match(
  sitemap,
  /https:\/\/casamia\.com\.es\/tools\/home-vs-residence-cost-calculator/,
  'The public sitemap must include the home-vs-residence cost comparison tool.',
)
assert.match(
  sitemap,
  /https:\/\/casamia\.com\.es\/blog\/family-conversation-before-home-safety-visit/,
  'The public sitemap must include the family conversation resource guide.',
)
assert.match(
  footer,
  /resourcesTitle: 'Recursos útiles'[\s\S]*Lista para imprimir[\s\S]*Guía de prevención de caídas/,
  'The global footer Resources links must include Spanish copy.',
)
assert.match(
  articlePage,
  /Turn this guide into a practical plan[\s\S]*blog-next-step-card[\s\S]*home-safety-assessment#self-inspection-tool/,
  'Resource article pages must include a practical next-step action block.',
)
assert.match(
  articlePage,
  /const siteUrl = 'https:\/\/casamia\.com\.es'[\s\S]*articleUrl[\s\S]*articleImageUrl/,
  'Resource article pages must build absolute canonical URLs for structured data.',
)
assert.match(
  articlePage,
  /'@type': 'BlogPosting'[\s\S]*'@id': `\$\{articleUrl\}#article`[\s\S]*mainEntityOfPage:[\s\S]*'@id': articleUrl/,
  'Resource article structured data must identify the canonical article page.',
)
assert.match(
  articlePage,
  /<SEO[\s\S]*image=\{article\.image\}/,
  'Resource article pages must use article-specific social preview images.',
)
assert.match(
  seo,
  /defaultSocialImage[\s\S]*setMeta\('og:image'[\s\S]*setMeta\('twitter:image'/,
  'The shared SEO component must publish Open Graph and Twitter social preview images.',
)
assert.match(
  seo,
  /setMeta\('og:site_name', 'CasaMia'[\s\S]*setMeta\('og:image:secure_url'[\s\S]*setMeta\('og:image:width'[\s\S]*setMeta\('og:image:height'/,
  'The shared SEO component must publish complete social preview metadata.',
)
assert.match(
  seo,
  /function getImageMimeType[\s\S]*image\/png[\s\S]*image\/webp[\s\S]*image\/jpeg/,
  'The shared SEO component must identify common social preview image MIME types.',
)
assert.match(
  globalStyles,
  /\.blog-next-step-card[\s\S]*\.blog-next-step-actions/,
  'Resource article next-step blocks must have dedicated styling.',
)

console.log('Resources hub checks passed.')
