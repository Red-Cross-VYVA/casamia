import type { LucideIcon } from 'lucide-react'

export function StatCard({
  accent = 'blue',
  icon: Icon,
  label,
  value,
}: {
  accent?: 'blue' | 'green' | 'gold' | 'navy'
  icon: LucideIcon
  label: string
  value: string
}) {
  const accentClasses = {
    blue: 'bg-blue/10 text-blue',
    gold: 'bg-gold/15 text-[#b07611]',
    green: 'bg-green/10 text-green',
    navy: 'bg-navy/10 text-navy',
  }

  return (
    <article className="rounded-lg border border-border bg-white p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-extrabold uppercase text-text-muted">{label}</p>
          <p className="mt-3 font-display text-4xl font-black leading-none text-text-dark">{value}</p>
        </div>
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-lg ${accentClasses[accent]}`}>
          <Icon size={24} aria-hidden="true" />
        </span>
      </div>
    </article>
  )
}
