import PDFDocument from 'pdfkit'

export async function renderProposalPdf({ language = 'en', proposal, publicUrl = '' } = {}) {
  const isSpanish = String(language).toLowerCase().startsWith('es')
  const copy = getCopy(isSpanish)
  const doc = new PDFDocument({
    bufferPages: true,
    margin: 44,
    size: 'A4',
  })
  const chunks = []

  doc.on('data', (chunk) => chunks.push(chunk))

  const ready = new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
  })

  const lineItems = getLineItems(proposal)
  const reviewItems = getReviewItems(proposal, lineItems)
  const pricedItems = lineItems.filter((item) => !item.needsReview)
  const totals = getTotals(proposal, pricedItems)
  const customerName = text(proposal?.customer_name ?? proposal?.customerName) || copy.customerFallback

  drawHeader(doc, copy, proposal)

  doc
    .font('Times-Bold')
    .fontSize(30)
    .fillColor('#142235')
    .text(copy.title, 44, 110, { lineGap: 3, width: 330 })

  drawInfoBox(doc, copy, proposal, totals)

  doc
    .moveDown(1.3)
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor('#238bc6')
    .text(copy.preparedFor.toUpperCase(), { characterSpacing: 1.2 })
    .moveDown(0.4)
    .font('Helvetica-Bold')
    .fontSize(16)
    .fillColor('#142235')
    .text(customerName)
    .font('Helvetica')
    .fontSize(10)
    .fillColor('#4d6072')
    .text([proposal?.address, proposal?.area].map(text).filter(Boolean).join(', ') || copy.addressFallback)
    .text([proposal?.customer_phone ?? proposal?.phone, proposal?.customer_email ?? proposal?.email].map(text).filter(Boolean).join(' | '))

  drawSection(doc, copy.summaryTitle, text(proposal?.executive_summary ?? proposal?.executiveSummary) || copy.summaryFallback)
  drawServicePromise(doc, copy)

  drawLineItems(doc, copy.selectedWorks, pricedItems.length ? pricedItems : lineItems, false)

  if (reviewItems.length) {
    drawLineItems(doc, copy.reviewTitle, reviewItems, true)
    paragraph(doc, copy.reviewNote, { color: '#4d6072' })
  }

  drawSection(doc, copy.nextStepsTitle, copy.nextSteps)
  drawSection(doc, copy.paymentTitle, text(proposal?.payment_terms ?? proposal?.paymentTerms) || copy.paymentFallback)
  paragraph(doc, copy.noHiddenFees, { bold: true, color: '#65b934' })

  if (publicUrl) {
    drawSection(doc, copy.onlineTitle, `${copy.onlineBody}\n${publicUrl}`)
  }

  addPageNumbers(doc)
  doc.end()

  return ready
}

function drawHeader(doc, copy, proposal) {
  doc
    .font('Times-Bold')
    .fontSize(24)
    .fillColor('#102033')
    .text('Casa', 44, 42, { continued: true })
    .fillColor('#37a4dc')
    .text('Mia')

  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor('#65b934')
    .text(copy.kicker.toUpperCase(), 44, 76, { characterSpacing: 1.5 })

  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#4d6072')
    .text(`${copy.proposalId}: ${text(proposal?.id) || '-'}`, 380, 44, { align: 'right', width: 160 })
    .text(`${copy.date}: ${text(proposal?.proposal_date ?? proposal?.proposalDate) || '-'}`, 380, 60, { align: 'right', width: 160 })
    .text(`${copy.validUntil}: ${text(proposal?.valid_until ?? proposal?.validUntil) || '-'}`, 380, 76, { align: 'right', width: 160 })

  doc.moveTo(44, 96).lineTo(551, 96).strokeColor('#c9e1ef').lineWidth(1).stroke()
}

function drawInfoBox(doc, copy, proposal, totals) {
  const x = 370
  const y = 116
  const width = 181
  doc.roundedRect(x, y, width, 140, 10).fill('#1f6a93')

  infoRow(doc, copy.subtotal, formatEuro(totals.subtotal), x + 18, y + 20, width - 36)
  infoRow(doc, copy.deposit, formatEuro(totals.depositDue), x + 18, y + 46, width - 36)
  infoRow(doc, copy.balance, formatEuro(totals.balanceDue), x + 18, y + 72, width - 36)

  doc.moveTo(x + 18, y + 98).lineTo(x + width - 18, y + 98).strokeColor('#ffffff33').stroke()
  doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .fillColor('#ffffffaa')
    .text(copy.total.toUpperCase(), x + 18, y + 112)
    .font('Times-Bold')
    .fontSize(24)
    .fillColor('#ffffff')
    .text(formatEuro(totals.totalEstimate), x + 18, y + 124, { width: width - 36 })
    .font('Helvetica-Bold')
    .fontSize(8)
    .fillColor('#ffffffaa')
    .text(copy.vatIncluded, x + 18, y + 150)
}

function infoRow(doc, label, value, x, y, width) {
  doc
    .font('Helvetica-Bold')
    .fontSize(8)
    .fillColor('#ffffffaa')
    .text(label.toUpperCase(), x, y, { width: width * 0.58 })
    .fontSize(10)
    .fillColor('#ffffff')
    .text(value, x + width * 0.58, y, { align: 'right', width: width * 0.42 })
}

function drawServicePromise(doc, copy) {
  ensureRoom(doc, 90)
  const y = doc.y + 6
  doc.roundedRect(44, y, 507, 68, 10).fill('#eef7fb').strokeColor('#c9e1ef').stroke()
  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor('#0f5d8c')
    .text(copy.turnkeyTitle, 62, y + 16)
    .font('Helvetica')
    .fontSize(10)
    .fillColor('#4d6072')
    .text(copy.turnkeyBody, 62, y + 34, { lineGap: 2, width: 460 })
  doc.y = y + 86
}

function drawSection(doc, title, body) {
  ensureRoom(doc, 92)
  doc
    .moveDown(0.6)
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor('#0f5d8c')
    .text(title.toUpperCase(), { characterSpacing: 1.2 })
  paragraph(doc, body)
}

function paragraph(doc, body, options = {}) {
  doc
    .moveDown(0.3)
    .font(options.bold ? 'Helvetica-Bold' : 'Helvetica')
    .fontSize(10)
    .fillColor(options.color || '#4d6072')
    .text(body, { lineGap: 3, width: 500 })
}

function drawLineItems(doc, title, items, isReview) {
  ensureRoom(doc, 110)
  doc
    .moveDown(0.8)
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor(isReview ? '#9a5a00' : '#0f5d8c')
    .text(title.toUpperCase(), { characterSpacing: 1.2 })

  items.forEach((item) => {
    ensureRoom(doc, 72)
    const y = doc.y + 8
    doc.roundedRect(44, y, 507, 58, 8).fill(isReview ? '#fff7eb' : '#ffffff').strokeColor('#c9e1ef').stroke()
    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor('#142235')
      .text(`${item.quantity > 1 ? `${item.quantity}x ` : ''}${item.name}`, 60, y + 12, { width: 330 })
      .font('Helvetica')
      .fontSize(9)
      .fillColor('#4d6072')
      .text(item.description || item.category || '', 60, y + 29, { lineGap: 2, width: 360 })

    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor(isReview ? '#9a5a00' : '#142235')
      .text(isReview ? copyReviewLabel(item) : formatEuro(item.unitPrice * item.quantity), 420, y + 20, {
        align: 'right',
        width: 110,
      })

    doc.y = y + 62
  })
}

function copyReviewLabel(item) {
  return item.language === 'es' ? 'Revisar' : 'Review'
}

function addPageNumbers(doc) {
  const range = doc.bufferedPageRange()
  for (let i = range.start; i < range.start + range.count; i += 1) {
    doc.switchToPage(i)
    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('#8aa1b4')
      .text(`${i + 1} / ${range.count}`, 44, 810, { align: 'center', width: 507 })
  }
}

function ensureRoom(doc, height) {
  if (doc.y + height > 760) {
    doc.addPage()
    doc.y = 44
  }
}

function getLineItems(proposal) {
  const rawItems = Array.isArray(proposal?.line_items)
    ? proposal.line_items
    : Array.isArray(proposal?.lineItems)
      ? proposal.lineItems
      : []

  return rawItems.map((item) => {
    const unitPrice = number(item?.unit_price ?? item?.unitPrice)
    return {
      category: text(item?.category),
      description: text(item?.description),
      grantEligible: Boolean(item?.grant_eligible ?? item?.grantEligible),
      language: String(proposal?.plans_builder?.language ?? '').toLowerCase().startsWith('es') ? 'es' : 'en',
      name: text(item?.name) || 'CasaMia package',
      needsReview: unitPrice <= 0 || text(item?.priority).toLowerCase() === 'medium' && unitPrice <= 0,
      quantity: Math.max(1, Math.floor(number(item?.quantity) || 1)),
      unitPrice,
    }
  })
}

function getReviewItems(proposal, lineItems) {
  const metadataReviewItems = Array.isArray(proposal?.plans_builder?.review_items)
    ? proposal.plans_builder.review_items.map(text).filter(Boolean)
    : []
  const reviewNames = new Set(metadataReviewItems)
  lineItems.filter((item) => item.needsReview).forEach((item) => reviewNames.add(item.name))

  return [...reviewNames].map((name) => {
    const match = lineItems.find((item) => item.name === name)
    return match ? { ...match, needsReview: true } : { description: '', name, needsReview: true, quantity: 1, unitPrice: 0 }
  })
}

function getTotals(proposal, pricedItems) {
  const subtotal = number(proposal?.total_estimate ?? proposal?.total)
    || pricedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const depositDue = subtotal * 0.5

  return {
    balanceDue: Math.max(subtotal - depositDue, 0),
    depositDue,
    subtotal,
    totalEstimate: subtotal,
  }
}

function getCopy(isSpanish) {
  return isSpanish
    ? {
        addressFallback: 'Direccion de la vivienda',
        balance: 'Resto',
        customerFallback: 'Cliente CasaMia',
        date: 'Fecha',
        deposit: 'Deposito',
        kicker: 'Propuesta de seguridad del hogar',
        nextSteps:
          'Cuando aceptes el pedido, CasaMia contactara contigo para confirmar fecha, acceso a la vivienda, alcance final y proximos pasos de pago.',
        nextStepsTitle: 'Proximos pasos',
        noHiddenFees: 'Sin costes ocultos. No se inicia ningun trabajo sin aprobacion del cliente.',
        onlineBody: 'Tambien puedes ver la propuesta y pedir el paquete online aqui:',
        onlineTitle: 'Vista online',
        paymentFallback: '50% al aceptar la propuesta y 50% al finalizar, tras entrega y conformidad.',
        paymentTitle: 'Condiciones de pago',
        preparedFor: 'Preparado para',
        proposalId: 'Propuesta',
        reviewNote:
          'Estos extras no se suman al precio estimado. CasaMia pedira informacion adicional, confirmara medidas, idoneidad y precio, y no los anadira sin tu aprobacion.',
        reviewTitle: 'Extras que requieren revision',
        selectedWorks: 'Trabajos incluidos con precio',
        subtotal: 'Subtotal',
        summaryFallback: 'Propuesta creada con los paquetes y extras seleccionados en CasaMia.',
        summaryTitle: 'Resumen',
        title: 'Propuesta CasaMia',
        total: 'Total estimado',
        turnkeyBody:
          'CasaMia coordina la seleccion de productos, instalacion profesional, comprobacion, entrega y soporte posterior para que la familia no tenga que gestionar proveedores por separado.',
        turnkeyTitle: 'Servicio instalado llave en mano',
        validUntil: 'Valida hasta',
        vatIncluded: 'IVA incluido',
      }
    : {
        addressFallback: 'Customer address',
        balance: 'Balance due',
        customerFallback: 'CasaMia customer',
        date: 'Date',
        deposit: 'Deposit due',
        kicker: 'Home safety proposal',
        nextSteps:
          'When you order, CasaMia will contact you to confirm scheduling, home access, final scope and next payment steps.',
        nextStepsTitle: 'Next steps',
        noHiddenFees: 'No hidden fees. No work begins without customer approval.',
        onlineBody: 'You can also view the proposal and order online here:',
        onlineTitle: 'Online view',
        paymentFallback: '50% deposit on proposal acceptance and 50% on completion, handover and customer acceptance.',
        paymentTitle: 'Payment terms',
        preparedFor: 'Prepared for',
        proposalId: 'Proposal',
        reviewNote:
          'These extras are not added to the estimate. CasaMia will ask for the extra information needed to quote them, confirm measurements, suitability and price, and will not add them without your approval.',
        reviewTitle: 'Extras needing CasaMia review',
        selectedWorks: 'Priced works included',
        subtotal: 'Subtotal',
        summaryFallback: 'Proposal created from the selected CasaMia packages and add-ons.',
        summaryTitle: 'Summary',
        title: 'CasaMia proposal',
        total: 'Total estimate',
        turnkeyBody:
          'CasaMia coordinates product selection, professional installation, testing, handover and aftercare so the family does not have to manage separate providers.',
        turnkeyTitle: 'Installed turnkey service',
        validUntil: 'Valid until',
        vatIncluded: 'VAT included',
      }
}

function formatEuro(value) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return '-'
  return new Intl.NumberFormat('es-ES', {
    currency: 'EUR',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(parsed)
}

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function number(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}
