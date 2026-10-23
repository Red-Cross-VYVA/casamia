import crypto from 'node:crypto'
import { callSupabaseRpc, createSupabaseRowIfAbsent, selectSupabaseRows, updateSupabaseRows } from './supabase.js'
import { getWhatsappConfiguration, normaliseWhatsappRecipient, sendWhatsappText } from './whatsapp.js'

const origin = 'https://www.casamia.com.es'
const supportedTypes = ['text', 'button', 'interactive', 'image', 'audio', 'video', 'document']

export function whatsappAutoRepliesEnabled(env = process.env) {
  return String(env.CASAMIA_WHATSAPP_AUTO_REPLY_ENABLED).trim() === 'true'
}

export function buildCasaMiaReply(message, conversation = {}) {
  const text = normalise(message.text)
  const language = detectLanguage(text, conversation.language)
  const es = language === 'es'
  const url = (path) => `${origin}${es ? '/es' : ''}${path}`
  const reply = (intent, body, extra = {}) => ({ intent, language, text: body, ...extra })
  const contact = es
    ? `Para hablar con el equipo, escribe a hola@casamia.com.es o solicita una llamada: ${url('/why-us#contact-form')}`
    : `To speak with the team, email hola@casamia.com.es or request a callback: ${url('/why-us#contact-form')}`

  if (/^(stop|unsubscribe|cancelar|baja|parar|no mas mensajes|no me escribas)[.!\s]*$/.test(text)) {
    return reply('stop', es
      ? 'CasaMia: las respuestas automáticas están desactivadas para este chat. Escribe INICIAR para volver a activarlas. Los avisos de informes o propuestas que solicites por separado no cambian.'
      : 'CasaMia: automatic replies are now off for this chat. Send START to turn them back on. Separately requested report or proposal notifications are unchanged.', { preference: 'Stopped' })
  }
  const resume = /^(start|resume|iniciar|reanudar)[.!\s]*$/.test(text)
  if (!resume && conversation.status === 'Stopped') return reply('muted', '')
  if (resume) return reply('welcome', welcome(es), { preference: 'Active' })

  if (/\b(emergenc\w*|unconscious|not breathing|cannot breathe|inconsciente|no respira|no puede respirar)\b/.test(text)) {
    return reply('emergency', es
      ? 'Este es el asistente automático de CasaMia y no es un servicio de emergencias. Si hay peligro inmediato o una urgencia médica en España, llama al 112. No esperes una respuesta por WhatsApp.'
      : 'This is CasaMia’s automatic assistant, not an emergency service. For immediate danger or a medical emergency in Spain, call 112. Do not wait for a WhatsApp reply.')
  }
  if (/^(5|team|equipo|human|persona|agent|agente)$/.test(text) || /\b(human|persona|agente|hablar con|speak to|speak with|complaint|queja|reclamacion)\b/.test(text)) {
    return reply('human', es
      ? `Tu solicitud queda guardada para el equipo de CasaMia. ${contact}\n\nLas respuestas automáticas quedan en pausa. Escribe INICIAR si deseas reactivarlas.`
      : `Your request is saved for the CasaMia team. ${contact}\n\nAutomatic replies are paused. Send START to resume them.`, { preference: 'Paused', handoff: true })
  }
  if (conversation.status === 'Paused') return reply('human_paused', '')
  if (!['text', 'button', 'interactive'].includes(message.type)) return reply('media', es
    ? `Soy el asistente automático de CasaMia. Por ahora puedo responder a mensajes escritos. Para revisar fotos de tu vivienda y recibir un informe gratuito: ${url('/#estimate-upload')}\n\n${contact}`
    : `I’m CasaMia’s automatic assistant. I can currently help with written messages. For a photo review and a free home-safety report: ${url('/#estimate-upload')}\n\n${contact}`)
  if (/^(6)$/.test(text) || /\b(grant\w*|subvencion\w*|ayudas|adapta)\b/.test(text)) return reply('grants', es
    ? `CasaMia puede orientarte sobre ayudas para adaptar la vivienda y la documentación necesaria. La disponibilidad y los requisitos dependen de cada convocatoria; no podemos confirmar la concesión por este chat. Consulta: ${url('/grants')}`
    : `CasaMia can guide you through home-adaptation grants and supporting documents. Availability and eligibility depend on the scheme; approval cannot be confirmed in this chat. See: ${url('/grants')}`)
  if (/^(3)$/.test(text) || /\b(report\w*|informe\w*|photo\w*|foto\w*|free|gratis|gratuito)\b/.test(text)) return reply('report', es
    ? `Puedes crear un informe gratuito de seguridad del hogar aquí: ${url('/#estimate-upload')}\nSube fotos de las zonas que te preocupan y selecciona WhatsApp para recibir el enlace. Si ya lo has solicitado, revisa el mensaje con tu enlace privado. ${contact}`
    : `Create a free home-safety report here: ${url('/#estimate-upload')}\nUpload photos of the areas that concern you and choose WhatsApp to receive the link. If you already requested one, check the message with your private report link. ${contact}`)
  if (/^(4)$/.test(text) || /\b(visit\w*|appointment\w*|book\w*|cita\w*|reserv\w*|inspection\w*|inspeccion\w*|assessment)\b/.test(text)) return reply('visit', es
    ? `Puedes consultar el precio actual y solicitar una visita de seguridad a domicilio aquí: ${url('/home-safety-assessment#assessment-form')}\nLa visita permite revisar medidas, superficies y necesidades antes de confirmar el trabajo. Este chat no confirma citas ni pagos.`
    : `See the current fee and request an in-home safety visit here: ${url('/home-safety-assessment#assessment-form')}\nThe visit checks measurements, surfaces and needs before work is confirmed. This chat does not confirm appointments or payments.`)
  if (/^(2)$/.test(text) || /\b(plan\w*|price\w*|cost\w*|quote\w*|proposal\w*|package\w*|precio\w*|cuanto|presupuesto\w*|propuesta\w*|paquete\w*|iva|vat)\b/.test(text)) return reply('plans', es
    ? `Consulta los paquetes, precios con IVA y prepara tu propuesta aquí: ${url('/plans')}\nLos extras o trabajos que necesitan medidas se confirman antes de empezar. Si ya tienes una propuesta, utiliza el enlace privado que recibiste; este chat no consulta tu pedido ni confirma pagos. ${contact}`
    : `See packages, VAT-inclusive prices and build your proposal here: ${url('/plans')}\nExtras and work requiring measurements are confirmed before work starts. If you already have a proposal, use the private link you received; this chat cannot look up orders or confirm payments. ${contact}`)
  if (/\b(area\w*|where|cover\w*|location|spain|espana|zona\w*|ciudad\w*|madrid|marbella|malaga|barcelona)\b/.test(text)) return reply('areas', es
    ? `CasaMia ofrece adaptaciones de seguridad del hogar en España, sujetas a disponibilidad local. Consulta las zonas y solicita confirmación para tu localidad: ${url('/service-areas')}`
    : `CasaMia offers home-safety adaptations in Spain, subject to local availability. Check service areas and request confirmation for your location: ${url('/service-areas')}`)
  if (/^(1)$/.test(text) || /\b(service\w*|bathroom\w*|bedroom\w*|kitchen\w*|stair\w*|grab bar\w*|home safety|servicio\w*|bano\w*|dormitorio\w*|cocina\w*|escalera\w*|barra\w*|seguridad|adapt\w*)\b/.test(text)) return reply('services', es
    ? `CasaMia ayuda a hacer la vivienda más segura y cómoda: baños, dormitorios, cocinas, escaleras, accesos y soluciones de seguridad conectada. Coordinamos la revisión, la propuesta y la instalación según las necesidades del hogar.\nServicios: ${url('/services')}\nInforme gratuito: ${url('/#estimate-upload')}\nEscribe 2 para precios, 4 para una visita o 5 para hablar con el equipo.`
    : `CasaMia helps make homes safer and more comfortable: bathrooms, bedrooms, kitchens, stairs, entrances and connected safety. We coordinate the review, proposal and installation around the home’s needs.\nServices: ${url('/services')}\nFree report: ${url('/#estimate-upload')}\nReply 2 for prices, 4 for a visit or 5 to speak with the team.`)
  if (/\b(thank\w*|gracias)\b/.test(text)) return reply('thanks', es
    ? '¡Gracias por contactar con CasaMia! Escribe MENÚ para ver las opciones o 5 para hablar con el equipo.'
    : 'Thank you for contacting CasaMia! Send MENU to see the options or 5 to speak with the team.')
  return reply('welcome', welcome(es))
}

function welcome(es) {
  return es
    ? '¡Hola! Soy el asistente automático de CasaMia. Ayudamos a adaptar viviendas en España para vivir con más seguridad.\n\nEscribe tu pregunta o elige:\n1 — Servicios\n2 — Precios y propuestas\n3 — Informe gratuito\n4 — Visita a domicilio\n5 — Hablar con el equipo\n6 — Ayudas y subvenciones\n\nPuedes escribir en español o inglés. Escribe BAJA para desactivar las respuestas automáticas.'
    : 'Hello! I’m CasaMia’s automatic assistant. We help adapt homes in Spain for safer living.\n\nAsk your question or choose:\n1 — Services\n2 — Prices and proposals\n3 — Free safety report\n4 — In-home visit\n5 — Speak with the team\n6 — Grants\n\nYou can write in English or Spanish. Send STOP to turn off automatic replies.'
}

function detectLanguage(text, previous) {
  if (/\b(english|ingles)\b/.test(text)) return 'en'
  if (/\b(espanol|spanish|castellano)\b/.test(text)) return 'es'
  const es = text.match(/\b(hola|buenas|buenos|quiero|necesito|podria|puedo|como|que|cuanto|tengo|donde|bano|seguridad|precio\w*|informe\w*|visita\w*|gracias|ayuda\w*|equipo|persona|baja|iniciar|subvencion\w*|propuesta\w*)\b/g)?.length || 0
  const en = text.match(/\b(hello|hi|hey|want|need|can|how|what|where|do|you|are|have|cover\w*|cost\w*|quote\w*|bathroom|safety|price\w*|report\w*|visit|thanks|help|team|human|stop|start|grant\w*|proposal\w*|book\w*)\b/g)?.length || 0
  return es > en ? 'es' : en > es ? 'en' : previous === 'en' ? 'en' : 'es'
}

function normalise(text) {
  return String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

function recordId(key) {
  const hash = crypto.createHash('sha256').update(`casamia-whatsapp:${key}`).digest('hex')
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-5${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`
}

export async function autoReplyToWhatsapp(message, dependencies = {}) {
  const env = dependencies.env ?? process.env
  if (!whatsappAutoRepliesEnabled(env)) return { status: 'disabled' }
  const config = getWhatsappConfiguration(env)
  const now = dependencies.now ?? Date.now()
  const at = Date.parse(message.at)
  if (!config.configured || message.phoneNumberId !== config.phoneNumberId
    || !supportedTypes.includes(message.type) || !message.messageId
    || !normaliseWhatsappRecipient(message.from) || message.from === normaliseWhatsappRecipient(env.WHATSAPP_PUBLIC_PHONE_NUMBER || '34608471713')
    || !Number.isFinite(at) || now - at >= 24 * 60 * 60 * 1_000 || at > now + 5 * 60 * 1_000) return { status: 'ignored' }

  const create = dependencies.create ?? createSupabaseRowIfAbsent
  const select = dependencies.select ?? selectSupabaseRows
  const update = dependencies.update ?? updateSupabaseRows
  const id = recordId(`${config.phoneNumberId}:${message.messageId}`)
  const conversationId = recordId(`conversation:${config.phoneNumberId}:${message.from}`)
  const payload = { messageId: message.messageId, phoneNumberId: config.phoneNumberId, receivedAt: message.at }
  // The existing private contact store provides durable IDs across Vercel instances.
  const claim = await create('contact_requests', {
    id, type: 'whatsapp_inbound', source: 'whatsapp', status: 'Queued',
    customer_name: String(message.contactName || '').slice(0, 180), customer_phone: message.from,
    message: message.text, payload_json: payload,
  })
  if (!claim.ok) throw new Error('WhatsApp inbound message could not be saved.')
  if (!Array.isArray(claim.body) || !claim.body.length) {
    const existing = await select('contact_requests', `id=eq.${id}&type=eq.whatsapp_inbound&select=status&limit=1`)
    if (!existing.ok) throw new Error('WhatsApp inbound reservation could not be loaded.')
    if (existing.body?.[0]?.status !== 'Queued') return { status: 'duplicate' }
  }

  const load = await select('contact_requests', `id=eq.${conversationId}&type=eq.whatsapp_conversation&select=status,payload_json&limit=1`)
  if (!load.ok) throw new Error('WhatsApp conversation could not be loaded.')
  const conversation = load.body?.[0]
  const reply = buildCasaMiaReply(message, { status: conversation?.status, language: conversation?.payload_json?.language })
  const reserved = await update('contact_requests', { status: 'Processing' }, `id=eq.${id}&type=eq.whatsapp_inbound&status=eq.Queued`)
  if (!reserved.ok) throw new Error('WhatsApp reply could not be reserved.')
  if (!reserved.body?.length) return { status: 'duplicate' }
  let sendAttempted = false
  try {
    const state = { payload_json: { language: reply.language }, ...(reply.preference ? { status: reply.preference } : {}) }
    const saved = conversation
      ? await update('contact_requests', state, `id=eq.${conversationId}&type=eq.whatsapp_conversation`)
      : await create('contact_requests', { id: conversationId, type: 'whatsapp_conversation', source: 'whatsapp', customer_phone: message.from, status: reply.preference || 'Active', payload_json: state.payload_json })
    if (!saved.ok) throw new Error('WhatsApp conversation preference could not be saved.')

    if (reply.handoff) {
      const handoff = await create('contact_requests', {
        id: recordId(`handoff:${message.messageId}`), type: 'callback_request', source: 'whatsapp', status: 'New',
        customer_name: String(message.contactName || '').slice(0, 180), customer_phone: message.from,
        message: message.text, payload_json: { locale: reply.language, note: message.text, source: 'whatsapp', preferredTimeWindow: 'Customer requested help via WhatsApp' },
      })
      if (!handoff.ok) throw new Error('WhatsApp team request could not be saved.')
    }
    if (reply.text) {
      const rate = await (dependencies.reserve ?? callSupabaseRpc)('reserve_public_request', {
        p_key_hash: crypto.createHmac('sha256', config.appSecret).update(`whatsapp-reply:${config.phoneNumberId}:${message.from}`).digest('hex'),
        p_limit: 20, p_window_seconds: 300,
      })
      if (!rate.ok) throw new Error('WhatsApp reply rate limit could not be checked.')
      if (rate.body !== true) reply.text = ''
    }
    sendAttempted = Boolean(reply.text)
    const result = reply.text
      ? await (dependencies.send ?? sendWhatsappText)({ to: message.from, text: reply.text, replyTo: message.messageId, env })
      : { ok: true, status: 'suppressed' }
    const recorded = await update('contact_requests', {
      status: result.ok ? result.status === 'suppressed' ? 'Suppressed' : 'Sent' : 'Failed',
      payload_json: { ...payload, language: reply.language, intent: reply.intent, reply: { status: result.status, messageId: result.messageId || '', reason: result.reason || '' } },
    }, `id=eq.${id}&type=eq.whatsapp_inbound`)
    if (!recorded.ok) console.error('[whatsapp-auto-reply] reply status could not be saved', { messageId: message.messageId })
    console.info('[whatsapp-auto-reply] result', { inboundMessageId: message.messageId, messageId: result.messageId, intent: reply.intent, language: reply.language, status: result.status })
    return { status: result.status, intent: reply.intent }
  } catch (error) {
    // Preparation failures can be retried by Meta. Once sending starts, an
    // ambiguous provider outcome must not create a duplicate customer message.
    await update('contact_requests', { status: sendAttempted ? 'Unconfirmed' : 'Queued' }, `id=eq.${id}&type=eq.whatsapp_inbound`)
    throw error
  }
}
