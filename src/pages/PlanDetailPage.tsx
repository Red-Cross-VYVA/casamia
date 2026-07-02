import { useState } from 'react'
import { ArrowRight, Check, ChevronLeft, ExternalLink, ShieldCheck, X } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'

import { PLAN_DETAILS, PLAN_DETAIL_LIST } from '../constants/planDetails'
import type { PlanId } from '../constants/shopify'
import { SafeImage } from '../components/SafeImage'
import { TrustBar } from '../components/TrustBar'

function isPlanId(value: string | undefined): value is PlanId {
  return value === 'essential' || value === 'advanced' || value === 'premium'
}

export function PlanDetailPage() {
  const { planId } = useParams()
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  if (!isPlanId(planId)) {
    return <Navigate to="/plans" replace />
  }

  const plan = PLAN_DETAILS[planId]
  const otherPlans = PLAN_DETAIL_LIST.filter((item) => item.id !== plan.id)
  const galleryItems =
    plan.galleryImages ??
    plan.images.map((image, index) => ({
      src: image,
      title: `${plan.marketingName} reference ${index + 1}`,
      description:
        'Review the safety checks and adaptations included with the package.',
    }))
  const selectedGalleryItem =
    selectedImageIndex === null ? null : galleryItems[selectedImageIndex] ?? null
  const selectedImageNumber =
    selectedImageIndex === null ? 0 : selectedImageIndex + 1

  return (
    <>
      <section className="plan-detail-hero bg-light-blue pt-28">
        <div className="site-shell">
          <Link
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-white px-4 text-sm font-bold text-navy transition hover:bg-pale-blue"
            to="/plans"
          >
            <ChevronLeft size={18} aria-hidden="true" />
            Back to plans
          </Link>

          <div className="plan-detail-grid mt-10 items-center gap-16">
            <div>
              <p className="text-sm font-extrabold uppercase text-text-muted">
                {plan.marketingName} plan
              </p>
              <h1 className="mt-3 font-display text-5xl font-bold leading-tight text-text-dark md:text-6xl">
                {plan.shopifyTitle}
              </h1>
              <p className="mt-6 max-w-2xl text-xl leading-relaxed text-text-mid">
                {plan.summary}
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <a
                  className="btn btn-green"
                  href={plan.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Buy on Shopify
                  <ExternalLink size={18} aria-hidden="true" />
                </a>
                <span className="font-display text-5xl font-black text-navy">
                  {plan.price}
                </span>
                <span className="font-bold text-text-muted">one-time</span>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {plan.outcomes.slice(0, 4).map((outcome) => (
                  <div className="flex gap-3 rounded-lg bg-white p-4" key={outcome}>
                    <ShieldCheck className="mt-1 shrink-0 text-green" size={20} aria-hidden="true" />
                    <span className="font-semibold text-text-dark">{outcome}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <SafeImage
                src={plan.images[0]}
                alt={`${plan.shopifyTitle} main image`}
                className="plan-main-image overflow-hidden rounded-lg shadow-soft"
                imgClassName="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <TrustBar />

      <section className="section-pad bg-white">
        <div className="site-shell">
          <div className="walkthrough-intro gap-10">
            <div className="max-w-3xl">
              <p className="eyebrow">Room-by-room walkthrough</p>
              <h2 className="display-title mt-5">
                Understand what changes before anyone comes to install.
              </h2>
              <p className="mt-5 text-xl leading-relaxed text-text-mid">
                Explore the main safety moments CasaMia reviews, then open each reference to see the equipment and room adaptations in context.
              </p>
            </div>

            <aside className="walkthrough-assurance rounded-lg bg-light-blue p-6">
              <p className="text-sm font-extrabold uppercase text-navy">
                Included support
              </p>
              <ul className="mt-5 space-y-4">
                {[
                  'Free home assessment',
                  'Grant filing guidance',
                  'Professional installation',
                ].map((item) => (
                  <li className="flex gap-3 text-text-dark" key={item}>
                    <Check className="mt-1 shrink-0 text-green" size={18} aria-hidden="true" />
                    <span className="font-semibold">{item}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {galleryItems.map((item, index) => (
              <button
                className="group overflow-hidden rounded-lg border border-border bg-white text-left shadow-soft transition hover:-translate-y-1"
                key={item.src}
                type="button"
                aria-label={`View ${item.title} detail`}
                onClick={() => setSelectedImageIndex(index)}
              >
                <SafeImage
                  src={item.src}
                  alt={`${plan.shopifyTitle}: ${item.title}`}
                  className="plan-gallery-image bg-light-blue"
                  imgClassName="h-full w-full object-contain"
                />
                <span className="block p-6">
                  <span className="text-xs font-extrabold uppercase text-green">
                    View detail
                  </span>
                  <span className="mt-2 flex items-start justify-between gap-4">
                    <span className="font-display text-2xl font-bold leading-tight text-text-dark">
                      {item.title}
                    </span>
                    <ArrowRight
                      className="mt-1 shrink-0 text-navy transition group-hover:translate-x-1"
                      size={20}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="mt-3 block text-base leading-relaxed text-text-mid">
                    {item.description}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-6 rounded-lg bg-navy p-8 text-white md:flex-row md:items-center">
            <div className="max-w-3xl">
              <h3 className="font-display text-3xl font-bold leading-tight">
                Not sure which risks matter most?
              </h3>
              <p className="mt-3 text-white/80">
                Start with the free home assessment. CasaMia reviews the home, confirms the right adaptations, and helps with grant filing before installation.
              </p>
            </div>
            <Link className="btn btn-white shrink-0" to="/free-home-safety-assessment">
              Book free assessment
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="section-pad bg-pale-blue">
        <div className="site-shell">
          <div className="max-w-3xl">
            <p className="eyebrow">What is included</p>
            <h2 className="display-title mt-5">
              Exactly what CasaMia installs and manages.
            </h2>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            {plan.included.map((section) => (
              <article className="rounded-lg bg-white p-8 shadow-soft" key={section.title}>
                <h3 className="font-display text-3xl font-bold leading-tight text-text-dark">
                  {section.title}
                </h3>
                <ul className="mt-6 space-y-4">
                  {section.items.map((item) => (
                    <li className="flex gap-3 text-text-mid" key={item}>
                      <Check className="mt-1 shrink-0 text-green" size={18} aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="plan-detail-grid site-shell gap-16">
          <div>
            <p className="eyebrow">How it works</p>
            <h2 className="display-title mt-5">From plan choice to safer home.</h2>
            <div className="mt-10 space-y-5">
              {plan.process.map((step, index) => (
                <article className="flex gap-5 rounded-lg bg-white p-5 shadow-soft" key={step}>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy font-display text-xl font-black text-white">
                    {index + 1}
                  </span>
                  <p className="font-semibold text-text-dark">{step}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="rounded-lg bg-navy p-8 text-white">
            <p className="text-sm font-extrabold uppercase text-white/70">
              Best for
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold leading-tight">
              Who should choose {plan.marketingName}?
            </h2>
            <ul className="mt-8 space-y-4">
              {plan.bestFor.map((item) => (
                <li className="flex gap-3" key={item}>
                  <Check className="mt-1 shrink-0 text-green" size={18} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 rounded-lg bg-white/10 p-4 text-sm text-white/80">
              {plan.note}
            </p>
          </aside>
        </div>
      </section>

      <section className="bg-pale-blue py-14">
        <div className="site-shell flex flex-col items-start justify-between gap-6 rounded-lg border border-border bg-white p-8 shadow-soft md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-3xl font-bold text-text-dark">
              Ready to choose {plan.marketingName}?
            </h2>
            <p className="mt-2 text-text-mid">
              Purchase on Shopify, then CasaMia can schedule assessment, installation, and grant support.
            </p>
          </div>
          <a className="btn btn-green" href={plan.url} target="_blank" rel="noreferrer">
            Buy {plan.marketingName}
            <ArrowRight size={20} aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className="section-pad bg-light-blue">
        <div className="site-shell">
          <h2 className="display-title">Compare with other plans.</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {otherPlans.map((otherPlan) => (
              <Link
                className="rounded-lg border border-border bg-white p-6 shadow-soft transition hover:-translate-y-1"
                key={otherPlan.id}
                to={`/plans/${otherPlan.id}`}
              >
                <p className="text-sm font-extrabold uppercase text-text-muted">
                  {otherPlan.marketingName}
                </p>
                <h3 className="mt-2 font-display text-3xl font-bold text-text-dark">
                  {otherPlan.shopifyTitle}
                </h3>
                <p className="mt-3 text-text-mid">{otherPlan.summary}</p>
                <p className="mt-5 font-bold text-navy">View {otherPlan.marketingName}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {selectedGalleryItem && (
        <div
          className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${plan.shopifyTitle}: ${selectedGalleryItem.title}`}
          onClick={() => setSelectedImageIndex(null)}
        >
          <div
            className="gallery-lightbox w-full rounded-lg bg-white p-4 shadow-soft"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-sm font-extrabold uppercase leading-tight text-navy">
                {selectedGalleryItem.title} - {selectedImageNumber} of {galleryItems.length}
              </p>
              <button
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border text-navy transition hover:bg-light-blue"
                type="button"
                aria-label="Close gallery image"
                onClick={() => setSelectedImageIndex(null)}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <SafeImage
              src={selectedGalleryItem.src}
              alt={`${plan.shopifyTitle}: ${selectedGalleryItem.title}`}
              className="gallery-lightbox-image overflow-hidden rounded-lg bg-light-blue"
              imgClassName="h-full w-full object-contain"
            />
          </div>
        </div>
      )}
    </>
  )
}
