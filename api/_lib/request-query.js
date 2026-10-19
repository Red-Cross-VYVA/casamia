// Older Vercel request.query getters use deprecated url.parse(). Read the URL
// directly, while supporting callers that supply an already-parsed query object.
export function getRequestQueryValue(request, name) {
  const query = Object.getOwnPropertyDescriptor(request, 'query')?.value
  const value = query?.[name]
  if (Array.isArray(value)) return String(value[0] ?? '')
  if (value !== undefined && value !== null) return String(value)

  try {
    return new URL(request.url ?? '', 'http://localhost').searchParams.get(name) ?? ''
  } catch {
    return ''
  }
}
