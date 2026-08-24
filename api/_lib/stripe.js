import Stripe from 'stripe'

export class StripeConfigurationError extends Error {}

export function getStripeClient(env = process.env) {
  const secretKey = text(env.STRIPE_SECRET_KEY)

  if (!secretKey) {
    throw new StripeConfigurationError('Stripe is not configured. Add STRIPE_SECRET_KEY in Vercel.')
  }

  return new Stripe(secretKey, {
    maxNetworkRetries: 2,
    timeout: 15_000,
  })
}

export function getStripeWebhookSecret(env = process.env) {
  const secret = text(env.STRIPE_WEBHOOK_SECRET)

  if (!secret) {
    throw new StripeConfigurationError('Stripe webhooks are not configured. Add STRIPE_WEBHOOK_SECRET in Vercel.')
  }

  return secret
}

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}
