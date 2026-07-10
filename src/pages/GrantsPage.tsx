import { AlertTriangle, Check, ExternalLink, FileText, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import {
  getPublishedGrantProgrammes,
  grantDocumentChecklist,
  grantServiceRoles,
  isGrantProgrammeExpired,
  type GrantProgramme,
} from '../constants/grantProgrammes'

export function GrantsPage() {
  const { i18n } = useTranslation()
  const programmes = getPublishedGrantProgrammes(i18n.language)

  return (
    <>
      <section className="grants-legal-hero">
        <div className="site-shell">
          <p className="eyebrow">Public funding guidance</p>
          <h1>Grants and financial assistance</h1>
          <p>
            Public grants may be available for certain accessibility improvements, home adaptations or energy-related
            works. Availability, eligibility, funding levels and deadlines depend on the relevant public programme and
            the customer&apos;s individual circumstances. CasaMia does not award grants and cannot guarantee that an
            application will be approved.
          </p>
          <div className="grants-hero-actions">
            <Link className="btn btn-green" to="/grant-check">
              Check possible assistance
            </Link>
            <a className="btn btn-white" href="#programmes">
              Explore available programmes
            </a>
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="site-shell grants-disclaimer-grid">
          <article className="grants-notice-card">
            <AlertTriangle size={26} aria-hidden="true" />
            <div>
              <h2>Important before relying on a grant</h2>
              <p>
                Applying for a grant is separate from purchasing CasaMia&apos;s services. A grant enquiry does not
                create an installation contract, reserve public funds or guarantee eligibility.
              </p>
              <p>
                Your CasaMia contract price is not conditional on receiving a grant unless your Project Order expressly
                states otherwise. You remain responsible for the agreed payments even if a grant application is delayed,
                reduced or rejected.
              </p>
            </div>
          </article>
          <article className="grants-price-card">
            <h2>How prices should be read</h2>
            <dl>
              <div>
                <dt>Contract price</dt>
                <dd>Shown separately, including VAT.</dd>
              </div>
              <div>
                <dt>Payment schedule</dt>
                <dd>Confirmed in your Project Order.</dd>
              </div>
              <div>
                <dt>Possible grant</dt>
                <dd>Indicative only until the authority approves it.</dd>
              </div>
              <div>
                <dt>Customer finance</dt>
                <dd>You may need to fund works before reimbursement.</dd>
              </div>
            </dl>
          </article>
        </div>
      </section>

      <section className="section-pad bg-light-blue">
        <div className="site-shell grants-role-grid">
          <div>
            <p className="eyebrow">CasaMia&apos;s role</p>
            <h2 className="display-title">Guidance, not public approval.</h2>
            <p>
              CasaMia can help identify programmes that may be relevant to your project. Any initial eligibility
              assessment is indicative only. The responsible public authority makes the final decision.
            </p>
          </div>
          <GrantList title="Grant-support services" items={grantServiceRoles} icon="shield" />
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="site-shell grants-disclaimer-grid">
          <article className="grants-price-card">
            <h2>Grant-support fees</h2>
            <dl>
              <div>
                <dt>General information</dt>
                <dd>Free.</dd>
              </div>
              <div>
                <dt>Initial eligibility screening</dt>
                <dd>Free unless a Project Order or grant-support agreement says otherwise.</dd>
              </div>
              <div>
                <dt>Application-support fee</dt>
                <dd>Must be disclosed separately, including VAT and whether payable if the grant is rejected.</dd>
              </div>
              <div>
                <dt>Independent adviser or gestor</dt>
                <dd>Any referral fee or commercial relationship must be disclosed before referral.</dd>
              </div>
            </dl>
          </article>
          <article className="grants-notice-card">
            <AlertTriangle size={26} aria-hidden="true" />
            <div>
              <h2>If work starts before approval</h2>
              <p>
                If a customer chooses to proceed with a CasaMia project before a grant decision, the checkout or Project
                Order must show a specific acknowledgement only when relevant:
              </p>
              <blockquote>
                I understand that my grant application has not yet been approved and that I remain responsible for the
                CasaMia contract price and payment schedule.
              </blockquote>
              <p>
                That acknowledgement must be recorded with its wording, version, locale and timestamp. It is separate
                from general terms acceptance.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="section-pad bg-white" id="programmes">
        <div className="site-shell">
          <div className="grants-section-heading">
            <p className="eyebrow">Verified programme cards</p>
            <h2 className="display-title">Available programme information</h2>
            <p>
              Last verified dates and official sources are required before a programme appears here. Always check the
              official programme page before making a financial decision.
            </p>
          </div>
          {programmes.length > 0 ? (
            <div className="grant-programme-grid">
              {programmes.map((programme) => (
                <GrantProgrammeCard key={programme.id} programme={programme} />
              ))}
            </div>
          ) : (
            <article className="grant-empty-state">
              <FileText size={34} aria-hidden="true" />
              <h3>No grant programme is currently published by CasaMia.</h3>
              <p>
                CasaMia will only list a programme after its official source, status, dates, eligibility rules,
                translation approval and review date have been checked. Use the grant check for an initial readiness
                review, then confirm details against the public authority source.
              </p>
              <Link className="btn btn-navy" to="/grant-check">
                Request an initial eligibility review
              </Link>
            </article>
          )}
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="site-shell grid gap-8 lg:grid-cols-2">
          <GrantList title="Documents often requested" items={grantDocumentChecklist} />
          <article className="soft-card">
            <h2 className="font-display text-3xl font-bold text-text-dark">Privacy and sensitive documents</h2>
            <p className="mt-4 text-text-mid">
              Grant applications may involve financial, disability, dependency or health-related information. CasaMia
              should collect those documents only through a secure process for a specific programme, not through ordinary
              marketing or contact forms.
            </p>
            <p className="mt-4 text-text-mid">
              A separate grant-assistance privacy notice and written representative mandate are required before CasaMia
              submits an application or receives notifications on your behalf.
            </p>
          </article>
        </div>
      </section>
    </>
  )
}

function GrantList({ icon, title, items }: { icon?: 'shield'; title: string; items: string[] }) {
  const Icon = icon === 'shield' ? ShieldCheck : Check

  return (
    <article className="soft-card">
      <h2 className="font-display text-3xl font-bold text-text-dark">{title}</h2>
      <ul className="mt-6 space-y-4">
        {items.map((item) => (
          <li className="flex gap-3 text-text-mid" key={item}>
            <Icon className="mt-1 shrink-0 text-green" size={18} aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

function GrantProgrammeCard({ programme }: { programme: GrantProgramme }) {
  const expired = isGrantProgrammeExpired(programme)

  return (
    <article className={`grant-programme-card ${expired ? 'is-expired' : ''}`}>
      <div className="grant-programme-card-top">
        <span>{expired ? 'Closed' : programme.status}</span>
        <strong>{programme.territory}</strong>
      </div>
      <h3>{programme.officialName}</h3>
      <p>{programme.casamiaCommentary}</p>
      <dl>
        <div>
          <dt>Responsible authority</dt>
          <dd>{programme.authority}</dd>
        </div>
        <div>
          <dt>Opening / closing date</dt>
          <dd>
            {programme.openingDate} / {programme.closingDate}
          </dd>
        </div>
        <div>
          <dt>Eligible applicants</dt>
          <dd>{programme.eligibleApplicants}</dd>
        </div>
        <div>
          <dt>Eligible properties</dt>
          <dd>{programme.eligibleProperties}</dd>
        </div>
        <div>
          <dt>Eligible work</dt>
          <dd>{programme.eligibleWork}</dd>
        </div>
        <div>
          <dt>Main exclusions</dt>
          <dd>{programme.exclusions}</dd>
        </div>
        <div>
          <dt>Funding</dt>
          <dd>{programme.maximumAmountOrPercentage}</dd>
        </div>
        <div>
          <dt>Payment timing</dt>
          <dd>{programme.applicationPaymentTiming}</dd>
        </div>
        <div>
          <dt>Compatibility</dt>
          <dd>{programme.compatibility}</dd>
        </div>
      </dl>
      <p className="grant-verified-note">
        Last verified: {programme.lastVerifiedDate}. Always check the official programme page before making a
        financial decision.
      </p>
      <a href={programme.officialSource} target="_blank" rel="noreferrer">
        View the official programme
        <ExternalLink size={16} aria-hidden="true" />
      </a>
    </article>
  )
}
