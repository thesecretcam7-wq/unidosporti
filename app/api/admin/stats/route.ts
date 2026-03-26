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

  const hoy = new Date().toISOString().split('T')[0]

  const [
    { count: totalUsuarios },
    { count: activosHoy },
    { count: totalMensajes },
    { count: totalOrgs },
    { count: totalEmpleos },
    { count: totalViviendas },
  ] = await Promise.all([
    client.from('profiles').select('*', { count: 'exact', head: true }),
    client.from('chat_comunidad').select('*', { count: 'exact', head: true }).gte('created_at', hoy),
    client.from('chat_comunidad').select('*', { count: 'exact', head: true }),
    client.from('organizaciones').select('*', { count: 'exact', head: true }),
    client.from('empleos_usuarios').select('*', { count: 'exact', head: true }).eq('status', 'aprobado'),
    client.from('viviendas_usuarios').select('*', { count: 'exact', head: true }).eq('status', 'aprobado'),
  ])

  return NextResponse.json({
    totalUsuarios: totalUsuarios ?? 0,
    activosHoy: activosHoy ?? 0,
    totalMensajes: totalMensajes ?? 0,
    totalOrgs: totalOrgs ?? 0,
    totalEmpleos: totalEmpleos ?? 0,
    totalViviendas: totalViviendas ?? 0,
  })
}
