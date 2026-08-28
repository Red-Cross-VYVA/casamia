import {
  ExternalLink,
  RefreshCw,
  Send,
  ShieldCheck,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { InternalLayout } from '../../components/internal/InternalLayout'
import { CASAMIA_FACEBOOK_URL } from '../../constants/contact'
import {
  facebookStarterPosts,
  getFacebookPublishingStatus,
  publishFacebookStarterPost,
  type FacebookPublishingStatus,
} from '../../services/internalFacebookPosts'

type PublishResults = Record<string, {
  facebookPostId: string
  facebookUrl: string
  message: string
}>

export function InternalFacebookPostsPage() {
  const initialCaptions = useMemo(
    () => Object.fromEntries(facebookStarterPosts.map((post) => [post.id, post.caption])) as Record<string, string>,
    [],
  )
  const [captions, setCaptions] = useState(initialCaptions)
  const [message, setMessage] = useState('Checking Facebook connection...')
  const [publishingPostId, setPublishingPostId] = useState('')
  const [results, setResults] = useState<PublishResults>({})
  const [status, setStatus] = useState<FacebookPublishingStatus | null>(null)
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)

  const loadStatus = useCallback(async () => {
    setIsLoadingStatus(true)
    try {
      const nextStatus = await getFacebookPublishingStatus()
      setStatus(nextStatus)
      setMessage(nextStatus.configured
        ? `Connected to Facebook Page ${nextStatus.pageId}.`
        : nextStatus.unsupportedApiVersion
          ? `Unsupported Meta Graph version ${nextStatus.unsupportedApiVersion}. Use ${nextStatus.apiVersion} in Vercel.`
          : `Facebook publishing needs ${nextStatus.missing.join(' and ')} in Vercel.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Facebook publishing status could not be loaded.')
    } finally {
      setIsLoadingStatus(false)
    }
  }, [])

  useEffect(() => {
    document.title = 'Facebook Posts | CasaMia Operations'
    void loadStatus()
  }, [loadStatus])

  async function handlePublish(postId: string) {
    const post = facebookStarterPosts.find((item) => item.id === postId)
    if (!post) return

    const caption = captions[post.id]?.trim()
    if (!caption) {
      setMessage('Add a caption before publishing.')
      return
    }

    if (!window.confirm(`Publish "${post.title}" to the CasaMia Facebook Page now?`)) {
      return
    }

    setPublishingPostId(post.id)
    try {
      const result = await publishFacebookStarterPost({
        imagePath: post.imagePath,
        message: caption,
      })
      setResults((current) => ({
        ...current,
        [post.id]: {
          facebookPostId: result.facebookPostId || result.facebookId,
          facebookUrl: result.facebookUrl,
          message: 'Published to Facebook.',
        },
      }))
      setMessage(`Published "${post.title}" to Facebook.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Facebook post could not be published.')
    } finally {
      setPublishingPostId('')
    }
  }

  const publishingEnabled = Boolean(status?.configured)
  const tokenDiagnostics = status?.tokenDiagnostics

  return (
    <InternalLayout
      title="Facebook posts"
      subtitle="Publish approved CasaMia starter posts to the connected Facebook Page."
      actions={
        <>
          <button className="btn btn-white" disabled={isLoadingStatus} type="button" onClick={() => void loadStatus()}>
            <RefreshCw className={isLoadingStatus ? 'animate-spin' : ''} size={18} aria-hidden="true" />
            Refresh
          </button>
          <a className="btn btn-navy" href={CASAMIA_FACEBOOK_URL} target="_blank" rel="noopener noreferrer">
            Open page
            <ExternalLink size={18} aria-hidden="true" />
          </a>
        </>
      }
    >
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-6 lg:grid-cols-2">
          {facebookStarterPosts.map((post) => {
            const result = results[post.id]
            const isPublishing = publishingPostId === post.id

            return (
              <article className="overflow-hidden rounded-lg border border-border bg-white shadow-soft" key={post.id}>
                <img className="aspect-square w-full object-cover" src={post.imagePath} alt={`${post.title} social post`} />
                <div className="grid gap-4 p-5">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-blue">Starter post</p>
                    <h2 className="mt-2 font-display text-2xl font-bold text-text-dark">{post.title}</h2>
                  </div>
                  <label className="grid gap-2 text-sm font-extrabold text-text-dark">
                    Caption
                    <textarea
                      className="min-h-56 rounded-lg border border-border px-4 py-3 text-sm font-medium leading-relaxed text-text-dark outline-none transition focus:border-blue"
                      value={captions[post.id] ?? ''}
                      onChange={(event) => setCaptions((current) => ({ ...current, [post.id]: event.target.value }))}
                    />
                  </label>
                  {result ? (
                    <div className="rounded-lg bg-light-blue p-4 text-sm font-bold text-navy">
                      {result.message}
                      {result.facebookUrl ? (
                        <a className="ml-2 text-blue underline" href={result.facebookUrl} target="_blank" rel="noopener noreferrer">
                          Open post
                        </a>
                      ) : result.facebookPostId ? (
                        <span className="ml-2 text-text-muted">Post ID: {result.facebookPostId}</span>
                      ) : null}
                    </div>
                  ) : null}
                  <button
                    className="btn btn-green justify-center"
                    disabled={!publishingEnabled || isPublishing || Boolean(publishingPostId)}
                    type="button"
                    onClick={() => void handlePublish(post.id)}
                  >
                    <Send size={18} aria-hidden="true" />
                    {isPublishing ? 'Publishing...' : 'Publish to Facebook'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>

        <aside className="h-fit rounded-lg border border-border bg-navy p-6 text-white shadow-soft">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-green text-navy">
              <ShieldCheck size={22} aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-sky">Connection</p>
              <h2 className="font-display text-2xl font-bold">Facebook Page</h2>
            </div>
          </div>
          <p className="mt-5 text-sm font-bold leading-relaxed text-white/75">{message}</p>
          <dl className="mt-6 grid gap-3 text-sm">
            <div className="rounded-lg bg-white/10 p-4">
              <dt className="font-black uppercase tracking-[0.14em] text-white/50">Page ID</dt>
              <dd className="mt-1 font-bold text-white">{status?.pageId ?? '605133552680332'}</dd>
            </div>
            <div className="rounded-lg bg-white/10 p-4">
              <dt className="font-black uppercase tracking-[0.14em] text-white/50">Graph API</dt>
              <dd className="mt-1 font-bold text-white">{status?.apiVersion ?? 'v26.0'}</dd>
              {status?.unsupportedApiVersion ? (
                <dd className="mt-2 text-xs font-bold text-gold">
                  Replace {status.unsupportedApiVersion} with {status.apiVersion}.
                </dd>
              ) : null}
            </div>
            <div className="rounded-lg bg-white/10 p-4">
              <dt className="font-black uppercase tracking-[0.14em] text-white/50">Required secret</dt>
              <dd className="mt-1 font-bold text-white">META_PAGE_ACCESS_TOKEN</dd>
            </div>
            {tokenDiagnostics?.checked ? (
              <div className="rounded-lg bg-white/10 p-4">
                <dt className="font-black uppercase tracking-[0.14em] text-white/50">Token access</dt>
                <dd className={`mt-1 font-bold ${tokenDiagnostics.ready ? 'text-green' : 'text-gold'}`}>
                  {tokenDiagnostics.ready ? 'Ready to publish' : 'Needs attention'}
                </dd>
                {tokenDiagnostics.identityName ? (
                  <dd className="mt-2 text-xs font-bold text-white/70">
                    Token identity: {tokenDiagnostics.identityName}
                    {tokenDiagnostics.identityId ? ` (${tokenDiagnostics.identityId})` : ''}
                  </dd>
                ) : null}
                <dd className="mt-2 text-xs font-bold text-white/70">
                  Page access: {tokenDiagnostics.pageAccessible ? tokenDiagnostics.pageName || 'Confirmed' : 'Not confirmed'}
                </dd>
                {tokenDiagnostics.missingPermissions.length ? (
                  <dd className="mt-2 text-xs font-bold text-gold">
                    Missing from token: {tokenDiagnostics.missingPermissions.join(', ')}
                  </dd>
                ) : null}
                {tokenDiagnostics.permissionsChecked === false ? (
                  <dd className="mt-2 text-xs font-bold text-white/70">
                    Meta does not expose a permission list for this token type.
                  </dd>
                ) : null}
                {tokenDiagnostics.errors?.length ? (
                  <dd className="mt-2 text-xs font-bold text-gold">
                    {tokenDiagnostics.errors.join(' ')}
                  </dd>
                ) : null}
              </div>
            ) : null}
          </dl>
        </aside>
      </section>
    </InternalLayout>
  )
}
