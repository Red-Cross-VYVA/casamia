import type { ReactNode } from 'react'

import { InternalSidebar } from './InternalSidebar'

export function InternalLayout({
  actions,
  children,
  subtitle,
  title,
}: {
  actions?: ReactNode
  children: ReactNode
  subtitle?: string
  title: string
}) {
  return (
    <div className="min-h-screen bg-pale-blue text-text-mid lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <InternalSidebar />
      <div className="min-w-0">
        <header className="border-b border-border bg-white/95 px-5 py-5 shadow-[0_8px_24px_rgba(13,30,46,0.05)] lg:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-text-muted">
                Internal Operations
              </p>
              <h1 className="mt-2 font-display text-4xl font-bold leading-tight text-text-dark md:text-5xl">
                {title}
              </h1>
              {subtitle ? <p className="mt-2 max-w-3xl text-base text-text-mid">{subtitle}</p> : null}
            </div>
            {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
          </div>
        </header>

        <main className="px-5 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  )
}
