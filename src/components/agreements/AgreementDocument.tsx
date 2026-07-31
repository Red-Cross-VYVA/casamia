import { CalendarDays, FileCheck2, ShieldCheck } from 'lucide-react'

import type { AgreementAssignment, AgreementVersion } from '../../services/agreementManagement'

export function AgreementDocument({
  assignment,
  compact = false,
  version,
}: {
  assignment: AgreementAssignment
  compact?: boolean
  version: AgreementVersion
}) {
  const isSpanish = version.locale === 'es'
  const copy = isSpanish
    ? {
        assigned: 'Asignado',
        expires: 'Caduca',
        eyebrow: 'Acuerdo CasaMia',
        partner: 'Colaborador',
        signatureBlocks: 'Firmas',
        signatureLine: 'Nombre, cargo, fecha y firma',
        notSet: 'Sin definir',
      }
    : {
        assigned: 'Assigned',
        expires: 'Expires',
        eyebrow: 'CasaMia agreement',
        partner: 'Partner',
        signatureBlocks: 'Signature blocks',
        signatureLine: 'Name, role, date and signature',
        notSet: 'Not set',
      }

  return (
    <article className="rounded-lg border border-border bg-white shadow-soft">
      <header className="border-b border-border bg-pale-blue p-5 md:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue">
              {copy.eyebrow}
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold leading-tight text-text-dark md:text-5xl">
              {version.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm font-bold leading-relaxed text-text-mid">
              {version.languageLabel} · Version {version.version} · {version.reviewStatus}
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-navy">
            <ShieldCheck size={17} aria-hidden="true" />
            {assignment.assignmentId}
          </span>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <MetaTile fallback={copy.notSet} icon={FileCheck2} label={copy.partner} value={assignment.partnerBusinessName} />
          <MetaTile fallback={copy.notSet} icon={CalendarDays} label={copy.assigned} value={formatDate(assignment.assignedAt, version.locale)} />
          <MetaTile fallback={copy.notSet} icon={CalendarDays} label={copy.expires} value={formatDate(assignment.expiresAt, version.locale)} />
        </div>
      </header>

      <div className={compact ? 'grid gap-5 p-5 md:p-7' : 'grid gap-7 p-5 md:p-8'}>
        {version.sections.map((section) => (
          <section className="break-inside-avoid" key={section.id}>
            <h2 className="font-display text-2xl font-bold leading-tight text-text-dark">
              {section.title}
            </h2>
            {section.body ? (
              <p className="mt-3 text-sm font-semibold leading-relaxed text-text-mid md:text-base">
                {section.body}
              </p>
            ) : null}
            {section.points?.length ? (
              <ul className="mt-3 grid gap-2">
                {section.points.map((point) => (
                  <li className="flex gap-3 text-sm font-semibold leading-relaxed text-text-mid md:text-base" key={point}>
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-green" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        <section className="rounded-lg border border-border bg-light-blue p-5">
          <h2 className="font-display text-2xl font-bold text-text-dark">{copy.signatureBlocks}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {version.signatureBlocks.map((block) => (
              <div className="rounded-lg bg-white p-4" key={block}>
                <p className="text-sm font-black uppercase tracking-wide text-text-muted">{block}</p>
                <div className="mt-8 border-t border-text-dark pt-3 text-sm font-bold text-text-mid">
                  {copy.signatureLine}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </article>
  )
}

function MetaTile({
  fallback,
  icon: Icon,
  label,
  value,
}: {
  fallback: string
  icon: typeof FileCheck2
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-text-muted">
        <Icon size={15} aria-hidden="true" />
        {label}
      </div>
      <p className="mt-2 text-sm font-extrabold text-text-dark">{value || fallback}</p>
    </div>
  )
}

function formatDate(value: string, locale: AgreementVersion['locale']) {
  if (!value) return ''
  const dateLocale = locale === 'en' ? 'en-GB' : 'es-ES'
  return new Intl.DateTimeFormat(dateLocale, { dateStyle: 'medium' }).format(new Date(value))
}
