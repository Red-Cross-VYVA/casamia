import {
  ArrowRight,
  Building2,
  ClipboardCheck,
  HeartPulse,
  MonitorCheck,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

import { SEO } from '../components/SEO'

const facilitySolutions = [
  {
    icon: MonitorCheck,
    title: 'Smart room automation',
    body: 'Voice assistants, lighting routines, smart access and resident-friendly controls designed around the care setting.',
  },
  {
    icon: HeartPulse,
    title: 'Remote health monitoring',
    body: 'Vital monitoring, fall detection, nurse dashboards and family visibility where the operating model supports it.',
  },
  {
    icon: UsersRound,
    title: 'Resident engagement',
    body: 'Voice companions, activity prompts, calendar reminders, family messaging and simple digital inclusion tools.',
  },
  {
    icon: ClipboardCheck,
    title: 'Operational workflows',
    body: 'Digital care records, emergency response flows, reception support and clear implementation planning.',
  },
]

export function AssistedLivingSolutionsPage() {
  useEffect(() => {
    document.title = 'Assisted Living Solutions | CasaMia'
  }, [])

  return (
    <>
      <SEO
        title="Assisted Living and Senior Housing Solutions"
        description="CasaMia designs bespoke safety technology, dashboards, voice assistants and monitoring solutions for assisted living facilities, care homes and senior housing."
        path="/assisted-living-solutions"
      />

      <section className="services-hub-hero">
        <div className="services-hub-hero-grid site-shell">
          <div className="services-hub-copy">
            <span className="eyebrow">Assisted living solutions</span>
            <h1>Smart safety and resident support for senior living operators.</h1>
            <p>
              CasaMia designs bespoke solutions for assisted living facilities, retirement villages, care homes,
              nursing homes and municipal senior housing after an on-site assessment.
            </p>
            <div className="services-hub-actions">
              <Link className="btn btn-green" to="/why-us#contact-form">
                Discuss a Facility Project
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
              <Link className="btn btn-white" to="/provider-partners">
                Partner with CasaMia
              </Link>
            </div>
          </div>

          <aside className="plans-hero-summary">
            <span>
              <Building2 size={25} aria-hidden="true" />
            </span>
            <h2>Designed after assessment</h2>
            <p>
              Facility solutions are custom scoped. CasaMia reviews resident needs, staffing workflows, risk areas,
              infrastructure and family communication before proposing a system.
            </p>
          </aside>
        </div>
      </section>

      <section className="services-hub-section bg-white">
        <div className="site-shell">
          <div className="services-hub-heading">
            <p className="eyebrow">What CasaMia can design</p>
            <h2>Technology that supports care teams, residents and families.</h2>
            <p>
              The goal is not to add complexity. The goal is to make safety, communication and daily support easier
              to coordinate at facility level.
            </p>
          </div>

          <div className="services-highlight-grid">
            {facilitySolutions.map((solution) => {
              const Icon = solution.icon

              return (
                <article key={solution.title}>
                  <span>
                    <Icon size={24} aria-hidden="true" />
                  </span>
                  <h3>{solution.title}</h3>
                  <p>{solution.body}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="plans-payment-section section-pad">
        <div className="site-shell">
          <div className="plans-payment-panel">
            <div>
              <h2 className="display-title">Typical modules</h2>
              <p>
                AI receptionists, voice assistants in rooms, nurse dashboards, family dashboards, emergency response,
                fall detection, remote vital monitoring, digital records and activity management can be combined into
                one implementation plan.
              </p>
            </div>
            <div className="plans-payment-reassurance">
              <Sparkles size={22} aria-hidden="true" />
              <p>Every assisted living solution is custom designed following an on-site assessment.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="plans-final-cta">
        <div className="site-shell">
          <div className="plans-final-panel">
            <div>
              <h2>Planning a senior living project?</h2>
              <p>CasaMia can help scope a practical technology and safety roadmap for your facility.</p>
            </div>
            <Link className="btn btn-green" to="/why-us#contact-form">
              Contact CasaMia
              <ShieldCheck size={20} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
