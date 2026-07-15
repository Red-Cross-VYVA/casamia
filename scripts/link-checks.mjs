import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()
const srcRoot = path.join(projectRoot, 'src')
const appSource = fs.readFileSync(path.join(srcRoot, 'App.tsx'), 'utf8')
const routePaths = [...appSource.matchAll(/<Route\s+path="([^"]+)"/g)]
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

const failures = []
const sourceFiles = walk(srcRoot).filter((file) => /\.(?:ts|tsx)$/.test(file))

for (const file of sourceFiles) {
  const source = fs.readFileSync(file, 'utf8')
  const relativeFile = path.relative(projectRoot, file)

  if (/34900000000/.test(source)) {
    failures.push(`${relativeFile}: contains the placeholder CasaMia phone number`)
  }

  for (const match of source.matchAll(/(?:to|href)=(?:"([^"]+)"|'([^']+)')/g)) {
    const target = match[1] ?? match[2]
    if (!target.startsWith('/')) continue

    const pathname = target.split(/[?#]/, 1)[0] || '/'
    const publicAsset = path.join(projectRoot, 'public', pathname.slice(1))
    if (!routeMatches(pathname) && !fs.existsSync(publicAsset)) {
      failures.push(`${relativeFile}: internal link ${target} has no matching route or public file`)
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
