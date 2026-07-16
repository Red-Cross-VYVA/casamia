import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()
const srcRoot = path.join(projectRoot, 'src')
const appSource = fs.readFileSync(path.join(srcRoot, 'App.tsx'), 'utf8')
const routePaths = [...appSource.matchAll(/<Route\s+path="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((routePath) => routePath !== '*')
const redirectRoutePaths = [...appSource.matchAll(/<Route\s+path="([^"]+)"\s+element=\{<Navigate\b/g)]
  .map((match) => match[1])
  .filter((routePath) => routePath !== '*')

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(entryPath) : [entryPath]
  })
}

function routeMatches(pathname) {
  return routePaths.some((routePath) => {
    const pattern = routePath
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/:[^/]+/g, '[^/]+')
    return new RegExp(`^${pattern}$`).test(pathname)
  })
}

function redirectRouteMatches(pathname) {
  return redirectRoutePaths.some((routePath) => {
    const pattern = routePath
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/:[^/]+/g, '[^/]+')
    return new RegExp(`^${pattern}$`).test(pathname)
  })
}

const failures = []
const sourceFiles = walk(srcRoot).filter((file) => /\.(?:json|ts|tsx)$/.test(file))
const ids = new Set()

for (const file of sourceFiles) {
  const source = fs.readFileSync(file, 'utf8')

  for (const match of source.matchAll(/\bid=(?:"([^"]+)"|'([^']+)')/g)) {
    ids.add(match[1] ?? match[2])
  }
}

const linkPatterns = [
  /\b(?:to|href|src)=(?:"([^"]+)"|'([^']+)')/g,
  /\b(?:to|href|path|image|src|url|officialSource):\s*(?:"([^"]+)"|'([^']+)')/g,
]

for (const file of sourceFiles) {
  const source = fs.readFileSync(file, 'utf8')
  const relativeFile = path.relative(projectRoot, file)

  if (/34900000000/.test(source)) {
    failures.push(`${relativeFile}: contains the placeholder CasaMia phone number`)
  }

  for (const pattern of linkPatterns) {
    for (const match of source.matchAll(pattern)) {
      const target = match[1] ?? match[2]
      if (!target || target.includes('${') || target.includes('{{')) continue
      if (!target.startsWith('/') && !target.startsWith('#')) continue
      if (target.startsWith('//')) continue

      if (target.startsWith('#')) {
        const hash = target.slice(1)
        if (hash && !ids.has(hash)) {
          failures.push(`${relativeFile}: hash link ${target} has no matching element id`)
        }
        continue
      }

      const [pathAndQuery, hash] = target.split('#')
      const pathname = pathAndQuery.split(/[?]/, 1)[0] || '/'
      const publicAsset = path.join(projectRoot, 'public', pathname.slice(1))
      if (!routeMatches(pathname) && !fs.existsSync(publicAsset)) {
        failures.push(`${relativeFile}: internal link ${target} has no matching route or public file`)
      }
      if (redirectRouteMatches(pathname)) {
        failures.push(`${relativeFile}: internal link ${target} points to a redirect route; link to the final URL instead`)
      }
      if (hash && !ids.has(hash)) {
        failures.push(`${relativeFile}: internal link ${target} has no matching element id for #${hash}`)
      }
    }
  }
}

const sitemap = fs.readFileSync(path.join(projectRoot, 'public', 'sitemap.xml'), 'utf8')
for (const match of sitemap.matchAll(/<loc>https:\/\/casamia\.es([^<]*)<\/loc>/g)) {
  const pathname = match[1] || '/'
  if (!routeMatches(pathname)) {
    failures.push(`public/sitemap.xml: ${pathname} has no matching route`)
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`Link checks passed (${routePaths.length} routes, ${sourceFiles.length} source files).`)
