import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
try {
  const React = await import('react')
  const { renderToStaticMarkup } = await import('react-dom/server')
  const { StaticRouter } = await import('react-router-dom')
  const { default: i18n } = await server.ssrLoadModule('/src/i18n/index.ts')
  const { ProposalPreview } = await server.ssrLoadModule('/src/components/internal/ProposalPreview.tsx')
  const proposal = {
    id: 'CM-LANGUAGE-TEST', customerName: 'Customer test', address: 'Test only',
    selectedPlan: 'Home adaptations', overallRiskLevel: 'Moderate', safetyScore: '',
    executiveSummary: 'Test summary', status: 'Sent', acceptanceStatus: 'Sent',
    depositRate: 0.5, lineItems: [{ id: 'bathroom', name: 'Bathroom', category: 'Test',
      priority: 'High', quantity: 1, unitPrice: 749, grantEligible: false }],
  }
  for (const language of ['en', 'es']) {
    await i18n.changeLanguage(language)
    const html = renderToStaticMarkup(React.createElement(StaticRouter, { location: '/' },
      React.createElement(ProposalPreview, { proposal })))
    if (language === 'es') {
      for (const label of ['Propuesta de seguridad del hogar', 'Mejoras seleccionadas', 'Condiciones de pago', 'Aceptación del cliente', 'Moderado', 'Enviada', '749 €']) assert.ok(html.includes(label), label)
      assert.doesNotMatch(html, /Home Safety Proposal|Customer acceptance|Payment terms|Home adaptations/)
    } else {
      assert.match(html, /Home Safety Proposal/)
      assert.match(html, /Customer acceptance/)
      assert.match(html, /€749/)
    }
  }
  console.log('Proposal preview language checks passed in English and Spanish.')
} finally {
  await server.close()
}
