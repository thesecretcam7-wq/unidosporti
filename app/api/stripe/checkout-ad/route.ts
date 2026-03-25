import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://unidosporti.vercel.app'

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

  const { org_id, org_nombre, titulo, descripcion, cta, url, imagen_url, tipo_pantalla, duracion, precio, email } = await req.json()

  if (!org_id || !titulo || !descripcion || !url || !precio) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Pre-create the ad record in pending state
  const { data: ad, error: adError } = await adminClient.from('anuncios_nativos').insert({
    org_id,
    org_nombre,
    titulo,
    descripcion,
    cta: cta || 'Ver más',
    url,
    imagen_url: imagen_url || null,
    tipo_pantalla,
    duracion,
    precio_pagado: precio,
    status: 'pendiente',
    activo: false,
  }).select().single()

  if (adError || !ad) {
    return NextResponse.json({ error: 'Error creating ad record' }, { status: 500 })
  }

  const duracionLabel = duracion === 'semana' ? '1 semana' : duracion === 'mes' ? '1 mes' : '1 mes · todas las pantallas'
  const pantLabel = tipo_pantalla === 'todas' ? 'Todas las pantallas' : tipo_pantalla.charAt(0).toUpperCase() + tipo_pantalla.slice(1)

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: email || user.email,
    line_items: [{
      price_data: {
        currency: 'eur',
        unit_amount: precio * 100, // cents
        product_data: {
          name: `Publicidad segmentada — ${duracionLabel}`,
          description: `Pantalla: ${pantLabel} · "${titulo}" · ${org_nombre}`,
        },
      },
      quantity: 1,
    }],
    metadata: {
      ad_id: ad.id,
      org_id,
      tipo: 'ad_campaign',
      duracion,
      tipo_pantalla,
    },
    success_url: `${APP_URL}/?ad=success`,
    cancel_url: `${APP_URL}/?ad=cancel`,
  })

  return NextResponse.json({ url: session.url })
}
