import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )

  const { data: { user } } = await client.auth.getUser()
  if (user?.email !== process.env.ADMIN_EMAIL)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const [{ data: empleos }, { data: viviendas }] = await Promise.all([
    client.from('empleos_usuarios').select('*').eq('status', 'pendiente').order('created_at'),
    client.from('viviendas_usuarios').select('*').eq('status', 'pendiente').order('created_at'),
  ])

  return NextResponse.json({ empleos: empleos ?? [], viviendas: viviendas ?? [] })
}
