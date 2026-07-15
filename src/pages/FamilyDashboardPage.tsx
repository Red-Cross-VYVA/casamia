import {
  ArrowRight,
  BellRing,
  CalendarCheck,
  HeartPulse,
  MessageCircle,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

import { SEO } from '../components/SEO'

const dashboardFeatures = [
  {
    icon: HeartPulse,
    title: 'Health and vitals visibility',
    body: 'View compatible blood pressure, glucose, oxygen, weight or ECG readings when the family chooses monitoring add-ons.',
  },
  {
    icon: BellRing,
    title: 'Safety and emergency alerts',
    body: 'Receive notifications from emergency buttons, fall detection, door sensors, leak sensors or unusual activity patterns.',
  },
  {
    icon: CalendarCheck,
    title: 'Medication and routine reminders',
    body: 'Support daily routines with reminders, check-ins and simple visibility for the family.',
  },
  {
    icon: MessageCircle,
    title: 'Family communication',
    body: 'Keep updates, messages and important next steps easier to share between relatives and support providers.',
  },
]

export function FamilyDashboardPage() {
  useEffect(() => {
    document.title = 'Family Dashboard | CasaMia'
  }, [])

  return (
    <>
      <SEO
        title="CasaMia Family Dashboard"
        description="CasaMia Family Dashboard helps families view alerts, routines, health monitoring and emergency notifications after the Home Safety Plan."
        path="/family-dashboard"
      />

      <section className="services-hub-hero">
        <div className="services-hub-hero-grid site-shell">
          <div className="services-hub-copy">
            <span className="eyebrow">Family Dashboard</span>
            <h1>Keep the family informed without overwhelming the resident.</h1>
            <p>
              The CasaMia Family Dashboard is an optional add-on after the Home Safety Plan. It brings alerts,
              routine checks, reminders and selected health monitoring into one calmer view.
            </p>
            <div className="services-hub-actions">
              <Link className="btn btn-green" to="/home-safety-assessment?plan=home-safety">
                Book Assessment
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
              <Link className="btn btn-white" to="/services">
                View Add-ons
              </Link>
            </div>
          </div>

          <aside className="plans-hero-summary">
            <span>
              <UsersRound size={25} aria-hidden="true" />
            </span>
            <h2>Designed for families</h2>
            <p>
              Useful signals, emergency notifications and routine updates, without turning everyday life into a
              complicated monitoring project.
            </p>
          </aside>
        </div>
      </section>

      <section className="services-hub-section bg-white">
        <div className="site-shell">
          <div className="services-hub-heading">
            <p className="eyebrow">What families can see</p>
            <h2>Clear information when it matters.</h2>
            <p>
              Dashboard features depend on the add-ons chosen after the assessment. CasaMia helps configure only the
              signals that are useful for the home and resident.
            </p>
          </div>

          <div className="services-highlight-grid">
            {dashboardFeatures.map((feature) => {
              const Icon = feature.icon

              return (
                <article key={feature.title}>
                  <span>
                    <Icon size={24} aria-hidden="true" />
                  </span>
                  <h3>{feature.title}</h3>
                  <p>{feature.body}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="plans-final-cta">
        <div className="site-shell">
          <div className="plans-final-panel">
            <div>
              <h2>Start with the safety assessment.</h2>
              <p>
                CasaMia first checks the home, then recommends whether dashboard features, sensors or health
                monitoring would genuinely help.
              </p>
            </div>
            <Link className="btn btn-green" to="/plans">
              See Home Safety Plan
              <ShieldCheck size={20} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
