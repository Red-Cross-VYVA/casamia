import {
  ClipboardList,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Network,
  PackageCheck,
  Route,
} from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'

import { BrandLogo } from '../BrandLogo'
import { clearInternalAuthSession } from '../../services/internalAuth'

const internalLinks = [
  { label: 'Dashboard', to: '/internal', icon: LayoutDashboard },
  { label: "Today's visits", to: '/internal/visits', icon: Route },
  { label: 'Report builder', to: '/internal/inspection-report', icon: ClipboardList },
  { label: 'Service catalog', to: '/internal/service-catalog', icon: PackageCheck },
  { label: 'Proposals', to: '/internal/proposals', icon: FileText },
  { label: 'Provider partners', to: '/internal/provider-partners', icon: Network },
]

export function InternalSidebar() {
  function handleSignOut() {
    clearInternalAuthSession()
    window.location.assign('/')
  }

  return (
    <aside className="border-b border-border bg-ink text-white lg:sticky lg:top-0 lg:flex lg:min-h-screen lg:flex-col lg:border-b-0 lg:border-r lg:border-white/10">
      <div className="flex min-h-20 items-center justify-between gap-5 px-5 py-4 lg:block lg:px-6 lg:py-7">
        <Link className="inline-flex rounded-md bg-white px-3 py-2" to="/internal" aria-label="CasaMia Operations">
          <BrandLogo />
        </Link>
        <Link
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-extrabold text-white/80 transition hover:border-white/40 hover:text-white lg:hidden"
          to="/"
        >
          <Home size={16} aria-hidden="true" />
          Public site
        </Link>
      </div>

      <nav className="grid gap-2 px-5 pb-4 sm:grid-cols-6 lg:flex lg:flex-col lg:px-4 lg:pb-0">
        {internalLinks.map((link) => {
          const Icon = link.icon

          return (
            <NavLink
              className={({ isActive }) =>
                `inline-flex min-h-12 w-full items-center gap-3 rounded-lg px-4 text-sm font-extrabold transition ${
                  isActive
                    ? 'bg-white text-navy shadow-soft'
                    : 'text-white/72 hover:bg-white/10 hover:text-white'
                }`
              }
              end={link.to === '/internal'}
              key={link.to}
              to={link.to}
            >
              <Icon size={18} aria-hidden="true" />
              {link.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-auto hidden px-4 pb-7 pt-10 lg:block">
        <button
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-4 text-sm font-extrabold text-white/70 transition hover:border-white/35 hover:text-white"
          type="button"
          onClick={handleSignOut}
        >
          <LogOut size={17} aria-hidden="true" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
