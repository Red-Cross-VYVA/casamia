import {
  Archive,
  Camera,
  ExternalLink,
  RefreshCw,
  Repeat2,
  Send,
  ShieldCheck,
} from 'lucide-react'
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import { InternalLayout } from '../../components/internal/InternalLayout'
import { CASAMIA_FACEBOOK_URL } from '../../constants/contact'
import {
  facebookStarterPosts,
  getArchivedSocialPosts,
  getFacebookPublishingStatus,
  publishFacebookStarterPost,
  replacePreviousFacebookCampaign,
  syncArchivedSocialPosts,
  type ArchivedSocialPost,
  type FacebookPublishingStatus,
  type SocialPublishingPlatform,
} from '../../services/internalFacebookPosts'

type PublishResults = Record<string, {
  postId: string
  url: string
  message: string
}>

const platformLabels: Record<SocialPublishingPlatform, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
}

function publishResultKey(postId: string, platform: SocialPublishingPlatform) {
  return `${postId}:${platform}`
}

function PublishButton({
  confirmationKey,
  confirmingPostId,
  disabled,
  icon,
  isPublishing,
  label,
  onCancel,
  onConfirm,
  onRequestConfirm,
}: {
  confirmationKey: string
  confirmingPostId: string
  disabled: boolean
  icon: ReactNode
  isPublishing: boolean
  label: string
  onCancel: () => void
  onConfirm: () => void
  onRequestConfirm: () => void
}) {
  if (confirmingPostId === confirmationKey) {
    return (
      <div className="grid gap-2" role="group" aria-label={`Confirm ${label.toLowerCase()}`}>
        <button
          className="btn btn-white justify-center"
          disabled={disabled}
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          className="btn btn-green justify-center"
          disabled={disabled}
          type="button"
          onClick={onConfirm}
        >
          {icon}
          Confirm publish
        </button>
      </div>
    )
  }

  return (
    <button
      className="btn btn-green justify-center"
      disabled={disabled}
      type="button"
      onClick={onRequestConfirm}
    >
      {icon}
      {isPublishing ? 'Publishing...' : label}
    </button>
  )
}

export function InternalFacebookPostsPage() {
  const initialCaptions = useMemo(
    () => Object.fromEntries(facebookStarterPosts.map((post) => [post.id, post.caption])) as Record<string, string>,
    [],
  )
  const [captions, setCaptions] = useState(initialCaptions)
  const [confirmingPostId, setConfirmingPostId] = useState('')
  const [message, setMessage] = useState('Checking Facebook connection...')
  const [publishingPostId, setPublishingPostId] = useState('')
  const [results, setResults] = useState<PublishResults>({})
  const [status, setStatus] = useState<FacebookPublishingStatus | null>(null)
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)
  const [isReplacingCampaign, setIsReplacingCampaign] = useState(false)
  const [showReplacementConfirmation, setShowReplacementConfirmation] = useState(false)
  const [archive, setArchive] = useState<ArchivedSocialPost[]>([])
  const [archiveLoaded, setArchiveLoaded] = useState(false)
  const [archiveError, setArchiveError] = useState('')
  const [isSyncingArchive, setIsSyncingArchive] = useState(false)
  const [view, setView] = useState<'queue' | 'archive'>('queue')
  const [platformFilter, setPlatformFilter] = useState<'all' | SocialPublishingPlatform>('all')
  const [search, setSearch] = useState('')

  const loadArchive = useCallback(async () => {
    try {
      const result = await getArchivedSocialPosts()
      setArchive(result.posts)
      setArchiveLoaded(true)
      setArchiveError('')
    } catch (error) {
      setArchiveError(error instanceof Error ? error.message : 'The archive could not be loaded.')
      setArchiveLoaded(false)
    }
  }, [])

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
    void loadArchive()
  }, [loadStatus, loadArchive])

  async function handleSyncArchive() {
    setIsSyncingArchive(true)
    try {
      const result = await syncArchivedSocialPosts()
      setArchive(result.posts)
      setArchiveLoaded(true)
      setArchiveError('')
      setMessage(`Archive synced. ${result.posts.length} published posts saved.${result.warnings.length ? ` ${result.warnings.join(' ')}` : ''}`)
    } catch (error) {
      setArchiveError(error instanceof Error ? error.message : 'Published posts could not be synced.')
    } finally {
      setIsSyncingArchive(false)
    }
  }

  async function handlePublish(postId: string, platform: SocialPublishingPlatform) {
    const post = facebookStarterPosts.find((item) => item.id === postId)
    if (!post) return

    const caption = captions[post.id]?.trim()
    if (!caption) {
      setMessage('Add a caption before publishing.')
      return
    }

    setConfirmingPostId('')
    setPublishingPostId(publishResultKey(post.id, platform))
    try {
      const result = await publishFacebookStarterPost({
        imagePath: post.imagePath,
        message: caption,
        platform,
      })
      const channelLabel = platformLabels[platform]
      const postResultId = platform === 'instagram'
        ? result.instagramId ?? ''
        : result.facebookPostId || result.facebookId
      const postUrl = platform === 'instagram'
        ? result.instagramUrl ?? ''
        : result.facebookUrl
      setResults((current) => ({
        ...current,
        [publishResultKey(post.id, platform)]: {
          message: `Published to ${channelLabel}.`,
          postId: postResultId,
          url: postUrl,
        },
      }))
      if (result.publication) {
        setArchive((current) => [result.publication!, ...current.filter((item) => item.id !== result.publication!.id)])
      }
      setMessage(result.archiveWarning || `${result.alreadyPublished ? 'Already published' : 'Published'} "${post.title}" in ${post.language} to ${channelLabel}. Saved in Archived posts.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : `${platformLabels[platform]} post could not be published.`)
    } finally {
      setPublishingPostId('')
    }
  }

  async function handleReplaceCampaign() {
    setShowReplacementConfirmation(false)
    setIsReplacingCampaign(true)
    setMessage('Removing the previous campaign before publishing the redesigned posts...')
    try {
      const result = await replacePreviousFacebookCampaign()
      setMessage(`Campaign replaced: ${result.deleted} old posts removed and ${result.published.length} redesigned posts published.`)
      setResults(Object.fromEntries(result.published.map((post) => [publishResultKey(post.id, 'facebook'), {
        postId: post.facebookPostId || post.facebookId,
        url: post.facebookUrl,
        message: 'Published as part of the redesigned campaign.',
      }])))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The Facebook campaign could not be replaced.')
    } finally {
      setIsReplacingCampaign(false)
      await loadArchive()
    }
  }

  const publishingEnabled = Boolean(status?.configured) && archiveLoaded && !isSyncingArchive
  const instagramDiagnostics = status?.instagramDiagnostics
  const instagramPublishingEnabled = Boolean(instagramDiagnostics?.ready) && archiveLoaded && !isSyncingArchive
  const tokenDiagnostics = status?.tokenDiagnostics
  const published = new Set(archive.map((post) => publishResultKey(post.sourcePostId, post.platform)))
  const queuedPosts = facebookStarterPosts.filter((post) => platformFilter === 'all'
    ? !archive.some((item) => item.sourcePostId === post.id)
    : !published.has(publishResultKey(post.id, platformFilter)))
  const matchesSearch = (value: string) => value.toLowerCase().includes(search.trim().toLowerCase())
  const visibleQueue = queuedPosts.filter((post) => matchesSearch(`${post.title} ${post.language} ${captions[post.id]}`))
  const filteredArchive = archive.filter((post) => platformFilter === 'all' || post.platform === platformFilter)
  const visibleArchive = filteredArchive.filter((post) => matchesSearch(`${post.title} ${post.language} ${post.caption} ${post.postId}`))
  const busy = Boolean(publishingPostId) || isReplacingCampaign || isSyncingArchive

  return (
    <InternalLayout
      title="Facebook posts"
      subtitle="Publish approved CasaMia organic Facebook posts."
      actions={
        <>
          <button className="btn btn-white" disabled={isLoadingStatus || busy} type="button" onClick={() => { void loadStatus(); void loadArchive() }}>
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
      <section className="mb-6 rounded-lg border border-border bg-white p-5 shadow-soft" aria-label="Post library">
        <div className="flex flex-wrap items-center gap-3">
          <button className={`btn ${view === 'queue' ? 'btn-navy' : 'btn-white'}`} type="button" aria-pressed={view === 'queue'} onClick={() => { setView('queue'); setConfirmingPostId('') }}>
            Ready to publish ({queuedPosts.length})
          </button>
          <button className={`btn ${view === 'archive' ? 'btn-navy' : 'btn-white'}`} type="button" aria-pressed={view === 'archive'} onClick={() => { setView('archive'); setConfirmingPostId('') }}>
            <Archive size={18} aria-hidden="true" /> Archived posts ({filteredArchive.length})
          </button>
          <button className="btn btn-white" type="button" disabled={busy} onClick={() => void handleSyncArchive()}>
            <RefreshCw size={18} className={isSyncingArchive ? 'animate-spin' : ''} aria-hidden="true" />
            {isSyncingArchive ? 'Syncing...' : 'Sync published posts'}
          </button>
        </div>
        <p className="mt-3 text-sm text-text-muted">Published posts move to the archive automatically. Sync to include posts already live on your connected accounts.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[200px_1fr]">
          <label className="grid gap-1 text-sm font-bold">Channel
            <select className="rounded-lg border border-border bg-white p-3" value={platformFilter} onChange={(event) => { setPlatformFilter(event.target.value as typeof platformFilter); setConfirmingPostId('') }}>
              <option value="all">All channels</option><option value="facebook">Facebook</option><option value="instagram">Instagram</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm font-bold">Search posts
            <input className="rounded-lg border border-border p-3" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search captions, titles or languages" />
          </label>
        </div>
        {archiveError ? <p className="mt-3 text-sm font-bold text-red-700" role="alert">{archiveError}</p> : null}
        {!archiveLoaded && !archiveError ? <p className="mt-3 text-sm" role="status">Loading published posts...</p> : null}
      </section>
      {view === 'queue' ? (
      <section className="mb-6 rounded-lg border border-border bg-white p-5 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue">Campaign update</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-text-dark">Replace the previous starter campaign</h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-relaxed text-text-muted">
              Removes only the ten known CasaMia starter campaign posts and publishes the ten redesigned English and Spanish replacements. Risk-stat posts below are not included in this bulk replacement.
            </p>
          </div>
          {showReplacementConfirmation ? (
            <div className="grid shrink-0 gap-2 sm:grid-cols-2">
              <button className="btn btn-white justify-center" disabled={isReplacingCampaign} type="button" onClick={() => setShowReplacementConfirmation(false)}>
                Cancel
              </button>
              <button className="btn btn-green justify-center" disabled={!publishingEnabled || isReplacingCampaign} type="button" onClick={() => void handleReplaceCampaign()}>
                <Repeat2 size={18} aria-hidden="true" />
                Confirm replacement
              </button>
            </div>
          ) : (
            <button className="btn btn-green shrink-0 justify-center" disabled={!publishingEnabled || isReplacingCampaign || Boolean(publishingPostId)} type="button" onClick={() => setShowReplacementConfirmation(true)}>
              <Repeat2 size={18} aria-hidden="true" />
              {isReplacingCampaign ? 'Replacing campaign...' : 'Replace old campaign'}
            </button>
          )}
        </div>
      </section>
      ) : null}
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-6 lg:grid-cols-2">
          {view === 'queue' && archiveLoaded && visibleQueue.map((post) => {
            const facebookKey = publishResultKey(post.id, 'facebook')
            const instagramKey = publishResultKey(post.id, 'instagram')
            const facebookResult = results[facebookKey]
            const instagramResult = results[instagramKey]
            const postLabel = post.id.startsWith('risk-') ? 'Risk stat post' : 'Starter post'

            return (
              <article className="overflow-hidden rounded-lg border border-border bg-white shadow-soft" key={post.id}>
                <img className="aspect-square w-full object-cover" src={post.imagePath} alt={`${post.title} social post`} />
                <div className="grid gap-4 p-5">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-blue">
                      {postLabel} · {post.language}
                    </p>
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
                  {[facebookResult, instagramResult].filter(Boolean).map((result) => (
                    <div className="rounded-lg bg-light-blue p-4 text-sm font-bold text-navy" key={result.message}>
                      {result.message}
                      {result.url ? (
                        <a className="ml-2 text-blue underline" href={result.url} target="_blank" rel="noopener noreferrer">
                          Open post
                        </a>
                      ) : result.postId ? (
                        <span className="ml-2 text-text-muted">Post ID: {result.postId}</span>
                      ) : null}
                    </div>
                  ))}
                  <div className="grid gap-2 sm:grid-cols-2">
                    {platformFilter !== 'instagram' ? (
                    <PublishButton
                      confirmationKey={facebookKey}
                      confirmingPostId={confirmingPostId}
                      disabled={!publishingEnabled || busy || published.has(facebookKey)}
                      icon={<Send size={18} aria-hidden="true" />}
                      isPublishing={publishingPostId === facebookKey}
                      label="Publish to Facebook"
                      onCancel={() => setConfirmingPostId('')}
                      onConfirm={() => void handlePublish(post.id, 'facebook')}
                      onRequestConfirm={() => setConfirmingPostId(facebookKey)}
                    />
                    ) : null}
                    {platformFilter !== 'facebook' ? (
                    <PublishButton
                      confirmationKey={instagramKey}
                      confirmingPostId={confirmingPostId}
                      disabled={!instagramPublishingEnabled || busy || published.has(instagramKey)}
                      icon={<Camera size={18} aria-hidden="true" />}
                      isPublishing={publishingPostId === instagramKey}
                      label="Publish to Instagram"
                      onCancel={() => setConfirmingPostId('')}
                      onConfirm={() => void handlePublish(post.id, 'instagram')}
                      onRequestConfirm={() => setConfirmingPostId(instagramKey)}
                    />
                    ) : null}
                  </div>
                </div>
              </article>
            )
          })}
          {view === 'archive' && visibleArchive.map((post) => (
            <article className="overflow-hidden rounded-lg border border-border bg-white shadow-soft" key={post.id}>
              {post.imageUrl || post.imagePath ? <img className="aspect-square w-full object-cover" src={post.imageUrl || post.imagePath} alt={`${post.title} published post`} loading="lazy" referrerPolicy="no-referrer" /> : null}
              <div className="grid gap-4 p-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-blue">Archived · {platformLabels[post.platform]}{post.language ? ` · ${post.language}` : ''}</p>
                <h2 className="font-display text-2xl font-bold text-text-dark">{post.title}</h2>
                <time className="text-sm font-semibold text-text-muted" dateTime={post.publishedAt}>{new Date(post.publishedAt).toLocaleString('en-GB', { timeZone: 'Europe/Madrid', dateStyle: 'medium', timeStyle: 'short' })} · Madrid</time>
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-text-dark">{post.caption || 'No caption'}</p>
                {post.url ? <a className="btn btn-white justify-center" href={post.url} target="_blank" rel="noopener noreferrer">Open published post <ExternalLink size={18} aria-hidden="true" /></a> : <p className="break-all text-xs text-text-muted">Post ID: {post.postId}</p>}
              </div>
            </article>
          ))}
          {archiveLoaded && (view === 'archive' ? !visibleArchive.length : !visibleQueue.length) ? (
            <p className="rounded-lg border border-border bg-white p-6 text-sm font-semibold text-text-muted lg:col-span-2">{search ? 'No posts match your search.' : view === 'archive' ? 'No archived posts yet. Sync published posts to import existing history.' : 'No posts waiting to publish for this channel. View Archived posts for published history.'}</p>
          ) : null}
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
            {instagramDiagnostics?.checked ? (
              <div className="rounded-lg bg-white/10 p-4">
                <dt className="font-black uppercase tracking-[0.14em] text-white/50">Instagram publishing</dt>
                <dd className={`mt-1 font-bold ${instagramDiagnostics.ready ? 'text-green' : 'text-gold'}`}>
                  {instagramDiagnostics.ready ? 'Ready to publish' : 'Needs attention'}
                </dd>
                {instagramDiagnostics.username || instagramDiagnostics.accountId ? (
                  <dd className="mt-2 text-xs font-bold text-white/70">
                    Account: {instagramDiagnostics.username ? `@${instagramDiagnostics.username}` : instagramDiagnostics.accountId}
                    {instagramDiagnostics.accountType ? ` · ${instagramDiagnostics.accountType}` : ''}
                  </dd>
                ) : null}
                <dd className="mt-2 text-xs font-bold text-white/70">
                  Page link: {instagramDiagnostics.pageLinked ? 'Detected from Facebook Page' : 'Using configured account or not linked'}
                </dd>
                {instagramDiagnostics.missingPermissions.length ? (
                  <dd className="mt-2 text-xs font-bold text-gold">
                    Missing from token: {instagramDiagnostics.missingPermissions.join(', ')}
                  </dd>
                ) : null}
                {instagramDiagnostics.permissionsChecked === false ? (
                  <dd className="mt-2 text-xs font-bold text-white/70">
                    Meta does not expose a permission list for this token type.
                  </dd>
                ) : null}
                {instagramDiagnostics.errors?.length ? (
                  <dd className="mt-2 text-xs font-bold text-gold">
                    {instagramDiagnostics.errors.join(' ')}
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
