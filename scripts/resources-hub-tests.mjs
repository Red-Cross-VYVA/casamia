import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const page = await readFile(new URL('../src/pages/BlogPage.tsx', import.meta.url), 'utf8')
const costToolPage = await readFile(new URL('../src/pages/HomeVsResidenceCostPage.tsx', import.meta.url), 'utf8')
const parentSafetyQuiz = await readFile(new URL('../src/pages/ParentSafetyQuizPage.tsx', import.meta.url), 'utf8')
const toolsPage = await readFile(new URL('../src/pages/ToolsPage.tsx', import.meta.url), 'utf8')
const articlePage = await readFile(new URL('../src/pages/BlogArticlePage.tsx', import.meta.url), 'utf8')
const footer = await readFile(new URL('../src/components/Footer.tsx', import.meta.url), 'utf8')
const nav = await readFile(new URL('../src/components/Nav.tsx', import.meta.url), 'utf8')
const needLandingPage = await readFile(new URL('../src/pages/NeedLandingPage.tsx', import.meta.url), 'utf8')
const needLandingLocalization = await readFile(new URL('../src/constants/needLandingPagesLocalization.ts', import.meta.url), 'utf8')
const blogContentLocalization = await readFile(new URL('../src/constants/blogContentLocalization.ts', import.meta.url), 'utf8')
const seo = await readFile(new URL('../src/components/SEO.tsx', import.meta.url), 'utf8')
const app = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8')
const sitemap = await readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8')
const globalStyles = await readFile(new URL('../src/index.css', import.meta.url), 'utf8')
const styles = await readFile(new URL('../src/styles/resources-hub.css', import.meta.url), 'utf8')
const linkChecks = await readFile(new URL('../scripts/link-checks.mjs', import.meta.url), 'utf8')

const publicCopySources = {
  'src/components/Footer.tsx': footer,
  'src/components/Nav.tsx': nav,
  'src/pages/BlogPage.tsx': page,
  'src/pages/BlogArticlePage.tsx': articlePage,
  'src/pages/NeedLandingPage.tsx': needLandingPage,
  'src/constants/blogContentLocalization.ts': blogContentLocalization,
  'src/constants/needLandingPagesLocalization.ts': needLandingLocalization,
}

for (const [fileName, source] of Object.entries(publicCopySources)) {
  assert.doesNotMatch(
    source,
    /Ã|Â|â€|â€™|â€œ|�/,
    `${fileName} must not contain mojibake in public-facing copy.`,
  )
}

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
  app,
  /\/tools\/is-my-parent-safe-at-home[\s\S]*<ParentSafetyQuizPage \/>/,
  'The parent safety quiz must be exposed as a public route.',
)
assert.match(
  app,
  /\/tools" element=\{<ToolsPage \/>\}/,
  'The free tools index must be exposed as a public route.',
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
  parentSafetyQuiz,
  /'@type': 'WebApplication'[\s\S]*is-my-parent-safe-at-home#tool/,
  'The parent safety quiz must publish WebApplication structured data.',
)
assert.match(
  toolsPage,
  /'@type': 'CollectionPage'[\s\S]*\/tools#collection[\s\S]*itemListElement: tools\.map/,
  'The free tools index must publish CollectionPage structured data for the public toolset.',
)
assert.match(
  toolsPage,
  /\/tools\/is-my-parent-safe-at-home[\s\S]*\/tools\/home-vs-residence-cost-calculator/,
  'The free tools index must read its public tool URLs from the shared tools list.',
)
assert.match(
  toolsPage,
  /Free Senior Home Safety Tools[\s\S]*Grant-readiness check[\s\S]*Photo safety report/,
  'The free tools index must gather CasaMia practical tools in one page.',
)
assert.match(
  page,
  /printableMaterials\.map\(\(material\)[\s\S]*'@type': 'DigitalDocument'[\s\S]*encodingFormat: isPdf \? 'application\/pdf' : 'text\/html'/,
  'The Resources hub must publish structured data for every printable or practical material, not just the lead checklist.',
)
assert.match(
  page,
  /Home vs residence cost planner[\s\S]*\/tools\/home-vs-residence-cost-calculator/,
  'The Resources hub must expose the home-vs-residence cost planner.',
)
assert.match(
  page,
  /heroSignals: \['No sign-up needed'[\s\S]*Sin registro[\s\S]*resource-hub-hero-signals/,
  'The Resources hero must reassure visitors that the materials are free, bilingual and quick to use.',
)
assert.match(
  page,
  /Is my parent safe at home\?[\s\S]*\/tools\/is-my-parent-safe-at-home/,
  'The Resources hub must expose the parent safety quiz as a practical decision tool.',
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
  await readFile(new URL('../src/constants/blogContent.ts', import.meta.url), 'utf8'),
  /hospital-discharge-home-safety-checklist[\s\S]*Hospital Discharge Home Safety Checklist[\s\S]*Start a discharge safety review/,
  'The Resources catalogue must include a practical hospital-discharge checklist guide.',
)
assert.match(
  await readFile(new URL('../src/constants/blogContent.ts', import.meta.url), 'utf8'),
  /when-home-adaptations-are-not-enough[\s\S]*When Home Adaptations Are Not Enough[\s\S]*Compare home and residence costs/,
  'The Resources catalogue must include an honest home-vs-residence decision guide.',
)
assert.match(
  await readFile(new URL('../src/constants/blogContentLocalization.ts', import.meta.url), 'utf8'),
  /family-conversation-before-home-safety-visit[\s\S]*Antes de una visita de seguridad[\s\S]*Empezar revisión guiada/,
  'The practical family conversation guide must include Spanish localisation.',
)
assert.match(
  await readFile(new URL('../src/constants/blogContentLocalization.ts', import.meta.url), 'utf8'),
  /hospital-discharge-home-safety-checklist[\s\S]*Lista de seguridad en casa tras el alta hospitalaria[\s\S]*Empezar revisión de vuelta a casa/,
  'The hospital-discharge checklist guide must include Spanish localisation.',
)
assert.match(
  await readFile(new URL('../src/constants/blogContentLocalization.ts', import.meta.url), 'utf8'),
  /when-home-adaptations-are-not-enough[\s\S]*Cuando adaptar la vivienda no es suficiente[\s\S]*Comparar casa y residencia/,
  'The home-vs-residence decision guide must include Spanish localisation.',
)
assert.match(
  page,
  /Something changed recently[\s\S]*hospital-discharge-home-safety-checklist[\s\S]*One room is creating worry[\s\S]*The family needs a plan/,
  'The Resources hub must route users by real-life situation, not only by article type.',
)
assert.match(
  page,
  /home is still the right route[\s\S]*when-home-adaptations-are-not-enough[\s\S]*home-vs-residence-cost-calculator/,
  'The Resources hub must help families compare home adaptation with higher-care routes.',
)
assert.match(
  page,
  /const familyStarterPrompts = \[[\s\S]*What changed recently\?[\s\S]*What decision is needed this week\?/,
  'The Resources hub must include a practical family starter prompt sequence.',
)
assert.match(
  page,
  /const actionRouteSteps = \[[\s\S]*Learn what matters[\s\S]*Capture the real home[\s\S]*Prioritise the first works[\s\S]*Let CasaMia coordinate/,
  'The Resources hub must show how families move from education into a managed CasaMia plan.',
)
assert.match(
  page,
  /From reading to action[\s\S]*De la lectura a la acción[\s\S]*resource-action-route-section[\s\S]*home-safety-assessment#self-inspection-tool/,
  'The Resources action route must be bilingual and guide users into the practical home safety review.',
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
  /const topicRoutes = \[[\s\S]*fall-prevention-at-home[\s\S]*bathroom-safety-for-seniors[\s\S]*senior-bedroom-safety[\s\S]*grants-for-home-adaptations-spain/,
  'The Resources hub must expose SEO topic routes for major senior home safety needs.',
)
assert.match(
  page,
  /Explore by safety topic[\s\S]*Explora por tema de seguridad[\s\S]*resource-topics-section/,
  'The topic route section must be available in English and Spanish.',
)
assert.match(
  page,
  /topicRoutes\.length[\s\S]*topicRoutes\.map\(\(topic, index\)/,
  'The Resources structured ItemList must include the topic routes.',
)
assert.match(
  needLandingLocalization,
  /fall-prevention-at-home[\s\S]*Prevención de caídas en casa[\s\S]*safe-bathroom-access[\s\S]*Acceso seguro al baño/,
  'High-intent need landing pages must have Spanish localised titles.',
)
assert.match(
  needLandingPage,
  /localizeNeedLandingPage\(basePage, i18n\.language\)[\s\S]*localizeNeedLandingPages\(allNeedLandingPages, i18n\.language\)/,
  'Need landing pages must localise the active page and related popular-need links.',
)
assert.match(
  needLandingPage,
  /catalogueEyebrow[\s\S]*turnkeySteps[\s\S]*beforeSpendingChecks[\s\S]*CatalogueServiceCard key=\{service\.id\} service=\{service\} language=\{i18n\.language\}/,
  'Need landing page chrome and catalogue labels must be language-aware.',
)
assert.match(
  needLandingPage,
  /blogArticles[\s\S]*localizeBlogArticles[\s\S]*need-landing-resources[\s\S]*needResourceReferences/,
  'Need landing pages must recommend relevant guide and tool resources without duplicating catalogue content.',
)
assert.match(
  needLandingPage,
  /decisionEyebrow[\s\S]*Signals not to ignore[\s\S]*need-landing-decision[\s\S]*DecisionCard/,
  'Need landing pages must include a practical decision map that helps families turn concerns into action.',
)
assert.match(
  needLandingPage,
  /'@type': 'HowTo'[\s\S]*copy\.turnkeySteps\.map/,
  'Need landing pages must publish HowTo structured data for the CasaMia managed next-step route.',
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
  /\.resource-hub-hero-signals[\s\S]*\.resource-hub-hero-signals span/,
  'The Resources hero reassurance strip must have dedicated styling.',
)
assert.match(
  styles,
  /\.resource-topics-section[\s\S]*\.resource-topic-grid[\s\S]*\.resource-topic-card/,
  'The Resources topic route section must have dedicated visual styling.',
)
assert.match(
  await readFile(new URL('../src/styles/need-landing.css', import.meta.url), 'utf8'),
  /\.need-landing-resources[\s\S]*\.need-resource-card-grid[\s\S]*\.need-resource-card/,
  'Need landing page recommended resources must have dedicated visual styling.',
)
assert.match(
  await readFile(new URL('../src/styles/need-landing.css', import.meta.url), 'utf8'),
  /\.need-landing-decision[\s\S]*\.need-decision-card-grid[\s\S]*\.need-decision-card/,
  'Need landing page decision maps must have dedicated visual styling.',
)
assert.match(
  styles,
  /\.resource-family-starter-section[\s\S]*\.resource-family-prompt-card[\s\S]*\.resource-family-decision-card/,
  'The family starter section must have dedicated visual styling.',
)
assert.match(
  styles,
  /\.resource-action-route-section[\s\S]*\.resource-action-route-panel[\s\S]*\.resource-action-route-steps/,
  'The Resources action route must have dedicated visual styling.',
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
  /Free tools[\s\S]*to: '\/tools'[\s\S]*Home or residence[\s\S]*when-home-adaptations-are-not-enough/,
  'The Resources navigation must expose free tools and home-vs-residence decision support.',
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
  /Before the visit[\s\S]*family-conversation-before-home-safety-visit/,
  'The Resources navigation must expose the practical family visit-prep guide.',
)
assert.match(
  nav,
  /Recursos por situación[\s\S]*Ver todos los recursos/,
  'The Resources navigation must include Spanish copy.',
)
assert.match(
  nav,
  /localizeNeedLandingPages\(needLandingPages, i18n\.language\)[\s\S]*Seguridad en el baño[\s\S]*Empieza por la preocupación/,
  'The Solutions navigation must localise high-intent need pages and group labels.',
)
assert.match(
  footer,
  /resourcesTitle: 'Useful resources'[\s\S]*Free safety tools[\s\S]*Printable home checklist[\s\S]*home-vs-residence-cost-calculator[\s\S]*home-adaptation-grants-spain-family-guide[\s\S]*family-conversation-before-home-safety-visit[\s\S]*bathroom-safety-seniors-costly-mistakes/,
  'The global footer must expose practical Resources links for discovery and SEO.',
)
assert.match(
  sitemap,
  /https:\/\/casamia\.com\.es\/tools\/home-vs-residence-cost-calculator/,
  'The public sitemap must include the home-vs-residence cost comparison tool.',
)
assert.match(
  linkChecks,
  /https:\\\/\\\/casamia\\\.com\\\.es/,
  'The link checker must validate sitemap routes against the production casamia.com.es domain.',
)
assert.match(
  sitemap,
  /https:\/\/casamia\.com\.es\/tools<\/loc>/,
  'The public sitemap must include the free tools index.',
)
assert.match(
  sitemap,
  /https:\/\/casamia\.com\.es\/tools\/is-my-parent-safe-at-home/,
  'The public sitemap must include the parent safety quiz.',
)
assert.match(
  sitemap,
  /https:\/\/casamia\.com\.es\/blog\/family-conversation-before-home-safety-visit/,
  'The public sitemap must include the family conversation resource guide.',
)
assert.match(
  sitemap,
  /https:\/\/casamia\.com\.es\/blog\/hospital-discharge-home-safety-checklist/,
  'The public sitemap must include the hospital-discharge checklist guide.',
)
assert.match(
  sitemap,
  /https:\/\/casamia\.com\.es\/blog\/when-home-adaptations-are-not-enough/,
  'The public sitemap must include the home-vs-residence decision guide.',
)
assert.match(
  footer,
  /resourcesTitle: 'Recursos útiles'[\s\S]*Lista para imprimir[\s\S]*Guía de prevención de caídas/,
  'The global footer Resources links must include Spanish copy.',
)
assert.match(
  footer,
  /localizeNeedLandingPages\(needLandingPages, i18n\.language\)/,
  'The footer popular needs must use the same localised need landing page source.',
)
assert.match(
  articlePage,
  /Turn this guide into a practical plan[\s\S]*blog-next-step-card[\s\S]*home-safety-assessment#self-inspection-tool/,
  'Resource article pages must include a practical next-step action block.',
)
assert.match(
  articlePage,
  /articleTopicSlugs[\s\S]*fall-prevention-home-checklist-spain[\s\S]*fall-prevention-at-home[\s\S]*localizeNeedLandingPages\(allNeedLandingPages, language\)[\s\S]*blog-topic-link-group/,
  'Resource article pages must link into related SEO topic pages.',
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
assert.match(
  globalStyles,
  /\.blog-topic-link-group[\s\S]*\.blog-topic-link-card/,
  'Resource article related topic links must have dedicated styling.',
)

console.log('Resources hub checks passed.')
