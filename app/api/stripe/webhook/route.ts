import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.user_id
    const planB2b = session.metadata?.plan_b2b
    const orgId = session.metadata?.org_id

    if (planB2b && orgId) {
      // B2B checkout: update organizaciones table
      await adminClient.from('organizaciones').update({
        plan: planB2b,
        stripe_customer_id: session.customer as string,
      }).eq('id', orgId)
    } else if (userId) {
      // Regular user checkout
      await adminClient.from('profiles').update({
        plan: 'premium',
        stripe_customer_id: session.customer as string,
      }).eq('id', userId)
    }
  }

  if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.paused') {
    const sub = event.data.object as Stripe.Subscription
    const customerId = sub.customer as string
    await adminClient.from('profiles').update({ plan: 'free' }).eq('stripe_customer_id', customerId)
    await adminClient.from('organizaciones').update({ plan: 'free' }).eq('stripe_customer_id', customerId)
  }

  return NextResponse.json({ received: true })
}
