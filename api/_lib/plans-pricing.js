const roomToCategory = {
  bathroom: 'Bathroom',
  bedroom: 'Bedroom',
  entrance: 'Entryway',
  kitchen: 'Kitchen',
  'living-room': 'Living Room',
}

const roomPackageAreas = new Set(['bathroom', 'bedroom', 'entrance', 'kitchen', 'living-room'])

export function buildPublicPlansDraft({ body, cataloguePayload, now = new Date() }) {
  const catalogue = normaliseCatalogue(cataloguePayload)
  if (!catalogue) {
    return invalidResult(503, 'The CasaMia service catalogue is not ready for public proposals.')
  }

  const customer = normaliseCustomer(body?.customer)
  if (!customer.name || !customer.email) {
    return invalidResult(400, 'Name and email are required to create a proposal.')
  }

  if (body?.consent !== true) {
    return invalidResult(400, 'Consent is required to create a proposal.')
  }

  if (hasHoneypotValue(body)) {
    return invalidResult(400, 'Invalid request.')
  }

  const language = String(body?.language ?? '').toLowerCase().startsWith('es') ? 'es' : 'en'
  const selection = normaliseSelection(body?.selection)
  const estimate = calculatePlansDraftEstimate(catalogue, selection, language)

  if (!estimate.lineItems.length) {
    return invalidResult(400, 'Select at least one CasaMia package.')
  }

  const proposalDate = now.toISOString().slice(0, 10)
  const validUntil = addDays(now, 14)
  const proposalId = createProposalId(now)
  const summaryCopy = proposalCopy(language)
  const proposalPayload = {
    acceptance_date: '',
    acceptance_status: 'Sent',
    accepted_by: '',
    address: customer.address,
    area: customer.area,
    customer_email: customer.email,
    customer_name: customer.name,
    customer_phone: customer.phone,
    events: [{ at: now.toISOString(), type: 'public-plans-proposal-created' }],
    executive_summary: summaryCopy.summary(estimate),
    grant_eligibility_note: summaryCopy.grants,
    grant_support_required: false,
    id: proposalId,
    inspection_reference: 'Public Plans builder',
    line_items: estimate.lineItems,
    overall_risk_level: 'Moderate',
    payment_terms: summaryCopy.paymentTerms,
    plan: 'Home adaptations',
    prepared_by: 'CasaMia',
    proposal_date: proposalDate,
    safety_score: 'N/A',
    selected_plan: 'Home adaptations',
    status: 'Sent',
    timeline_duration: summaryCopy.timelineDuration,
    timeline_notes: summaryCopy.timeline,
    timeline_start_date: '',
    total: estimate.oneTimeEstimate,
    total_estimate: estimate.oneTimeEstimate,
    valid_until: validUntil,
    plans_builder: {
      language,
      recurring_monthly_estimate: estimate.recurringMonthlyEstimate,
      review_items: estimate.reviewItems,
      selected_package_count: estimate.selectedPackageCount,
      selected_room_quantity: estimate.selectedRoomQuantity,
      source: 'public-plans-builder',
      submitted_selection: selection,
      vat_included: true,
    },
  }

  return {
    ok: true,
    proposalPayload,
  }
}

function calculatePlansDraftEstimate(catalogue, selection, language) {
  const lineItems = []
  const reviewItems = new Set()
  let selectedPackageCount = 0
  let selectedRoomQuantity = 0
  let recurringMonthlyEstimate = 0

  getVisibleRoomGroups(catalogue).forEach((group) => {
    const selected = selection[group.homePackage.id]

    if (!selected?.selected) {
      return
    }

    const quantity = normaliseQuantity(selected.quantity)
    selectedRoomQuantity += quantity
    selectedPackageCount += 1
    const homeUnitPrice = getPackageUnitPrice(group.homePackage, getPackageConfig(catalogue, group.room.id))
    const homeRequiresReview = packageNeedsReview(group.homePackage, homeUnitPrice)
    const homeLine = createLineItem({
      category: roomToCategory[group.room.id] ?? 'General',
      description: buildPackageDescription(group.homePackage, group.homeOutcomes, language, homeRequiresReview),
      grantEligible: group.homeOutcomes.some((outcome) => outcome.grantEligible),
      id: `plans-package-${group.homePackage.id}`,
      name: getLineName(localize(group.homePackage.customerName, language, group.homePackage.internalName), language),
      priority: homeRequiresReview ? 'Medium' : 'High',
      quantity,
      sourcePackageId: group.homePackage.id,
      unitPrice: homeUnitPrice,
    })
    lineItems.push(homeLine)
    if (homeRequiresReview) reviewItems.add(homeLine.name)
    recurringMonthlyEstimate += getPackageRecurringMonthlyPrice(group.homePackage) * quantity

    const selectedAddOnIds = new Set(selected.addOnOutcomeIds)

    group.addOnPackages.forEach(({ packageRecord, outcomes }) => {
      const selectedOutcomes = outcomes.filter((outcome) => selectedAddOnIds.has(outcome.id))
      if (!selectedOutcomes.length) return

      selectedPackageCount += 1
      const packageUnitPrice = getPackageUnitPrice(packageRecord)
      const recurringUnitPrice = getPackageRecurringMonthlyPrice(packageRecord)

      if (packageUnitPrice > 0 || recurringUnitPrice > 0) {
        const requiresReview = selectedOutcomes.some(outcomeNeedsReview)
        const line = createLineItem({
          category: roomToCategory[packageRecord.roomId] ?? 'General',
          description: buildAddOnPackageDescription(packageRecord, selectedOutcomes, language, requiresReview),
          grantEligible: selectedOutcomes.some((outcome) => outcome.grantEligible),
          id: `plans-addon-package-${packageRecord.id}`,
          name: localize(packageRecord.customerName, language, packageRecord.internalName),
          priority: requiresReview ? 'Medium' : 'High',
          quantity,
          sourcePackageId: packageRecord.id,
          unitPrice: packageUnitPrice,
        })
        lineItems.push(line)
        if (requiresReview) reviewItems.add(line.name)
        recurringMonthlyEstimate += recurringUnitPrice * quantity
        return
      }

      selectedOutcomes.forEach((outcome) => {
        const unitPrice = getOutcomeUnitPrice(outcome)
        const requiresReview = outcomeNeedsReview(outcome) || unitPrice <= 0
        const line = createLineItem({
          category: roomToCategory[outcome.roomId] ?? 'General',
          description: buildOutcomeDescription(packageRecord, outcome, language, requiresReview),
          grantEligible: outcome.grantEligible,
          id: `plans-addon-outcome-${outcome.id}`,
          name: localize(outcome.customerName, language, outcome.internalName),
          priority: requiresReview ? 'Medium' : 'High',
          quantity,
          sourceOutcomeId: outcome.id,
          sourcePackageId: packageRecord.id,
          unitPrice,
        })
        lineItems.push(line)
        if (requiresReview) reviewItems.add(line.name)
      })
    })
  })

  return {
    lineItems,
    oneTimeEstimate: lineItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0),
    recurringMonthlyEstimate,
    reviewItems: [...reviewItems],
    selectedPackageCount,
    selectedRoomQuantity,
  }
}

function getVisibleRoomGroups(catalogue) {
  return catalogue.rooms
    .filter((room) => room.active && roomPackageAreas.has(room.id))
    .sort(sortByOrder)
    .flatMap((room) => {
      const packages = catalogue.packages
        .filter((packageRecord) =>
          packageRecord.active
          && packageRecord.proposalVisible
          && packageRecord.websiteVisible
          && packageRecord.roomId === room.id,
        )
        .sort(sortByOrder)
      const homePackage = packages.find((packageRecord) => packageRecord.section === 'home-safety-package')

      if (!homePackage) return []

      return [{
        addOnPackages: packages
          .filter((packageRecord) => packageRecord.section !== 'home-safety-package')
          .map((packageRecord) => ({
            outcomes: getOutcomesForPackage(catalogue, packageRecord.id),
            packageRecord,
          }))
          .filter((group) => group.outcomes.length > 0),
        homeOutcomes: getOutcomesForPackage(catalogue, homePackage.id),
        homePackage,
        room,
      }]
    })
}

function getOutcomesForPackage(catalogue, packageId) {
  const relatedOutcomeIds = catalogue.relations
    .filter((relation) => relation.type === 'packageOutcome' && relation.fromId === packageId)
    .sort(sortByOrder)
    .map((relation) => relation.toId)

  return relatedOutcomeIds
    .map((outcomeId) => catalogue.outcomes.find((outcome) => outcome.id === outcomeId))
    .filter((outcome) => outcome?.active && outcome.proposalVisible && outcome.websiteVisible)
    .sort(sortByOrder)
}

function createLineItem(patch) {
  return {
    category: 'General',
    description: '',
    grant_eligible: false,
    grantEligible: false,
    id: `line-${Math.random().toString(36).slice(2, 10)}`,
    name: '',
    priority: 'Medium',
    quantity: 1,
    source: 'catalogue',
    unit_price: 0,
    unitPrice: 0,
    ...patch,
    grant_eligible: Boolean(patch.grantEligible),
    unit_price: safeMoney(patch.unitPrice),
  }
}

function getPackageConfig(catalogue, roomId) {
  return catalogue.packageConfigs.find((config) => config?.active && config.area === roomId)
}

function getPackageUnitPrice(packageRecord, config) {
  if (config?.active && config.pricingType !== 'quote_only') {
    return priceWithVat(config.pricingType === 'fixed' ? config.packagePrice : config.fromPrice, config.vatRate)
  }

  if (packageRecord.pricingType === 'fixed') return priceWithVat(packageRecord.fixedPrice, packageRecord.vatRate)
  if (packageRecord.pricingType === 'from' || packageRecord.pricingType === 'range') {
    return priceWithVat(packageRecord.fromPrice, packageRecord.vatRate)
  }

  return 0
}

function getPackageRecurringMonthlyPrice(packageRecord, config) {
  return priceWithVat(config?.recurringMonthlyPrice ?? packageRecord.recurringMonthlyPrice, config?.vatRate ?? packageRecord.vatRate)
}

function getOutcomeUnitPrice(outcome) {
  if (outcome.pricingType === 'fixed') return priceWithVat(outcome.fixedPrice, outcome.vatRate)
  if (outcome.pricingType === 'from' || outcome.pricingType === 'range') return priceWithVat(outcome.fromPrice, outcome.vatRate)
  return 0
}

function packageNeedsReview(packageRecord, unitPrice) {
  return Boolean(packageRecord.requiresQuote || packageRecord.pricingType === 'quote' || unitPrice <= 0)
}

function outcomeNeedsReview(outcome) {
  return Boolean(
    outcome.requiresQuote
    || outcome.requiresMeasurement
    || outcome.requiresSiteVisit
    || outcome.requiresCompatibilityCheck
    || outcome.pricingType === 'quote',
  )
}

function buildPackageDescription(packageRecord, outcomes, language, requiresReview) {
  const names = outcomes.map((outcome) => localize(outcome.customerName, language, outcome.internalName)).filter(Boolean)
  return [
    localize(packageRecord.shortDescription, language, packageRecord.internalName),
    names.length ? `${language === 'es' ? 'Incluye' : 'Includes'}: ${formatList(names, language)}.` : '',
    requiresReview ? reviewText(language) : '',
  ].filter(Boolean).join(' ')
}

function buildAddOnPackageDescription(packageRecord, outcomes, language, requiresReview) {
  const names = outcomes.map((outcome) => localize(outcome.customerName, language, outcome.internalName)).filter(Boolean)
  return [
    localize(packageRecord.shortDescription, language, packageRecord.internalName),
    names.length ? `${language === 'es' ? 'Seleccionado' : 'Selected'}: ${formatList(names, language)}.` : '',
    requiresReview ? compatibilityText(language) : '',
  ].filter(Boolean).join(' ')
}

function buildOutcomeDescription(packageRecord, outcome, language, requiresReview) {
  return [
    `${localize(packageRecord.customerName, language, packageRecord.internalName)}.`,
    localize(outcome.shortDescription, language, outcome.internalName),
    requiresReview ? reviewText(language) : '',
  ].filter(Boolean).join(' ')
}

function normaliseCatalogue(payload) {
  const masterCatalogue = payload?.masterCatalogue ?? payload
  if (
    !Array.isArray(masterCatalogue?.rooms)
    || !Array.isArray(masterCatalogue?.packages)
    || !Array.isArray(masterCatalogue?.outcomes)
    || !Array.isArray(masterCatalogue?.relations)
  ) {
    return null
  }

  return {
    ...masterCatalogue,
    packageConfigs: Array.isArray(payload?.packageConfigs) ? payload.packageConfigs : [],
  }
}

function normaliseCustomer(customer) {
  return {
    address: text(customer?.address),
    area: text(customer?.area),
    email: text(customer?.email).toLowerCase(),
    name: text(customer?.name),
    phone: text(customer?.phone),
  }
}

function normaliseSelection(selection) {
  const entries = Object.entries(selection && typeof selection === 'object' ? selection : {})
  return Object.fromEntries(entries.map(([packageId, value]) => [
    packageId,
    {
      addOnOutcomeIds: Array.isArray(value?.addOnOutcomeIds)
        ? value.addOnOutcomeIds.filter((id) => typeof id === 'string').slice(0, 30)
        : [],
      quantity: normaliseQuantity(value?.quantity),
      selected: value?.selected === true,
    },
  ]))
}

function proposalCopy(language) {
  return language === 'es'
    ? {
        grants: 'CasaMia puede orientar sobre documentación para ayudas cuando corresponda. La aprobación depende siempre de la autoridad correspondiente y no está garantizada.',
        paymentTerms: 'Propuesta generada a partir de los paquetes, cantidades y extras seleccionados. Los trabajos y pagos solo empiezan después de la aceptación y la coordinación de fecha.',
        summary: (estimate) =>
          `Propuesta creada desde Planes CasaMia con ${estimate.selectedRoomQuantity} paquete(s) de estancia. Los importes con precio se muestran con IVA incluido. Los extras marcados como presupuesto se confirman antes de iniciar el trabajo.`,
        timeline: 'CasaMia contacta contigo para coordinar fecha, acceso a la vivienda e instalación.',
        timelineDuration: 'A coordinar después de aceptar',
      }
    : {
        grants: 'CasaMia may support documentation for applicable grants. Approval is determined solely by the relevant authority and is not guaranteed.',
        paymentTerms: 'Proposal generated from the selected packages, quantities and add-ons. Work and payments only start after acceptance and date coordination.',
        summary: (estimate) =>
          `Proposal created from the CasaMia Plans builder with ${estimate.selectedRoomQuantity} room package(s). Priced items are shown VAT-included. Add-ons marked as quote items are confirmed before work starts.`,
        timeline: 'CasaMia will contact you to coordinate date, home access and installation.',
        timelineDuration: 'To be scheduled after acceptance',
      }
}

function hasHoneypotValue(body) {
  return Boolean(text(body?.companyWebsite) || text(body?.website))
}

function localize(value, language, fallback = '') {
  return language === 'es' ? value?.es ?? value?.en ?? fallback : value?.en ?? value?.es ?? fallback
}

function formatList(items, language) {
  const and = language === 'es' ? 'y' : 'and'
  if (items.length <= 2) return items.join(items.length === 2 ? ` ${and} ` : '')
  return `${items.slice(0, -1).join(', ')} ${and} ${items[items.length - 1]}`
}

function getLineName(label, language) {
  return /package|paquete/i.test(label) ? label : `${label} ${language === 'es' ? 'paquete' : 'package'}`
}

function reviewText(language) {
  return language === 'es'
    ? 'Precio confirmado antes de iniciar este extra.'
    : 'Price confirmed before this add-on starts.'
}

function compatibilityText(language) {
  return language === 'es'
    ? 'CasaMia confirmará compatibilidad y alcance antes de iniciar este extra.'
    : 'CasaMia will confirm compatibility and scope before this add-on starts.'
}

function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next.toISOString().slice(0, 10)
}

function createProposalId(date) {
  const compactDate = date.toISOString().slice(2, 10).replace(/-/g, '')
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `CM-${compactDate}-${suffix}`
}

function priceWithVat(value, vatRate) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric) || numeric <= 0) return 0
  return Math.round(numeric * (1 + Number(vatRate ?? 0)))
}

function normaliseQuantity(value) {
  const parsed = Number(value)
  return Math.max(1, Math.min(12, Math.floor(Number.isFinite(parsed) ? parsed : 1)))
}

function safeMoney(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 0
}

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function sortByOrder(left, right) {
  return (left.sortOrder ?? 0) - (right.sortOrder ?? 0)
}

function invalidResult(status, message) {
  return { ok: false, status, body: { message } }
}
