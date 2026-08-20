import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const packageJson = await readFile(new URL('../package.json', import.meta.url), 'utf8')
const app = await readFile(new URL('../src/App.tsx', import.meta.url), 'utf8')
const main = await readFile(new URL('../src/main.tsx', import.meta.url), 'utf8')
const i18n = await readFile(new URL('../src/i18n/index.ts', import.meta.url), 'utf8')
const entryServer = await readFile(new URL('../src/entry-server.tsx', import.meta.url), 'utf8')
const prerender = await readFile(new URL('../scripts/prerender-public-routes.mjs', import.meta.url), 'utf8')
const sitemap = await readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8')
const vercelConfig = await readFile(new URL('../vercel.json', import.meta.url), 'utf8')

const packageConfig = JSON.parse(packageJson)
const vercel = JSON.parse(vercelConfig)

assert.match(
  packageConfig.scripts.build,
  /vite build --ssr src\/entry-server\.tsx --outDir dist\/server && node scripts\/prerender-public-routes\.mjs/,
  'The production build must create an SSR bundle and prerender public sitemap routes.',
)

assert.match(
  app,
  /export function AppRoutes\(\)/,
  'The route tree must be exported so the server entry can render the same public app routes.',
)

assert.match(
  main,
  /hydrateRoot\(root, app\)[\s\S]*createRoot\(root\)\.render\(app\)/,
  'The browser entry must hydrate prerendered HTML instead of always replacing it.',
)

assert.match(
  i18n,
  /typeof window !== 'undefined'[\s\S]*typeof document !== 'undefined'/,
  'The i18n initializer must be safe to import during server rendering.',
)

assert.match(
  entryServer,
  /renderToPipeableStream[\s\S]*StaticRouter[\s\S]*AppRoutes/,
  'The server entry must render React routes and collect route-level SEO metadata.',
)

assert.match(
  entryServer,
  /setServerSeoCollector/,
  'The server entry must collect route-level SEO metadata while rendering.',
)

assert.match(
  prerender,
  /extractSitemapRoutes[\s\S]*did not include a visible h1[\s\S]*writeRouteHtml[\s\S]*route\.slice\(1\)\}\.html/,
  'The prerender script must read sitemap routes, enforce real body content, and write index plus clean URL HTML.',
)

assert.match(
  prerender,
  /rm\(path\.join\(distDir, 'server'\), \{ recursive: true, force: true \}\)/,
  'The prerender script must remove the temporary SSR bundle before deployment.',
)

assert.doesNotMatch(
  sitemap,
  /home-safety-inspection/,
  'The public sitemap must not list the legacy home-safety-inspection URL.',
)

assert.deepEqual(
  vercel.redirects?.filter((redirect) => redirect.source === '/home-safety-inspection'),
  [
    {
      source: '/home-safety-inspection',
      destination: '/home-safety-assessment',
      permanent: true,
    },
  ],
  'Vercel must permanently redirect the indexed legacy inspection URL to the canonical assessment page.',
)

assert.equal(
  vercel.cleanUrls,
  true,
  'Vercel must serve prerendered .html files from clean sitemap URLs before the SPA fallback.',
)

console.log('SEO rendering checks passed.')
