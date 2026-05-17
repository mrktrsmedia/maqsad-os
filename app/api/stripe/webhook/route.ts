import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import type Stripe from 'stripe'

// Safe lookup — avoids accidental '' key match when env vars are unset
function planFromPriceId(priceId: string): string {
  if (!priceId) return 'solo'
  if (priceId === process.env.STRIPE_SOLO_PRICE_ID) return 'solo'
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'pro'
  return 'solo'
}

async function handleSubscriptionUpdate(sub: Stripe.Subscription) {
  try {
    const supabase = await createAdminClient()
    const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
    const priceId = sub.items.data[0]?.price?.id ?? ''
    const plan = planFromPriceId(priceId)

    const { data: existing } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (!existing?.user_id) return

    await supabase.from('subscriptions').upsert({
      user_id: existing.user_id,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      plan,
      status: sub.status,
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    await supabase.from('profiles').update({ plan }).eq('id', existing.user_id)
  } catch (err) {
    console.error('[webhook] handleSubscriptionUpdate error:', err)
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET is not set')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const supabase = await createAdminClient()
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
        const { data: existing } = await supabase
          .from('subscriptions').select('user_id').eq('stripe_customer_id', customerId).single()
        if (existing?.user_id) {
          await supabase.from('subscriptions').update({ plan: 'free', status: 'canceled' }).eq('user_id', existing.user_id)
          await supabase.from('profiles').update({ plan: 'free' }).eq('id', existing.user_id)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const supabase = await createAdminClient()
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id
        if (customerId) {
          await supabase.from('subscriptions').update({ status: 'past_due' }).eq('stripe_customer_id', customerId)
        }
        break
      }

      default:
        // Unknown event type — acknowledge and move on
        break
    }
  } catch (err) {
    console.error('[webhook] Event handling error:', err)
    // Still return 200 so Stripe doesn't retry unnecessarily
  }

  return NextResponse.json({ received: true })
}
