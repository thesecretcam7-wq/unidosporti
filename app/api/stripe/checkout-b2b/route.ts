import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://unidosporti.vercel.app'

const PLANES_B2B: Record<string, string> = {
  basico: process.env.STRIPE_B2B_PRICE_BASICO!,
  estandar: process.env.STRIPE_B2B_PRICE_ESTANDAR!,
  premium: process.env.STRIPE_B2B_PRICE_PREMIUM!,
}

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data: { user } } = await adminClient.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan, email, org_id } = await req.json()
  const priceId = PLANES_B2B[plan]
  if (!priceId) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: email || user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { user_id: user.id, org_id, plan_b2b: plan },
    success_url: `${APP_URL}/?b2b=success&plan=${plan}`,
    cancel_url: `${APP_URL}/?b2b=cancel`,
  })

  return NextResponse.json({ url: session.url })
}
