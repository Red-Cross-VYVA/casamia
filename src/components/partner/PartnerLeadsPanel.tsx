import { CalendarClock, Mail, MapPin, MessageCircle, Phone, UsersRound } from 'lucide-react'
import { useEffect, useState } from 'react'

import { loadPartnerLeads, type Lead } from '../../services/internalLeads'

export function PartnerLeadsPanel() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [message, setMessage] = useState('Loading assigned leads...')

  useEffect(() => {
    let active = true
    void loadPartnerLeads()
      .then((result) => {
        if (!active) return
        setLeads(result.leads)
        setMessage(result.leads.length ? '' : 'No customer leads are currently assigned to this partner email.')
      })
      .catch((error) => {
        if (active) setMessage(error instanceof Error ? error.message : 'Assigned leads could not be loaded.')
      })
    return () => { active = false }
  }, [])

  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <span className="inline-grid h-11 w-11 place-items-center rounded-lg bg-blue/10 text-blue"><UsersRound size={22} aria-hidden="true" /></span>
        <div><p className="text-xs font-black uppercase text-text-muted">Customer work</p><h2 className="mt-1 font-display text-3xl font-bold text-text-dark">Assigned leads</h2></div>
      </div>
      <p className="mt-3 text-sm font-bold leading-relaxed text-text-muted">Only leads assigned by CasaMia to your signed-in email appear here.</p>

      {message ? <p className="mt-5 rounded-lg border border-dashed border-border bg-light-blue p-5 text-sm font-bold text-text-muted" role="status">{message}</p> : null}
      <div className="mt-5 grid gap-4">
        {leads.map((lead) => {
          const whatsappUrl = lead.phone ? `https://wa.me/${lead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${lead.name || ''}, I am contacting you on behalf of CasaMia about your home safety enquiry.`)}` : ''
          return (
            <article className="rounded-lg border border-border bg-pale-blue/40 p-5" key={`${lead.source}-${lead.id}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div><p className="text-xs font-black uppercase text-blue">{lead.sourceLabel}</p><h3 className="mt-1 font-display text-2xl font-bold text-text-dark">{lead.name || 'Customer enquiry'}</h3></div>
                <span className="inline-flex self-start rounded-full bg-white px-3 py-1 text-xs font-black text-navy">{lead.status}</span>
              </div>
              <div className="mt-4 grid gap-2 text-sm font-bold text-text-mid sm:grid-cols-2">
                <p className="inline-flex items-center gap-2"><MapPin size={16} />{lead.city || 'Area not provided'}</p>
                <p className="inline-flex items-center gap-2"><CalendarClock size={16} />{lead.followUpAt ? formatDateTime(lead.followUpAt) : 'No follow-up scheduled'}</p>
              </div>
              {lead.visitAppointment ? (
                <div className="mt-4 rounded-lg border border-blue/20 bg-white p-4">
                  <p className="text-xs font-black uppercase text-blue">Reserved home visit</p>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm font-extrabold text-text-dark">
                    <CalendarClock size={17} aria-hidden="true" />
                    {formatDateTime(lead.visitAppointment.startAt)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-text-muted">Europe/Madrid time</p>
                </div>
              ) : null}
              {lead.partnerNotes ? <div className="mt-4 rounded-lg bg-white p-4"><p className="text-xs font-black uppercase text-text-muted">CasaMia instructions</p><p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-relaxed">{lead.partnerNotes}</p></div> : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {lead.phone ? <a className="btn btn-white" href={`tel:${lead.phone}`}><Phone size={16} />Call</a> : null}
                {lead.email ? <a className="btn btn-white" href={`mailto:${lead.email}`}><Mail size={16} />Email</a> : null}
                {whatsappUrl ? <a className="btn btn-green" href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={16} />WhatsApp</a> : null}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function formatDateTime(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Madrid' }).format(date)
}
