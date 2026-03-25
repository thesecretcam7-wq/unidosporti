import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: { user } } = await adminClient.auth.getUser(token)
  if (user?.email !== process.env.ADMIN_EMAIL)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, action } = await req.json()
  if (!id || !['aprobar', 'rechazar'].includes(action))
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 })

  const update = action === 'aprobar'
    ? { status: 'activo', activo: true }
    : { status: 'rechazado', activo: false }

  const { error } = await adminClient.from('anuncios_nativos').update(update).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
