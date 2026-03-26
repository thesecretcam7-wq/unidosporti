import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://unidosporti.vercel.app'

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )
  const { data: { user } } = await client.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { euros } = await req.json()
  if (!euros || euros < 1) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: user.email,
    line_items: [{
      price_data: {
        currency: 'eur',
        unit_amount: Math.round(euros * 100),
        product_data: {
          name: 'Donación a UnidosPorTi',
          description: 'Tu apoyo ayuda a miles de migrantes en España',
        },
      },
      quantity: 1,
    }],
    metadata: { user_id: user.id, tipo: 'donacion', euros: String(euros) },
    success_url: `${APP_URL}/?donacion=gracias`,
    cancel_url: `${APP_URL}/?donacion=cancelada`,
  })

  return NextResponse.json({ url: session.url })
}
