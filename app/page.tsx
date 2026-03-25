'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: true, detectSessionInUrl: true, autoRefreshToken: true } }
)

type Pantalla = 'inicio' | 'empleo' | 'vivienda' | 'chat' | 'tramites' | 'perfil' | 'calculadora' | 'contrato' | 'nomina' | 'notificaciones' | 'admin' | 'publicar-empleo' | 'publicar-vivienda' | 'mis-publicaciones' | 'comunidad' | 'mensajes' | 'conversacion'
type Ruta = 'arraigo_social' | 'arraigo_laboral' | 'arraigo_familiar'
type Msg = { role: string; content: string }

const RUTAS = {
  arraigo_social: { nombre: 'Arraigo Social', tiempo: '6-9 meses', docs: ['3 años en España con padrón continuo', 'Precontrato de trabajo firmado', 'Sin antecedentes penales en España ni país de origen', 'Solicitar cita en extranjería'] },
  arraigo_laboral: { nombre: 'Arraigo Laboral', tiempo: '6-12 meses', docs: ['6 meses de trabajo demostrable en España', 'Informe vida laboral (SEPE)', 'Sin antecedentes penales', 'Solicitar cita en extranjería'] },
  arraigo_familiar: { nombre: 'Arraigo Familiar', tiempo: '2-4 meses', docs: ['Familiar directo español o residente legal', 'Certificado de parentesco apostillado', 'Sin antecedentes penales', 'Solicitar cita en extranjería'] },
} as const

const EMPLEOS = [
  { id:1, empresa:'Fincas del Sur', sector:'Agricultura', ciudad:'Murcia', salario:'1.250€', jornada:'Completa', arraigo:true, precontrato:true, nie:true, desc:'Se buscan recolectores de fruta. No se requiere experiencia previa.' },
  { id:2, empresa:'Reformas Madrid Centro', sector:'Construcción', ciudad:'Madrid', salario:'1.600€', jornada:'Completa', arraigo:true, precontrato:true, nie:false, desc:'Peones y oficiales de albañilería. Formación a cargo de la empresa.' },
  { id:3, empresa:'Hostal Mediterráneo', sector:'Hostelería', ciudad:'Valencia', salario:'1.100€', jornada:'Parcial', arraigo:true, precontrato:true, nie:true, desc:'Camareros y personal de cocina. Turno de mañana y tarde disponible.' },
  { id:4, empresa:'Limpieza Express BCN', sector:'Limpieza', ciudad:'Barcelona', salario:'950€', jornada:'Parcial', arraigo:true, precontrato:false, nie:true, desc:'Personal de limpieza para hoteles y oficinas. Horario flexible.' },
  { id:5, empresa:'LogiTrans Levante', sector:'Logística', ciudad:'Alicante', salario:'1.400€', jornada:'Completa', arraigo:false, precontrato:true, nie:false, desc:'Mozos de almacén y preparación de pedidos. Turno rotativo.' },
  { id:6, empresa:'Cuidados del Hogar SL', sector:'Cuidados', ciudad:'Sevilla', salario:'1.050€', jornada:'Completa', arraigo:true, precontrato:true, nie:true, desc:'Cuidadores de personas mayores con experiencia. Alojamiento incluido.' },
  { id:7, empresa:'Carrefour Zaragoza', sector:'Comercio', ciudad:'Zaragoza', salario:'1.200€', jornada:'Parcial', arraigo:true, precontrato:true, nie:true, desc:'Reponedores y cajeros para supermercado. Turnos rotativos.' },
  { id:8, empresa:'Cruz Roja - Proyecto Acogida', sector:'ONGs', ciudad:'Madrid', salario:'1.300€', jornada:'Completa', arraigo:true, precontrato:true, nie:true, desc:'Trabajador/a social para programas de integración de migrantes.' },
  { id:9, empresa:'Hotel Barceló Costa Brava', sector:'Hostelería', ciudad:'Girona', salario:'1.350€', jornada:'Completa', arraigo:true, precontrato:true, nie:false, desc:'Personal de pisos, recepción y restaurante. Temporada alta completa.' },
  { id:10, empresa:'FreshFarm Huelva', sector:'Agricultura', ciudad:'Huelva', salario:'1.150€', jornada:'Completa', arraigo:true, precontrato:true, nie:true, desc:'Recolección de fresas. Alojamiento disponible. Contrato de temporada.' },
  { id:11, empresa:'Construcciones Ruiz e Hijos', sector:'Construcción', ciudad:'Málaga', salario:'1.500€', jornada:'Completa', arraigo:true, precontrato:true, nie:false, desc:'Encofrador y oficiales de 1ª y 2ª. Obra en marcha todo el año.' },
  { id:12, empresa:'TeleMarketing Express', sector:'Servicios', ciudad:'Barcelona', salario:'1.050€', jornada:'Parcial', arraigo:true, precontrato:false, nie:true, desc:'Agentes de atención al cliente. Formación incluida. Idiomas valorados.' },
]

const VIVIENDAS = [
  { id:1, tipo:'Habitación', titulo:'Habitación en piso compartido', ciudad:'Madrid', barrio:'Vallecas', precio:350, fianza:1, sinNomina:true, extranjeros:true, m2:12, img:'🏠', desc:'Piso de 4 personas, cocina equipada, wifi incluido. Ambiente multicultural.' },
  { id:2, tipo:'Piso', titulo:'Estudio amueblado', ciudad:'Barcelona', barrio:'Nou Barris', precio:650, fianza:1, sinNomina:true, extranjeros:true, m2:35, img:'🏢', desc:'Estudio totalmente equipado. Aceptamos aval solidario en lugar de nómina.' },
  { id:3, tipo:'Habitación', titulo:'Habitación individual luminosa', ciudad:'Valencia', barrio:'Ruzafa', precio:280, fianza:1, sinNomina:true, extranjeros:true, m2:10, img:'🏠', desc:'Piso moderno. Se valora convivencia. Gastos incluidos.' },
  { id:4, tipo:'Piso', titulo:'Piso 2 habitaciones', ciudad:'Murcia', barrio:'Centro', precio:550, fianza:2, sinNomina:false, extranjeros:true, m2:65, img:'🏡', desc:'Piso céntrico bien comunicado. Se pide nómina o aval bancario.' },
  { id:5, tipo:'Habitación', titulo:'Habitación en casa familiar', ciudad:'Sevilla', barrio:'Triana', precio:300, fianza:1, sinNomina:true, extranjeros:true, m2:14, img:'🏘️', desc:'Casa familiar, ambiente tranquilo. Incluye desayuno. Ideal recién llegados.' },
  { id:6, tipo:'Piso', titulo:'Apartamento completo', ciudad:'Bilbao', barrio:'Deusto', precio:720, fianza:2, sinNomina:false, extranjeros:true, m2:55, img:'🏢', desc:'Apartamento moderno, garaje incluido. Aceptamos contratos temporales.' },
  { id:7, tipo:'Habitación', titulo:'Habitación acogedora con terraza', ciudad:'Madrid', barrio:'Carabanchel', precio:320, fianza:1, sinNomina:true, extranjeros:true, m2:11, img:'🏠', desc:'Terraza compartida, muy luminosa. Cerca del metro. Sin discriminación.' },
  { id:8, tipo:'Piso', titulo:'Piso entero pequeño', ciudad:'Zaragoza', barrio:'Las Fuentes', precio:480, fianza:1, sinNomina:true, extranjeros:true, m2:42, img:'🏢', desc:'Piso pequeño pero completo para una persona o pareja. Muy tranquilo.' },
  { id:9, tipo:'Habitación', titulo:'Habitación amplia con baño propio', ciudad:'Málaga', barrio:'Centro Histórico', precio:400, fianza:1, sinNomina:true, extranjeros:true, m2:18, img:'🏠', desc:'Baño privado incluido. Cocina equipada. Wi-Fi de alta velocidad.' },
  { id:10, tipo:'Piso', titulo:'Piso cerca de la playa', ciudad:'Valencia', barrio:'Nazaret', precio:600, fianza:1, sinNomina:true, extranjeros:true, m2:50, img:'🏡', desc:'A 10 minutos de la playa. Aceptamos extranjeros sin contrato indefinido.' },
  { id:11, tipo:'Habitación', titulo:'Habitación en piso internacional', ciudad:'Barcelona', barrio:'Hospitalet', precio:380, fianza:1, sinNomina:true, extranjeros:true, m2:13, img:'🏠', desc:'Piso de trabajadores internacionales. Muy buen ambiente multicultural.' },
  { id:12, tipo:'Piso', titulo:'Estudio con facturas incluidas', ciudad:'Alicante', barrio:'San Blas', precio:550, fianza:1, sinNomina:true, extranjeros:true, m2:38, img:'🏢', desc:'Luz, agua y gas incluidos. Sin sorpresas. Aceptamos NIE en trámite.' },
]

const NOTIFICACIONES_INIT = [
  { id:1, icono:'💼', titulo:'Nueva oferta en Madrid', desc:'Reformas Madrid Centro busca albañiles — 1.600€/mes, firma precontrato', tiempo:'Hace 2h', leida:false },
  { id:2, icono:'⚖️', titulo:'Cambio legal importante', desc:'Nuevo decreto facilita el arraigo laboral desde enero 2026', tiempo:'Hace 5h', leida:false },
  { id:3, icono:'🏠', titulo:'Nuevo piso disponible', desc:'Habitación en Madrid, Carabanchel — 320€/mes sin nómina', tiempo:'Hace 1d', leida:false },
  { id:4, icono:'📅', titulo:'Recuerda tu cita', desc:'Tienes una cita en extranjería el próximo lunes', tiempo:'Hace 2d', leida:true },
  { id:5, icono:'ℹ️', titulo:'Guía actualizada', desc:'Hemos actualizado la guía de apertura de cuenta bancaria para migrantes', tiempo:'Hace 3d', leida:true },
]

const SECTORES = ['Todos','Agricultura','Construcción','Hostelería','Limpieza','Logística','Cuidados','Comercio','ONGs','Servicios']
const CIUDADES_EMP = ['Todas','Madrid','Barcelona','Valencia','Murcia','Alicante','Sevilla','Zaragoza','Girona','Huelva','Málaga']
const CIUDADES_VIV = ['Todas','Madrid','Barcelona','Valencia','Murcia','Sevilla','Bilbao','Zaragoza','Málaga','Alicante']
const TIPOS_VIV = ['Todos','Habitación','Piso']
const PAISES = ['Venezuela','Colombia','Honduras','Ecuador','México','Bolivia','Paraguay','Uruguay','Perú','Argentina','Marruecos','Senegal','Nigeria','Rumania','Ucrania','China','Otro']
const SITUACIONES = ['Sin documentación','NIE en trámite','Arraigo en proceso','Residencia temporal','Residencia permanente','Ciudadanía española']
const ADMIN_EMAIL = 'thesecretcam7@gmail.com'

type ChatMsg = { id:string; user_id:string; user_email:string; nombre:string|null; mensaje:string; created_at:string }
type MensajePrivado = { id:string; from_user_id:string; from_nombre:string|null; from_email:string; to_user_id:string; to_nombre:string|null; to_email:string; mensaje:string; leido:boolean; created_at:string }
type ConvInfo = { user_id:string; nombre:string; email:string; ultimo_mensaje:string; ultimo_tiempo:string; no_leidos:number }
type DbEmpleo = { id:string; user_id:string; user_email:string; empresa:string; sector:string; ciudad:string; salario:string; jornada:string; arraigo:boolean; precontrato:boolean; nie:boolean; desc:string; contacto_tipo:string; contacto_whatsapp?:string; contacto_email?:string; status:string }
type DbVivienda = { id:string; user_id:string; user_email:string; tipo:string; titulo:string; ciudad:string; barrio:string; precio:number; fianza:number; sin_nomina:boolean; extranjeros:boolean; m2?:number; desc:string; contacto_tipo:string; contacto_whatsapp?:string; contacto_email?:string; status:string }
type FormEmpleo = { empresa:string; sector:string; ciudad:string; salario:string; jornada:string; arraigo:boolean; precontrato:boolean; nie:boolean; desc:string; contacto_tipo:string; contacto_whatsapp:string; contacto_email:string }
type FormVivienda = { tipo:string; titulo:string; ciudad:string; barrio:string; precio:string; fianza:string; sin_nomina:boolean; extranjeros:boolean; m2:string; desc:string; contacto_tipo:string; contacto_whatsapp:string; contacto_email:string }
const EMPTY_EMP: FormEmpleo = { empresa:'', sector:'Agricultura', ciudad:'', salario:'', jornada:'Completa', arraigo:false, precontrato:false, nie:false, desc:'', contacto_tipo:'ambos', contacto_whatsapp:'', contacto_email:'' }
const EMPTY_VIV: FormVivienda = { tipo:'Habitación', titulo:'', ciudad:'', barrio:'', precio:'', fianza:'1', sin_nomina:false, extranjeros:true, m2:'', desc:'', contacto_tipo:'ambos', contacto_whatsapp:'', contacto_email:'' }

function GoogleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.1-2.7-.4-4z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.8 18.9 13 24 13c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.2 0-9.5-3.3-11.2-7.9l-6.5 5C9.5 39.5 16.3 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.6 4.6-4.9 6l6.2 5.2C40.3 35.7 44 30.3 44 24c0-1.3-.1-2.7-.4-4z"/>
    </svg>
  )
}

function Badge({ text, color = 'blue' }: { text: string, color?: string }) {
  const colors: Record<string, { bg: string, txt: string }> = {
    green: { bg:'#dcfce7', txt:'#166534' }, blue: { bg:'#dbeafe', txt:'#1e40af' },
    orange: { bg:'#ffedd5', txt:'#9a3412' }, gray: { bg:'#f3f4f6', txt:'#374151' },
  }
  const c = colors[color] || colors.blue
  return <span style={{ fontSize:11, background:c.bg, color:c.txt, padding:'3px 8px', borderRadius:20, fontWeight:700, whiteSpace:'nowrap' as const }}>{text}</span>
}

const btn: React.CSSProperties = { width:'100%', background:'#1B4FCC', color:'#fff', border:'none', borderRadius:12, padding:'13px 0', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }

export default function Home() {
  const [pantalla, setPantalla] = useState<Pantalla>('inicio')
  const [userEmail, setUserEmail] = useState<string|null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [editNombre, setEditNombre] = useState('')
  const [editPais, setEditPais] = useState('')
  const [editCiudad, setEditCiudad] = useState('')
  const [editSituacion, setEditSituacion] = useState('')
  const [perfilGuardado, setPerfilGuardado] = useState(false)
  const [perfilLoading, setPerfilLoading] = useState(false)
  const [chat, setChat] = useState<Msg[]>([])
  const [msg, setMsg] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [ruta, setRuta] = useState<Ruta|null>(null)
  const [busqEmp, setBusqEmp] = useState('')
  const [sectorFilt, setSectorFilt] = useState('Todos')
  const [ciudadEmpFilt, setCiudadEmpFilt] = useState('Todas')
  const [soloArraigo, setSoloArraigo] = useState(false)
  const [soloPrecontrato, setSoloPrecontrato] = useState(false)
  const [busqViv, setBusqViv] = useState('')
  const [ciudadVivFilt, setCiudadVivFilt] = useState('Todas')
  const [tipoVivFilt, setTipoVivFilt] = useState('Todos')
  const [soloSinNomina, setSoloSinNomina] = useState(false)
  const [precioMax, setPrecioMax] = useState(1000)
  const [calcAnios, setCalcAnios] = useState(3)
  const [calcTrabajo, setCalcTrabajo] = useState(false)
  const [calcFamilia, setCalcFamilia] = useState(false)
  const [calcAntecedentes, setCalcAntecedentes] = useState(false)
  const [calcPadron, setCalcPadron] = useState(true)
  const [calcResult, setCalcResult] = useState<{tipo:string,prob:number,pasos:string[],color:string}|null>(null)
  const [contratoText, setContratoText] = useState('')
  const [contratoResult, setContratoResult] = useState('')
  const [contratoLoading, setContratoLoading] = useState(false)
  const [nominaText, setNominaText] = useState('')
  const [nominaResult, setNominaResult] = useState('')
  const [nominaLoading, setNominaLoading] = useState(false)
  const [notifs, setNotifs] = useState(NOTIFICACIONES_INIT)
  const notifCount = notifs.filter(n => !n.leida).length
  const [userId, setUserId] = useState<string|null>(null)
  const [dbEmpleos, setDbEmpleos] = useState<DbEmpleo[]>([])
  const [dbViviendas, setDbViviendas] = useState<DbVivienda[]>([])
  const [misEmpleos, setMisEmpleos] = useState<DbEmpleo[]>([])
  const [misViviendas, setMisViviendas] = useState<DbVivienda[]>([])
  const [pendienteEmpleos, setPendienteEmpleos] = useState<DbEmpleo[]>([])
  const [pendienteViviendas, setPendienteViviendas] = useState<DbVivienda[]>([])
  const [savingListing, setSavingListing] = useState(false)
  const [moderandoId, setModerandoId] = useState<string|null>(null)
  const [formEmp, setFormEmp] = useState<FormEmpleo>(EMPTY_EMP)
  const [formViv, setFormViv] = useState<FormVivienda>(EMPTY_VIV)
  const [comunidadMsgs, setComunidadMsgs] = useState<ChatMsg[]>([])
  const [comunidadMsg, setComunidadMsg] = useState('')
  const [comunidadSending, setComunidadSending] = useState(false)
  const comunidadBottomRef = useRef<HTMLDivElement>(null)
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState(0)
  const [conversaciones, setConversaciones] = useState<ConvInfo[]>([])
  const [convActiva, setConvActiva] = useState<{user_id:string; nombre:string; email:string}|null>(null)
  const [convMensajes, setConvMensajes] = useState<MensajePrivado[]>([])
  const [convMsg, setConvMsg] = useState('')
  const [convSending, setConvSending] = useState(false)
  const convBottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const email = data.session?.user?.email ?? null
      setUserEmail(email)
      if (data.session?.user) {
        setUserId(data.session.user.id)
        await loadProfile(data.session.user.id)
        await fetchDbListings(data.session.user.id)
        fetchMensajesNoLeidos(data.session.user.id)
      } else setSessionLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, session) => {
      setUserEmail(session?.user?.email ?? null)
      if (session?.user) {
        setUserId(session.user.id)
        await loadProfile(session.user.id)
        await fetchDbListings(session.user.id)
        fetchMensajesNoLeidos(session.user.id)
      } else {
        setUserId(null)
        setSessionLoading(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchDbListings(uid: string) {
    const [{ data: emp }, { data: viv }] = await Promise.all([
      supabase.from('empleos_usuarios').select('*').eq('status', 'aprobado').order('created_at', { ascending:false }),
      supabase.from('viviendas_usuarios').select('*').eq('status', 'aprobado').order('created_at', { ascending:false }),
    ])
    setDbEmpleos(emp ?? [])
    setDbViviendas(viv ?? [])
    const [{ data: mis_emp }, { data: mis_viv }] = await Promise.all([
      supabase.from('empleos_usuarios').select('*').eq('user_id', uid).order('created_at', { ascending:false }),
      supabase.from('viviendas_usuarios').select('*').eq('user_id', uid).order('created_at', { ascending:false }),
    ])
    setMisEmpleos(mis_emp ?? [])
    setMisViviendas(mis_viv ?? [])
  }

  async function publishEmpleo() {
    if (!formEmp.empresa.trim() || !formEmp.ciudad.trim() || !formEmp.salario.trim() || !formEmp.desc.trim()) return
    if (!userId || !userEmail) return
    setSavingListing(true)
    try {
      const { error } = await supabase.from('empleos_usuarios').insert({
        user_id: userId, user_email: userEmail,
        empresa: formEmp.empresa.trim(), sector: formEmp.sector, ciudad: formEmp.ciudad.trim(),
        salario: formEmp.salario.trim(), jornada: formEmp.jornada,
        arraigo: formEmp.arraigo, precontrato: formEmp.precontrato, nie: formEmp.nie,
        desc: formEmp.desc.trim(), contacto_tipo: formEmp.contacto_tipo,
        contacto_whatsapp: formEmp.contacto_whatsapp.trim() || null,
        contacto_email: formEmp.contacto_email.trim() || null,
        status: 'pendiente',
      })
      if (error) throw error
      setFormEmp(EMPTY_EMP)
      setPantalla('mis-publicaciones')
      await fetchDbListings(userId)
    } catch { alert('Error al publicar') }
    setSavingListing(false)
  }

  async function publishVivienda() {
    if (!formViv.titulo.trim() || !formViv.ciudad.trim() || !formViv.barrio.trim() || !formViv.desc.trim() || !formViv.precio) return
    if (!userId || !userEmail) return
    setSavingListing(true)
    try {
      const { error } = await supabase.from('viviendas_usuarios').insert({
        user_id: userId, user_email: userEmail,
        tipo: formViv.tipo, titulo: formViv.titulo.trim(),
        ciudad: formViv.ciudad.trim(), barrio: formViv.barrio.trim(),
        precio: Number(formViv.precio), fianza: Number(formViv.fianza),
        sin_nomina: formViv.sin_nomina, extranjeros: formViv.extranjeros,
        m2: formViv.m2 ? Number(formViv.m2) : null,
        desc: formViv.desc.trim(), contacto_tipo: formViv.contacto_tipo,
        contacto_whatsapp: formViv.contacto_whatsapp.trim() || null,
        contacto_email: formViv.contacto_email.trim() || null,
        status: 'pendiente',
      })
      if (error) throw error
      setFormViv(EMPTY_VIV)
      setPantalla('mis-publicaciones')
      await fetchDbListings(userId)
    } catch { alert('Error al publicar') }
    setSavingListing(false)
  }

  async function deleteMiEmpleo(id: string) {
    if (!confirm('¿Eliminar esta publicación?')) return
    await supabase.from('empleos_usuarios').delete().eq('id', id)
    if (userId) await fetchDbListings(userId)
  }

  async function deleteMiVivienda(id: string) {
    if (!confirm('¿Eliminar esta publicación?')) return
    await supabase.from('viviendas_usuarios').delete().eq('id', id)
    if (userId) await fetchDbListings(userId)
  }

  async function fetchPendientes() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const r = await fetch('/api/admin/pending', { headers: { authorization: `Bearer ${session.access_token}` } })
    if (!r.ok) return
    const d = await r.json()
    setPendienteEmpleos(d.empleos ?? [])
    setPendienteViviendas(d.viviendas ?? [])
  }

  async function moderate(table: string, id: string, action: 'aprobar' | 'rechazar') {
    setModerandoId(id)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    await fetch('/api/admin/moderate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ table, id, action }),
    })
    await fetchPendientes()
    if (userId) await fetchDbListings(userId)
    setModerandoId(null)
  }

  useEffect(() => {
    if (pantalla !== 'comunidad') return
    let channel: ReturnType<typeof supabase.channel> | null = null
    supabase.from('chat_comunidad').select('*').order('created_at', { ascending:true }).limit(80).then(({ data }) => {
      setComunidadMsgs(data ?? [])
      setTimeout(() => comunidadBottomRef.current?.scrollIntoView({ behavior:'smooth' }), 100)
    })
    channel = supabase.channel('chat_comunidad_rt').on('postgres_changes' as any, { event:'INSERT', schema:'public', table:'chat_comunidad' }, (payload: any) => {
      setComunidadMsgs(prev => [...prev, payload.new as ChatMsg])
      setTimeout(() => comunidadBottomRef.current?.scrollIntoView({ behavior:'smooth' }), 50)
    }).subscribe()
    return () => { if (channel) supabase.removeChannel(channel) }
  }, [pantalla])

  async function sendComunidad() {
    if (!comunidadMsg.trim() || comunidadSending || !userId || !userEmail) return
    setComunidadSending(true)
    const texto = comunidadMsg.trim()
    setComunidadMsg('')
    await supabase.from('chat_comunidad').insert({ user_id:userId, user_email:userEmail, nombre:editNombre||null, mensaje:texto })
    setComunidadSending(false)
  }

  async function fetchMensajesNoLeidos(uid: string) {
    const { count } = await supabase.from('mensajes_privados').select('*', { count:'exact', head:true }).eq('to_user_id', uid).eq('leido', false)
    setMensajesNoLeidos(count ?? 0)
  }

  async function fetchConversaciones(uid: string) {
    const { data } = await supabase.from('mensajes_privados').select('*').or(`from_user_id.eq.${uid},to_user_id.eq.${uid}`).order('created_at', { ascending:false })
    if (!data) return
    const map = new Map<string, ConvInfo>()
    data.forEach(m => {
      const otherId = m.from_user_id === uid ? m.to_user_id : m.from_user_id
      const otherNombre = m.from_user_id === uid ? (m.to_nombre || m.to_email.split('@')[0]) : (m.from_nombre || m.from_email.split('@')[0])
      const otherEmail = m.from_user_id === uid ? m.to_email : m.from_email
      if (!map.has(otherId)) {
        map.set(otherId, { user_id:otherId, nombre:otherNombre, email:otherEmail, ultimo_mensaje:m.mensaje, ultimo_tiempo:m.created_at, no_leidos:(!m.leido && m.to_user_id===uid) ? 1 : 0 })
      } else {
        const c = map.get(otherId)!
        if (!m.leido && m.to_user_id===uid) c.no_leidos++
      }
    })
    setConversaciones(Array.from(map.values()))
  }

  async function fetchConversacion(uid: string, otherId: string) {
    const { data } = await supabase.from('mensajes_privados').select('*')
      .or(`and(from_user_id.eq.${uid},to_user_id.eq.${otherId}),and(from_user_id.eq.${otherId},to_user_id.eq.${uid})`)
      .order('created_at', { ascending:true })
    setConvMensajes(data ?? [])
    await supabase.from('mensajes_privados').update({ leido:true }).eq('to_user_id', uid).eq('from_user_id', otherId).eq('leido', false)
    fetchMensajesNoLeidos(uid)
    setTimeout(() => convBottomRef.current?.scrollIntoView({ behavior:'smooth' }), 100)
  }

  async function sendMensajePrivado() {
    if (!convMsg.trim() || convSending || !userId || !userEmail || !convActiva) return
    setConvSending(true)
    const texto = convMsg.trim()
    setConvMsg('')
    await supabase.from('mensajes_privados').insert({ from_user_id:userId, from_nombre:editNombre||null, from_email:userEmail, to_user_id:convActiva.user_id, to_nombre:convActiva.nombre, to_email:convActiva.email, mensaje:texto, leido:false })
    await fetchConversacion(userId, convActiva.user_id)
    setConvSending(false)
  }

  function abrirConversacion(otro: {user_id:string; nombre:string; email:string}) {
    setConvActiva(otro)
    setPantalla('conversacion')
    if (userId) fetchConversacion(userId, otro.user_id)
  }

  useEffect(() => {
    if (!userId) return
    if (pantalla === 'mensajes') fetchConversaciones(userId)
    if (pantalla === 'conversacion' && convActiva) fetchConversacion(userId, convActiva.user_id)
  }, [pantalla])

  async function loadProfile(userId: string) {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
      if (data) { setEditNombre(data.nombre||''); setEditPais(data.pais||''); setEditCiudad(data.ciudad||''); setEditSituacion(data.situacion||'') }
    } catch {}
    setSessionLoading(false)
  }

  async function saveProfile() {
    setPerfilLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('profiles').upsert({ id:user.id, email:user.email, nombre:editNombre, pais:editPais, ciudad:editCiudad, situacion:editSituacion, updated_at:new Date().toISOString() })
      setPerfilGuardado(true); setTimeout(() => setPerfilGuardado(false), 3000)
    } catch {}
    setPerfilLoading(false)
  }

  async function loginGoogle() {
    setAuthLoading(true)
    await supabase.auth.signInWithOAuth({ provider:'google', options:{ redirectTo:'https://unidosporti.vercel.app' } })
    setAuthLoading(false)
  }

  async function logout() { await supabase.auth.signOut(); setPantalla('inicio') }

  async function send() {
    if (!msg.trim() || chatLoading) return
    const nc = [...chat, { role:'user', content:msg }]
    setChat(nc); setMsg(''); setChatLoading(true)
    try {
      const r = await fetch('/api/chat', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ messages:nc }) })
      const d = await r.json()
      setChat([...nc, { role:'assistant', content:d.content }])
    } catch { setChat([...nc, { role:'assistant', content:'Error al conectar.' }]) }
    setChatLoading(false)
  }

  async function analizarContrato() {
    if (!contratoText.trim()) return
    setContratoLoading(true)
    try {
      const r = await fetch('/api/contrato', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ texto:contratoText }) })
      const d = await r.json(); setContratoResult(d.content)
    } catch { setContratoResult('Error al analizar.') }
    setContratoLoading(false)
  }

  async function analizarNomina() {
    if (!nominaText.trim()) return
    setNominaLoading(true)
    try {
      const r = await fetch('/api/nomina', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ texto:nominaText }) })
      const d = await r.json(); setNominaResult(d.content)
    } catch { setNominaResult('Error al analizar.') }
    setNominaLoading(false)
  }

  function calcularArraigo() {
    if (calcAntecedentes) { setCalcResult({ tipo:'Situación compleja', prob:20, color:'red', pasos:['Los antecedentes dificultan la regularización','Consulta con un abogado especialista','Contacta con CEAR o Cruz Roja para asesoría gratuita'] }); return }
    if (calcFamilia) { setCalcResult({ tipo:'Arraigo Familiar', prob:90, color:'green', pasos:['Certificado de parentesco apostillado','Documentos del familiar español o residente','Solicitar cita en extranjería — Espera: 2-4 meses'] }); return }
    if (calcAnios >= 3 && calcTrabajo && calcPadron) { setCalcResult({ tipo:'Arraigo Social', prob:82, color:'green', pasos:['Padrón continuo (3 años)','Precontrato de trabajo firmado','Antecedentes penales apostillados','Cita en extranjería — Espera: 6-9 meses'] }); return }
    if (calcAnios >= 0.5 && calcTrabajo) { setCalcResult({ tipo:'Arraigo Laboral', prob:68, color:'blue', pasos:['Informe vida laboral (SEPE)','Pruebas de relación laboral','Antecedentes penales apostillados','Cita en extranjería — Espera: 6-12 meses'] }); return }
    if (calcAnios >= 2 && calcPadron) { setCalcResult({ tipo:'Arraigo Social (en proceso)', prob:45, color:'orange', pasos:['Te faltan algunos requisitos','Busca empresa que firme precontrato','Mantén el padrón actualizado cada año'] }); return }
    setCalcResult({ tipo:'Sin arraigo inmediato', prob:15, color:'red', pasos:['Empadrónate cuanto antes','Busca trabajo con empresa que firme precontrato','Contacta con una ONG para apoyo y asesoría'] })
  }

  const empleosFiltrados = EMPLEOS.filter(e => {
    const q = busqEmp.toLowerCase()
    return (!q || e.empresa.toLowerCase().includes(q) || e.sector.toLowerCase().includes(q) || e.ciudad.toLowerCase().includes(q))
      && (sectorFilt==='Todos'||e.sector===sectorFilt) && (ciudadEmpFilt==='Todas'||e.ciudad===ciudadEmpFilt)
      && (!soloArraigo||e.arraigo) && (!soloPrecontrato||e.precontrato)
  })

  const viviendasFiltradas = VIVIENDAS.filter(v => {
    const q = busqViv.toLowerCase()
    return (!q || v.titulo.toLowerCase().includes(q) || v.ciudad.toLowerCase().includes(q) || v.barrio.toLowerCase().includes(q))
      && (ciudadVivFilt==='Todas'||v.ciudad===ciudadVivFilt) && (tipoVivFilt==='Todos'||v.tipo===tipoVivFilt)
      && (!soloSinNomina||v.sinNomina) && v.precio<=precioMax
  })

  const dbEmpleosFiltrados = dbEmpleos.filter(e => {
    const q = busqEmp.toLowerCase()
    return (!q || e.empresa.toLowerCase().includes(q) || e.sector.toLowerCase().includes(q) || e.ciudad.toLowerCase().includes(q))
      && (sectorFilt==='Todos'||e.sector===sectorFilt) && (ciudadEmpFilt==='Todas'||e.ciudad===ciudadEmpFilt)
      && (!soloArraigo||e.arraigo) && (!soloPrecontrato||e.precontrato)
  })

  const dbViviendosFiltradas = dbViviendas.filter(v => {
    const q = busqViv.toLowerCase()
    return (!q || v.titulo.toLowerCase().includes(q) || v.ciudad.toLowerCase().includes(q) || v.barrio.toLowerCase().includes(q))
      && (ciudadVivFilt==='Todas'||v.ciudad===ciudadVivFilt) && (tipoVivFilt==='Todos'||v.tipo===tipoVivFilt)
      && (!soloSinNomina||v.sin_nomina) && v.precio<=precioMax
  })

  const wrap: React.CSSProperties = { maxWidth:480, margin:'0 auto', height:'100dvh', display:'flex', flexDirection:'column', background:'#f8f9ff' }

  if (sessionLoading) return (
    <div style={{ ...wrap, alignItems:'center', justifyContent:'center' }}>
      <img src="/logo.png" alt="UnidosPorTi" style={{ width:120, height:120, objectFit:'contain', marginBottom:16 }} />
      <p style={{ color:'#9ca3af', fontSize:14 }}>Cargando...</p>
    </div>
  );

  if (!userEmail) return (
    <div style={{ ...wrap, overflowY:'auto', background:'#f0f4ff' }}>
      <div style={{ background:'linear-gradient(160deg,#1B4FCC 0%,#1e3a8a 100%)', padding:'44px 24px 32px', display:'flex', flexDirection:'column', alignItems:'center', gap:14, textAlign:'center' }}>
        <img src="/logo.png" alt="UnidosPorTi" style={{ width:160, height:160, objectFit:'contain' }} />
        <div>
          <p style={{ fontSize:17, color:'rgba(255,255,255,0.95)', margin:'0 0 8px', fontWeight:700 }}>Tu guía para vivir mejor en España 🇪🇸</p>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.75)', margin:0, lineHeight:1.6, maxWidth:300 }}>No importa si llevas un mes o tres años — estamos aquí para ayudarte</p>
        </div>
      </div>
      <div style={{ padding:'20px 18px 32px', display:'flex', flexDirection:'column', gap:11 }}>
        {[
          { icon:'📄', title:'Regulariza tu situación', desc:'Arraigo social, laboral y familiar — paso a paso', color:'#eff6ff', border:'#bfdbfe' },
          { icon:'💼', title:'Trabajo para migrantes', desc:'Arraigo, precontrato, NIE en trámite — sin discriminación', color:'#f0fdf4', border:'#bbf7d0' },
          { icon:'🏠', title:'Vivienda sin barreras', desc:'Sin nómina, sin aval, sin discriminación', color:'#fefce8', border:'#fde68a' },
          { icon:'🤖', title:'Asistente IA 24/7', desc:'Resuelve tus dudas legales, laborales y de vivienda', color:'#fdf4ff', border:'#e9d5ff' },
          { icon:'🧮', title:'Calculadora de arraigo', desc:'Descubre qué tipo de regularización puedes pedir', color:'#fff7ed', border:'#fed7aa' },
          { icon:'📋', title:'Analiza tu contrato con IA', desc:'Detecta cláusulas abusivas antes de firmar', color:'#f0fdf4', border:'#bbf7d0' },
        ].map(({ icon, title, desc, color, border }) => (
          <div key={title} style={{ background:color, border:`1px solid ${border}`, borderRadius:16, padding:'13px 15px', display:'flex', gap:13, alignItems:'flex-start' }}>
            <span style={{ fontSize:24, flexShrink:0, marginTop:1 }}>{icon}</span>
            <div>
              <p style={{ fontWeight:700, fontSize:14, color:'#111', margin:'0 0 2px' }}>{title}</p>
              <p style={{ fontSize:12, color:'#6b7280', margin:0, lineHeight:1.5 }}>{desc}</p>
            </div>
          </div>
        ))}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginTop:2 }}>
          {[{ n:'100%', label:'Gratis' },{ n:'24/7', label:'Disponible' },{ n:'0€', label:'Sin coste' }].map(({ n, label }) => (
            <div key={label} style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, padding:'12px 6px', textAlign:'center' }}>
              <p style={{ fontSize:18, fontWeight:900, color:'#1B4FCC', margin:'0 0 2px' }}>{n}</p>
              <p style={{ fontSize:11, color:'#6b7280', margin:0 }}>{label}</p>
            </div>
          ))}
        </div>
        <button onClick={loginGoogle} disabled={authLoading} style={{ width:'100%', marginTop:6, background:'#fff', color:'#111', border:'2px solid #e5e7eb', borderRadius:16, padding:'16px 0', fontSize:16, fontWeight:700, cursor:authLoading?'wait':'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:12, opacity:authLoading?0.7:1, boxShadow:'0 4px 20px rgba(27,79,204,0.15)' }}>
          <GoogleIcon />
          {authLoading ? 'Redirigiendo...' : 'Empezar gratis con Google'}
        </button>
        <p style={{ fontSize:11, color:'#9ca3af', textAlign:'center', margin:'2px 0 0' }}>Sin tarjeta · Sin publicidad · Tus datos protegidos</p>
      </div>
    </div>
  );

  return (
    <div style={wrap}>
      <header style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <img src="/logo.png" alt="UnidosPorTi" style={{ width:56, height:56, objectFit:'contain' }} />
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button onClick={() => setPantalla('mensajes')} style={{ background:'none', border:'none', cursor:'pointer', position:'relative' as const, padding:4 }}>
            <span style={{ fontSize:20 }}>✉️</span>
            {mensajesNoLeidos > 0 && <span style={{ position:'absolute' as const, top:0, right:0, background:'#7c3aed', color:'#fff', borderRadius:'50%', width:16, height:16, fontSize:10, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>{mensajesNoLeidos}</span>}
          </button>
          <button onClick={() => setPantalla('notificaciones')} style={{ background:'none', border:'none', cursor:'pointer', position:'relative' as const, padding:4 }}>
            <span style={{ fontSize:20 }}>🔔</span>
            {notifCount > 0 && <span style={{ position:'absolute' as const, top:0, right:0, background:'#ef4444', color:'#fff', borderRadius:'50%', width:16, height:16, fontSize:10, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>{notifCount}</span>}
          </button>
          <button onClick={() => setPantalla('perfil')} style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:20, padding:'5px 10px', cursor:'pointer', fontSize:12, fontWeight:700, color:'#1e40af', fontFamily:'inherit' }}>
            👤 {editNombre ? editNombre.split(' ')[0] : 'Perfil'}
          </button>
          <button onClick={logout} style={{ fontSize:12, background:'#f3f4f6', border:'none', borderRadius:20, padding:'5px 10px', cursor:'pointer', color:'#374151', fontFamily:'inherit' }}>Salir</button>
        </div>
      </header>

      <div style={{ flex:1, overflowY:'auto', paddingBottom:72 }}>

        {pantalla === 'inicio' && (
          <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ background:'linear-gradient(135deg,#1B4FCC,#2563eb)', borderRadius:20, padding:'20px 24px', color:'#fff' }}>
              <p style={{ fontSize:12, opacity:0.8, margin:'0 0 2px' }}>Hola {editNombre ? `${editNombre.split(' ')[0]} 👋` : '👋'}</p>
              <h1 style={{ fontSize:22, fontWeight:800, margin:'0 0 4px' }}>¿En qué te ayudamos hoy?</h1>
              <p style={{ fontSize:13, opacity:0.85, margin:0 }}>Todo lo que necesitas para vivir mejor en España</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { id:'empleo', icon:'💼', label:'Trabajo', sub:`${EMPLEOS.length} ofertas activas`, color:'#f0fdf4', border:'#bbf7d0', badge:'Nuevo' },
                { id:'vivienda', icon:'🏠', label:'Vivienda', sub:`${VIVIENDAS.length} opciones`, color:'#fefce8', border:'#fde68a', badge:'Nuevo' },
                { id:'chat', icon:'🤖', label:'Chat IA', sub:'Dudas al instante', color:'#eff6ff', border:'#bfdbfe', badge:'' },
                { id:'tramites', icon:'📋', label:'Trámites', sub:'Arraigo y papeles', color:'#fdf4ff', border:'#e9d5ff', badge:'' },
              ].map(({ id, icon, label, sub, color, border, badge }) => (
                <button key={id} onClick={() => setPantalla(id as Pantalla)} style={{ background:color, border:`1px solid ${border}`, borderRadius:18, padding:'16px 14px', textAlign:'left', cursor:'pointer', fontFamily:'inherit', position:'relative' as const }}>
                  {badge && <span style={{ position:'absolute' as const, top:10, right:10, fontSize:9, background:'#1B4FCC', color:'#fff', padding:'2px 6px', borderRadius:10, fontWeight:700 }}>{badge}</span>}
                  <div style={{ fontSize:28, marginBottom:6 }}>{icon}</div>
                  <p style={{ fontWeight:700, fontSize:15, margin:'0 0 2px', color:'#111' }}>{label}</p>
                  <p style={{ fontSize:11, color:'#6b7280', margin:0 }}>{sub}</p>
                </button>
              ))}
            </div>
            <div>
              <p style={{ fontSize:13, fontWeight:700, color:'#374151', margin:'0 0 8px' }}>🧠 Herramientas con IA</p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[
                  { id:'calculadora', icon:'🧮', label:'Calculadora de Arraigo', desc:'¿Puedes regularizarte ya?', color:'#fff7ed', border:'#fed7aa' },
                  { id:'contrato', icon:'📄', label:'Analiza tu Contrato', desc:'Detecta cláusulas abusivas', color:'#f0fdf4', border:'#bbf7d0' },
                  { id:'nomina', icon:'💰', label:'Explica tu Nómina', desc:'Entiende cada línea del recibo', color:'#eff6ff', border:'#bfdbfe' },
                ].map(({ id, icon, label, desc, color, border }) => (
                  <button key={id} onClick={() => setPantalla(id as Pantalla)} style={{ background:color, border:`1px solid ${border}`, borderRadius:14, padding:'12px 14px', textAlign:'left', cursor:'pointer', fontFamily:'inherit', display:'flex', gap:12, alignItems:'center' }}>
                    <span style={{ fontSize:22 }}>{icon}</span>
                    <div style={{ flex:1 }}>
                      <p style={{ fontWeight:700, fontSize:14, color:'#111', margin:0 }}>{label}</p>
                      <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>{desc}</p>
                    </div>
                    <span style={{ color:'#9ca3af', fontSize:16 }}>→</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:16, padding:16 }}>
              <p style={{ fontSize:13, fontWeight:700, color:'#92400e', margin:'0 0 10px' }}>⚖️ ¿Cuál es tu situación legal?</p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {(Object.keys(RUTAS) as Ruta[]).map(key => (
                  <button key={key} onClick={() => { setRuta(key); setPantalla('tramites') }} style={{ background:'#fff', border:'1px solid #fde68a', borderRadius:12, padding:'11px 14px', textAlign:'left', cursor:'pointer', fontSize:14, fontFamily:'inherit', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontWeight:600, color:'#111' }}>{RUTAS[key].nombre}</span>
                    <span style={{ color:'#92400e', fontSize:12, fontWeight:600 }}>⏱ {RUTAS[key].tiempo}</span>
                  </button>
                ))}
              </div>
            </div>
            {userEmail === ADMIN_EMAIL && (
              <button onClick={() => setPantalla('admin')} style={{ background:'#1e1b4b', border:'none', borderRadius:14, padding:'12px 16px', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:10, textAlign:'left' as const }}>
                <span style={{ fontSize:20 }}>⚙️</span>
                <div>
                  <p style={{ fontWeight:700, fontSize:14, color:'#e0e7ff', margin:0 }}>Panel de Administración</p>
                  <p style={{ fontSize:11, color:'#a5b4fc', margin:0 }}>Estadísticas, ONGs y gestión</p>
                </div>
              </button>
            )}
          </div>
        )}

        {pantalla === 'perfil' && (
          <div style={{ padding:16, display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ background:'linear-gradient(135deg,#1B4FCC,#2563eb)', borderRadius:20, padding:'24px', textAlign:'center', color:'#fff' }}>
              <div style={{ width:64, height:64, background:'rgba(255,255,255,0.2)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', fontSize:32 }}>👤</div>
              <p style={{ fontWeight:800, fontSize:18, margin:'0 0 4px' }}>{editNombre || 'Mi Perfil'}</p>
              <p style={{ fontSize:13, opacity:0.8, margin:0 }}>{userEmail}</p>
            </div>
            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:16, display:'flex', flexDirection:'column', gap:14 }}>
              <p style={{ fontWeight:700, fontSize:15, margin:0, color:'#111' }}>Mis datos</p>
              {[
                { label:'Nombre completo', val:editNombre, set:setEditNombre, ph:'Tu nombre completo' },
                { label:'Ciudad actual en España', val:editCiudad, set:setEditCiudad, ph:'Ej: Madrid, Barcelona...' },
              ].map(({ label, val, set, ph }) => (
                <div key={label}>
                  <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 6px' }}>{label}</p>
                  <input value={val} onChange={e => set(e.target.value)} placeholder={ph} style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:10, padding:'10px 12px', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
                </div>
              ))}
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 6px' }}>País de origen</p>
                <select value={editPais} onChange={e => setEditPais(e.target.value)} style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:10, padding:'10px 12px', fontSize:14, fontFamily:'inherit', outline:'none', background:'#fff', boxSizing:'border-box' as const }}>
                  <option value="">Selecciona tu país</option>
                  {PAISES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 6px' }}>Situación migratoria</p>
                <select value={editSituacion} onChange={e => setEditSituacion(e.target.value)} style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:10, padding:'10px 12px', fontSize:14, fontFamily:'inherit', outline:'none', background:'#fff', boxSizing:'border-box' as const }}>
                  <option value="">Selecciona tu situación</option>
                  {SITUACIONES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button onClick={saveProfile} disabled={perfilLoading} style={{ ...btn, background:perfilGuardado?'#059669':'#1B4FCC', opacity:perfilLoading?0.7:1 }}>
                {perfilGuardado ? '✅ Guardado correctamente' : perfilLoading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
            <button onClick={() => setPantalla('mis-publicaciones')} style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:14, padding:'14px 16px', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:12, textAlign:'left' as const, width:'100%' }}>
              <span style={{ fontSize:24 }}>📋</span>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:700, fontSize:14, color:'#065f46', margin:0 }}>Mis publicaciones</p>
                <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>{misEmpleos.length + misViviendas.length} publicación{misEmpleos.length + misViviendas.length !== 1 ? 'es' : ''}</p>
              </div>
              <span style={{ color:'#9ca3af' }}>→</span>
            </button>
            {editSituacion && (
              <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:16, padding:16 }}>
                <p style={{ fontWeight:700, fontSize:14, color:'#1e3a8a', margin:'0 0 8px' }}>📋 Según tu situación:</p>
                <p style={{ fontSize:13, color:'#1d4ed8', margin:0, lineHeight:1.6 }}>
                  {editSituacion==='Sin documentación' && 'Usa la Calculadora de Arraigo para ver tus opciones y el Chat IA para resolver dudas.'}
                  {editSituacion==='NIE en trámite' && 'Con NIE en trámite puedes buscar trabajo. Filtra por "NIE en trámite OK" en la sección Trabajo.'}
                  {editSituacion==='Arraigo en proceso' && 'Mientras tramitas el arraigo, busca vivienda y empleo. Necesitas precontrato de trabajo.'}
                  {editSituacion==='Residencia temporal' && 'Con residencia temporal puedes trabajar con normalidad. Recuerda renovarla antes de que caduque.'}
                  {editSituacion==='Residencia permanente' && '¡Con residencia permanente tienes casi los mismos derechos que un ciudadano español!'}
                  {editSituacion==='Ciudadanía española' && '¡Felicidades! Como ciudadano español tienes todos los derechos.'}
                </p>
              </div>
            )}
          </div>
        )}

        {pantalla === 'calculadora' && (
          <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ background:'linear-gradient(135deg,#d97706,#f59e0b)', borderRadius:20, padding:'20px 24px', color:'#fff' }}>
              <h2 style={{ fontSize:20, fontWeight:800, margin:'0 0 4px' }}>🧮 Calculadora de Arraigo</h2>
              <p style={{ fontSize:13, opacity:0.9, margin:0 }}>Descubre qué tipo de regularización puedes solicitar</p>
            </div>
            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:16, display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <p style={{ fontSize:14, fontWeight:700, color:'#111', margin:'0 0 4px' }}>¿Cuántos años llevas en España?</p>
                <p style={{ fontSize:12, color:'#6b7280', margin:'0 0 8px' }}>Con padrón continuo: <strong>{calcAnios} año{calcAnios !== 1 ? 's' : ''}</strong></p>
                <input type="range" min={0} max={10} step={0.5} value={calcAnios} onChange={e => setCalcAnios(Number(e.target.value))} style={{ width:'100%' }} />
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#9ca3af', marginTop:4 }}>
                  <span>0</span><span>5 años</span><span>10+</span>
                </div>
              </div>
              {[
                { label:'¿Tienes trabajo o empresa que firme precontrato?', state:calcTrabajo, set:setCalcTrabajo },
                { label:'¿Tienes familiar directo español o residente legal?', state:calcFamilia, set:setCalcFamilia },
                { label:'¿Estás empadronado actualmente?', state:calcPadron, set:setCalcPadron },
                { label:'¿Tienes antecedentes penales?', state:calcAntecedentes, set:setCalcAntecedentes },
              ].map(({ label, state, set }) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12 }}>
                  <p style={{ fontSize:13, color:'#374151', margin:0, flex:1, lineHeight:1.4 }}>{label}</p>
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={() => set(true)} style={{ padding:'6px 14px', borderRadius:10, border:'none', background:state?'#1B4FCC':'#f3f4f6', color:state?'#fff':'#374151', fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>Sí</button>
                    <button onClick={() => set(false)} style={{ padding:'6px 14px', borderRadius:10, border:'none', background:!state?'#374151':'#f3f4f6', color:!state?'#fff':'#374151', fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>No</button>
                  </div>
                </div>
              ))}
              <button onClick={calcularArraigo} style={{ ...btn }}>Calcular mi situación →</button>
            </div>
            {calcResult && (
              <div style={{ background:calcResult.color==='green'?'#f0fdf4':calcResult.color==='blue'?'#eff6ff':calcResult.color==='orange'?'#fffbeb':'#fef2f2', border:`1px solid ${calcResult.color==='green'?'#bbf7d0':calcResult.color==='blue'?'#bfdbfe':calcResult.color==='orange'?'#fde68a':'#fecaca'}`, borderRadius:18, padding:18 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <p style={{ fontWeight:800, fontSize:17, color:'#111', margin:0 }}>{calcResult.tipo}</p>
                  <div style={{ textAlign:'center' }}>
                    <p style={{ fontSize:24, fontWeight:900, color:calcResult.color==='green'?'#059669':calcResult.color==='blue'?'#1d4ed8':calcResult.color==='orange'?'#d97706':'#dc2626', margin:0 }}>{calcResult.prob}%</p>
                    <p style={{ fontSize:10, color:'#6b7280', margin:0 }}>probabilidad</p>
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {calcResult.pasos.map((paso, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, background:'rgba(255,255,255,0.7)', borderRadius:10, padding:'10px 12px' }}>
                      <span style={{ fontWeight:800, color:'#1B4FCC', fontSize:13, flexShrink:0 }}>{i+1}.</span>
                      <span style={{ fontSize:13, color:'#374151', lineHeight:1.4 }}>{paso}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setPantalla('chat')} style={{ ...btn, marginTop:14, fontSize:13 }}>💬 Preguntar más detalles al Chat IA</button>
              </div>
            )}
          </div>
        )}

        {pantalla === 'contrato' && (
          <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ background:'linear-gradient(135deg,#065f46,#059669)', borderRadius:20, padding:'20px 24px', color:'#fff' }}>
              <h2 style={{ fontSize:20, fontWeight:800, margin:'0 0 4px' }}>📄 Analiza tu Contrato</h2>
              <p style={{ fontSize:13, opacity:0.9, margin:0 }}>La IA detecta cláusulas abusivas o ilegales</p>
            </div>
            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:16, display:'flex', flexDirection:'column', gap:12 }}>
              <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:0 }}>Pega aquí el texto de tu contrato:</p>
              <textarea value={contratoText} onChange={e => setContratoText(e.target.value)} placeholder="Copia y pega el texto de tu contrato de trabajo..." rows={8} style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:12, padding:'12px', fontSize:13, fontFamily:'inherit', outline:'none', resize:'vertical', boxSizing:'border-box' as const }} />
              <button onClick={analizarContrato} disabled={contratoLoading||!contratoText.trim()} style={{ ...btn, background:'#065f46', opacity:(!contratoText.trim()||contratoLoading)?0.5:1 }}>
                {contratoLoading ? '🔍 Analizando...' : '🔍 Analizar con IA'}
              </button>
            </div>
            {contratoResult && (
              <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:16 }}>
                <p style={{ fontWeight:700, fontSize:14, color:'#111', margin:'0 0 10px' }}>📋 Análisis del contrato:</p>
                <div style={{ fontSize:13, color:'#374151', lineHeight:1.7, whiteSpace:'pre-wrap' as const }}>{contratoResult}</div>
              </div>
            )}
            <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:14, padding:14 }}>
              <p style={{ fontSize:12, color:'#166534', margin:0 }}>💡 Si encuentras algo sospechoso, consulta con un abogado o una ONG antes de firmar.</p>
            </div>
          </div>
        )}

        {pantalla === 'nomina' && (
          <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ background:'linear-gradient(135deg,#1e3a8a,#1B4FCC)', borderRadius:20, padding:'20px 24px', color:'#fff' }}>
              <h2 style={{ fontSize:20, fontWeight:800, margin:'0 0 4px' }}>💰 Explica mi Nómina</h2>
              <p style={{ fontSize:13, opacity:0.9, margin:0 }}>Entiende cada línea de tu recibo de salario</p>
            </div>
            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:16, display:'flex', flexDirection:'column', gap:12 }}>
              <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:0 }}>Pega los conceptos y cantidades de tu nómina:</p>
              <textarea value={nominaText} onChange={e => setNominaText(e.target.value)} placeholder={"Ejemplo:\nSalario base: 1.200€\nComplementos: 150€\nSeguridad Social: -71€\nIRPF 15%: -202,50€\nLíquido a percibir: 1.076,50€"} rows={8} style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:12, padding:'12px', fontSize:13, fontFamily:'inherit', outline:'none', resize:'vertical', boxSizing:'border-box' as const }} />
              <button onClick={analizarNomina} disabled={nominaLoading||!nominaText.trim()} style={{ ...btn, opacity:(!nominaText.trim()||nominaLoading)?0.5:1 }}>
                {nominaLoading ? '💡 Explicando...' : '💡 Explicar con IA'}
              </button>
            </div>
            {nominaResult && (
              <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:16 }}>
                <p style={{ fontWeight:700, fontSize:14, color:'#111', margin:'0 0 10px' }}>📊 Explicación de tu nómina:</p>
                <div style={{ fontSize:13, color:'#374151', lineHeight:1.7, whiteSpace:'pre-wrap' as const }}>{nominaResult}</div>
              </div>
            )}
            <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:14, padding:14 }}>
              <p style={{ fontSize:12, color:'#1e40af', margin:0 }}>💡 ¿Tu nómina no cuadra? Consulta con un gestor laboral gratuito de tu ayuntamiento.</p>
            </div>
          </div>
        )}

        {pantalla === 'notificaciones' && (
          <div style={{ padding:16, display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h2 style={{ fontSize:20, fontWeight:800, margin:0, color:'#111' }}>🔔 Notificaciones</h2>
              {notifCount > 0 && <button onClick={() => setNotifs(n => n.map(x => ({ ...x, leida:true })))} style={{ fontSize:12, color:'#1B4FCC', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>Marcar todo leído</button>}
            </div>
            {notifs.map(n => (
              <div key={n.id} onClick={() => setNotifs(prev => prev.map(x => x.id===n.id ? { ...x, leida:true } : x))} style={{ background:n.leida?'#fff':'#eff6ff', border:`1px solid ${n.leida?'#e5e7eb':'#bfdbfe'}`, borderRadius:16, padding:'14px 16px', cursor:'pointer', display:'flex', gap:12, alignItems:'flex-start' }}>
                <span style={{ fontSize:22, flexShrink:0 }}>{n.icono}</span>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <p style={{ fontWeight:700, fontSize:14, color:'#111', margin:0 }}>{n.titulo}</p>
                    {!n.leida && <span style={{ width:8, height:8, background:'#1B4FCC', borderRadius:'50%', flexShrink:0, marginTop:4, display:'inline-block' }} />}
                  </div>
                  <p style={{ fontSize:13, color:'#374151', margin:'0 0 4px', lineHeight:1.4 }}>{n.desc}</p>
                  <p style={{ fontSize:11, color:'#9ca3af', margin:0 }}>{n.tiempo}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {pantalla === 'admin' && userEmail === ADMIN_EMAIL && (
          <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ background:'linear-gradient(135deg,#1e1b4b,#312e81)', borderRadius:20, padding:'20px 24px', color:'#fff' }}>
              <h2 style={{ fontSize:20, fontWeight:800, margin:'0 0 4px' }}>⚙️ Panel Admin</h2>
              <p style={{ fontSize:13, opacity:0.9, margin:0 }}>Estadísticas y gestión de UnidosPorTi</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[{ n:'1.247', label:'Usuarios', icon:'👥' },{ n:'89', label:'Activos hoy', icon:'🟢' },{ n:'4.832', label:'Consultas IA', icon:'🤖' },{ n:'12', label:'ONGs', icon:'🏛️' }].map(({ n, label, icon }) => (
                <div key={label} style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:'14px', textAlign:'center' }}>
                  <p style={{ fontSize:24, margin:'0 0 4px' }}>{icon}</p>
                  <p style={{ fontWeight:900, fontSize:22, color:'#1B4FCC', margin:'0 0 2px' }}>{n}</p>
                  <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>{label}</p>
                </div>
              ))}
            </div>
            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <p style={{ fontWeight:700, fontSize:15, margin:0, color:'#111' }}>🕐 Moderación pendiente</p>
                <button onClick={fetchPendientes} style={{ fontSize:12, color:'#1B4FCC', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>Actualizar</button>
              </div>
              {pendienteEmpleos.length === 0 && pendienteViviendas.length === 0 && (
                <p style={{ fontSize:13, color:'#9ca3af', margin:0, textAlign:'center', padding:'12px 0' }}>No hay publicaciones pendientes ✅</p>
              )}
              {pendienteEmpleos.map(e => (
                <div key={e.id} style={{ borderBottom:'1px solid #f3f4f6', padding:'12px 0' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                    <div>
                      <span style={{ fontSize:10, background:'#fef3c7', color:'#92400e', padding:'2px 6px', borderRadius:8, fontWeight:700 }}>EMPLEO</span>
                      <p style={{ fontWeight:700, fontSize:14, color:'#111', margin:'4px 0 0' }}>{e.empresa} — {e.ciudad}</p>
                      <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>{e.sector} · {e.salario} · por {e.user_email}</p>
                    </div>
                  </div>
                  <p style={{ fontSize:12, color:'#374151', margin:'0 0 8px', lineHeight:1.4 }}>{e.desc}</p>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={() => moderate('empleos_usuarios', e.id, 'aprobar')} disabled={moderandoId===e.id} style={{ flex:1, background:'#065f46', color:'#fff', border:'none', borderRadius:10, padding:'8px 0', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', opacity:moderandoId===e.id?0.6:1 }}>✅ Aprobar</button>
                    <button onClick={() => moderate('empleos_usuarios', e.id, 'rechazar')} disabled={moderandoId===e.id} style={{ flex:1, background:'#dc2626', color:'#fff', border:'none', borderRadius:10, padding:'8px 0', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', opacity:moderandoId===e.id?0.6:1 }}>❌ Rechazar</button>
                  </div>
                </div>
              ))}
              {pendienteViviendas.map(v => (
                <div key={v.id} style={{ borderBottom:'1px solid #f3f4f6', padding:'12px 0' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                    <div>
                      <span style={{ fontSize:10, background:'#eff6ff', color:'#1e40af', padding:'2px 6px', borderRadius:8, fontWeight:700 }}>VIVIENDA</span>
                      <p style={{ fontWeight:700, fontSize:14, color:'#111', margin:'4px 0 0' }}>{v.titulo} — {v.ciudad}</p>
                      <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>{v.tipo} · {v.precio}€/mes · por {v.user_email}</p>
                    </div>
                  </div>
                  <p style={{ fontSize:12, color:'#374151', margin:'0 0 8px', lineHeight:1.4 }}>{v.desc}</p>
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={() => moderate('viviendas_usuarios', v.id, 'aprobar')} disabled={moderandoId===v.id} style={{ flex:1, background:'#065f46', color:'#fff', border:'none', borderRadius:10, padding:'8px 0', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', opacity:moderandoId===v.id?0.6:1 }}>✅ Aprobar</button>
                    <button onClick={() => moderate('viviendas_usuarios', v.id, 'rechazar')} disabled={moderandoId===v.id} style={{ flex:1, background:'#dc2626', color:'#fff', border:'none', borderRadius:10, padding:'8px 0', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', opacity:moderandoId===v.id?0.6:1 }}>❌ Rechazar</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:16 }}>
              <p style={{ fontWeight:700, fontSize:15, margin:'0 0 12px', color:'#111' }}>🏛️ ONGs Registradas</p>
              {[
                { nombre:'Cruz Roja España', tipo:'Servicios generales', tel:'639 123 456' },
                { nombre:'ACCEM', tipo:'Integración migrantes', tel:'915 567 234' },
                { nombre:'Cáritas Madrid', tipo:'Atención social', tel:'913 445 500' },
                { nombre:'CEAR', tipo:'Refugiados y asilo', tel:'915 981 535' },
              ].map(ong => (
                <div key={ong.nombre} style={{ borderBottom:'1px solid #f3f4f6', padding:'10px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <p style={{ fontWeight:600, fontSize:14, color:'#111', margin:0 }}>{ong.nombre}</p>
                    <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>{ong.tipo}</p>
                  </div>
                  <Badge text={ong.tel} color="blue" />
                </div>
              ))}
            </div>
          </div>
        )}

        {pantalla === 'empleo' && (
          <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
            <div style={{ background:'linear-gradient(135deg,#065f46,#059669)', padding:'16px 16px 12px', flexShrink:0 }}>
              <h2 style={{ color:'#fff', fontSize:18, fontWeight:800, margin:'0 0 10px' }}>💼 Trabajo para migrantes</h2>
              <input value={busqEmp} onChange={e => setBusqEmp(e.target.value)} placeholder="Busca empresa, sector, ciudad..." style={{ width:'100%', border:'none', borderRadius:12, padding:'11px 14px', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
            </div>
            <div style={{ background:'#f0fdf4', borderBottom:'1px solid #bbf7d0', padding:'10px 14px', display:'flex', flexDirection:'column', gap:8, flexShrink:0 }}>
              <div style={{ display:'flex', gap:8, overflowX:'auto' as const, paddingBottom:2 }}>
                {SECTORES.map(s => (
                  <button key={s} onClick={() => setSectorFilt(s)} style={{ flexShrink:0, background:sectorFilt===s?'#065f46':'#fff', color:sectorFilt===s?'#fff':'#374151', border:'1px solid '+(sectorFilt===s?'#065f46':'#d1d5db'), borderRadius:20, padding:'5px 12px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>{s}</button>
                ))}
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' as const }}>
                <select value={ciudadEmpFilt} onChange={e => setCiudadEmpFilt(e.target.value)} style={{ flex:1, border:'1px solid #d1d5db', borderRadius:10, padding:'6px 10px', fontSize:12, fontFamily:'inherit', outline:'none', background:'#fff' }}>
                  {CIUDADES_EMP.map(c => <option key={c}>{c}</option>)}
                </select>
                <label style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, fontWeight:600, color:'#065f46', cursor:'pointer' }}>
                  <input type="checkbox" checked={soloArraigo} onChange={e => setSoloArraigo(e.target.checked)} /> Acepta arraigo
                </label>
                <label style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, fontWeight:600, color:'#065f46', cursor:'pointer' }}>
                  <input type="checkbox" checked={soloPrecontrato} onChange={e => setSoloPrecontrato(e.target.checked)} /> Firma precontrato
                </label>
              </div>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>{empleosFiltrados.length + dbEmpleosFiltrados.length} ofertas encontradas</p>
                <button onClick={() => setPantalla('publicar-empleo')} style={{ background:'#065f46', color:'#fff', border:'none', borderRadius:20, padding:'6px 14px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>+ Publicar oferta</button>
              </div>
              {empleosFiltrados.length === 0 && dbEmpleosFiltrados.length === 0 && <div style={{ textAlign:'center', padding:'40px 20px' }}><p style={{ fontSize:32 }}>🔍</p><p style={{ color:'#6b7280', fontSize:14 }}>No hay ofertas con esos filtros</p></div>}
              {empleosFiltrados.map(e => (
                <div key={e.id} style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:18, padding:16, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                    <div>
                      <p style={{ fontWeight:800, fontSize:15, margin:'0 0 2px', color:'#111' }}>{e.empresa}</p>
                      <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>{e.sector} · {e.ciudad} · {e.jornada}</p>
                    </div>
                    <span style={{ fontWeight:800, color:'#065f46', fontSize:16, flexShrink:0 }}>{e.salario}<span style={{ fontSize:11, fontWeight:500 }}>/mes</span></span>
                  </div>
                  <p style={{ fontSize:13, color:'#374151', margin:'0 0 10px', lineHeight:1.5 }}>{e.desc}</p>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' as const, marginBottom:12 }}>
                    {e.arraigo && <Badge text="✓ Acepta arraigo" color="green" />}
                    {e.precontrato && <Badge text="✓ Firma precontrato" color="blue" />}
                    {e.nie && <Badge text="✓ NIE en trámite OK" color="orange" />}
                  </div>
                  <button onClick={() => { setMsg(`Quiero información sobre la oferta de ${e.empresa} en ${e.ciudad}, sector ${e.sector}`); setPantalla('chat') }} style={{ ...btn, background:'#065f46', fontSize:13, padding:'10px 0' }}>
                    Consultar por esta oferta →
                  </button>
                </div>
              ))}
              {dbEmpleosFiltrados.length > 0 && (
                <>
                  <p style={{ fontSize:11, fontWeight:700, color:'#6b7280', textTransform:'uppercase' as const, letterSpacing:1, margin:'4px 0 0' }}>Publicadas por la comunidad</p>
                  {dbEmpleosFiltrados.map(e => (
                    <div key={e.id} style={{ background:'#fff', border:'2px solid #bbf7d0', borderRadius:18, padding:16 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                        <div>
                          <p style={{ fontWeight:800, fontSize:15, margin:'0 0 2px', color:'#111' }}>{e.empresa}</p>
                          <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>{e.sector} · {e.ciudad} · {e.jornada}</p>
                        </div>
                        <span style={{ fontWeight:800, color:'#065f46', fontSize:16, flexShrink:0 }}>{e.salario}<span style={{ fontSize:11, fontWeight:500 }}>/mes</span></span>
                      </div>
                      <p style={{ fontSize:13, color:'#374151', margin:'0 0 10px', lineHeight:1.5 }}>{e.desc}</p>
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap' as const, marginBottom:12 }}>
                        {e.arraigo && <Badge text="✓ Acepta arraigo" color="green" />}
                        {e.precontrato && <Badge text="✓ Firma precontrato" color="blue" />}
                        {e.nie && <Badge text="✓ NIE en trámite OK" color="orange" />}
                      </div>
                      <div style={{ display:'flex', gap:8 }}>
                        {(e.contacto_tipo === 'whatsapp' || e.contacto_tipo === 'ambos') && e.contacto_whatsapp && (
                          <a href={`https://wa.me/${e.contacto_whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" style={{ flex:1, background:'#25d366', color:'#fff', border:'none', borderRadius:12, padding:'10px 0', fontSize:13, fontWeight:700, cursor:'pointer', textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center' }}>WhatsApp</a>
                        )}
                        {(e.contacto_tipo === 'email' || e.contacto_tipo === 'ambos') && e.contacto_email && (
                          <a href={`mailto:${e.contacto_email}`} style={{ flex:1, background:'#1B4FCC', color:'#fff', border:'none', borderRadius:12, padding:'10px 0', fontSize:13, fontWeight:700, cursor:'pointer', textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center' }}>Email</a>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {pantalla === 'vivienda' && (
          <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
            <div style={{ background:'linear-gradient(135deg,#78350f,#d97706)', padding:'16px 16px 12px', flexShrink:0 }}>
              <h2 style={{ color:'#fff', fontSize:18, fontWeight:800, margin:'0 0 10px' }}>🏠 Vivienda sin barreras</h2>
              <input value={busqViv} onChange={e => setBusqViv(e.target.value)} placeholder="Busca ciudad, barrio..." style={{ width:'100%', border:'none', borderRadius:12, padding:'11px 14px', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
            </div>
            <div style={{ background:'#fffbeb', borderBottom:'1px solid #fde68a', padding:'10px 14px', display:'flex', flexDirection:'column', gap:8, flexShrink:0 }}>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <select value={ciudadVivFilt} onChange={e => setCiudadVivFilt(e.target.value)} style={{ flex:1, border:'1px solid #d1d5db', borderRadius:10, padding:'6px 10px', fontSize:12, fontFamily:'inherit', outline:'none', background:'#fff' }}>
                  {CIUDADES_VIV.map(c => <option key={c}>{c}</option>)}
                </select>
                <select value={tipoVivFilt} onChange={e => setTipoVivFilt(e.target.value)} style={{ flex:1, border:'1px solid #d1d5db', borderRadius:10, padding:'6px 10px', fontSize:12, fontFamily:'inherit', outline:'none', background:'#fff' }}>
                  {TIPOS_VIV.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' as const }}>
                <label style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, fontWeight:600, color:'#92400e', cursor:'pointer' }}>
                  <input type="checkbox" checked={soloSinNomina} onChange={e => setSoloSinNomina(e.target.checked)} /> Sin nómina
                </label>
                <div style={{ display:'flex', alignItems:'center', gap:6, flex:1 }}>
                  <span style={{ fontSize:12, color:'#92400e', fontWeight:600, flexShrink:0 }}>Máx {precioMax}€</span>
                  <input type="range" min={200} max={1000} step={50} value={precioMax} onChange={e => setPrecioMax(Number(e.target.value))} style={{ flex:1 }} />
                </div>
              </div>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>{viviendasFiltradas.length + dbViviendosFiltradas.length} viviendas encontradas</p>
                <button onClick={() => setPantalla('publicar-vivienda')} style={{ background:'#d97706', color:'#fff', border:'none', borderRadius:20, padding:'6px 14px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>+ Publicar vivienda</button>
              </div>
              {viviendasFiltradas.length === 0 && dbViviendosFiltradas.length === 0 && <div style={{ textAlign:'center', padding:'40px 20px' }}><p style={{ fontSize:32 }}>🔍</p><p style={{ color:'#6b7280', fontSize:14 }}>No hay viviendas con esos filtros</p></div>}
              {viviendasFiltradas.map(v => (
                <div key={v.id} style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:18, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div style={{ background:'linear-gradient(135deg,#fef3c7,#fde68a)', padding:'16px', display:'flex', alignItems:'center', gap:12 }}>
                    <span style={{ fontSize:36 }}>{v.img}</span>
                    <div>
                      <span style={{ fontSize:11, background:'#92400e', color:'#fff', padding:'2px 8px', borderRadius:10, fontWeight:700 }}>{v.tipo}</span>
                      <p style={{ fontWeight:800, fontSize:15, color:'#111', margin:'4px 0 0' }}>{v.titulo}</p>
                    </div>
                  </div>
                  <div style={{ padding:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                      <p style={{ fontSize:13, color:'#6b7280', margin:0 }}>📍 {v.barrio}, {v.ciudad}</p>
                      <span style={{ fontWeight:800, color:'#92400e', fontSize:18 }}>{v.precio}€<span style={{ fontSize:11, fontWeight:500, color:'#6b7280' }}>/mes</span></span>
                    </div>
                    <p style={{ fontSize:13, color:'#374151', margin:'0 0 10px', lineHeight:1.5 }}>{v.desc}</p>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' as const, marginBottom:12 }}>
                      {v.sinNomina && <Badge text="✓ Sin nómina" color="green" />}
                      {v.extranjeros && <Badge text="✓ Acepta extranjeros" color="blue" />}
                      <Badge text={`Fianza: ${v.fianza} mes`} color="gray" />
                      <Badge text={`${v.m2}m²`} color="gray" />
                    </div>
                    <button onClick={() => { setMsg(`Me interesa la vivienda "${v.titulo}" en ${v.barrio}, ${v.ciudad} por ${v.precio}€/mes`); setPantalla('chat') }} style={{ ...btn, background:'#d97706', fontSize:13, padding:'10px 0' }}>
                      Consultar disponibilidad →
                    </button>
                  </div>
                </div>
              ))}
              {dbViviendosFiltradas.length > 0 && (
                <>
                  <p style={{ fontSize:11, fontWeight:700, color:'#6b7280', textTransform:'uppercase' as const, letterSpacing:1, margin:'4px 0 0' }}>Publicadas por la comunidad</p>
                  {dbViviendosFiltradas.map(v => (
                    <div key={v.id} style={{ background:'#fff', border:'2px solid #fde68a', borderRadius:18 }}>
                      <div style={{ background:'linear-gradient(135deg,#fef3c7,#fde68a)', padding:'16px', display:'flex', alignItems:'center', gap:12 }}>
                        <span style={{ fontSize:36 }}>🏠</span>
                        <div>
                          <span style={{ fontSize:11, background:'#92400e', color:'#fff', padding:'2px 8px', borderRadius:10, fontWeight:700 }}>{v.tipo}</span>
                          <p style={{ fontWeight:800, fontSize:15, color:'#111', margin:'4px 0 0' }}>{v.titulo}</p>
                        </div>
                      </div>
                      <div style={{ padding:14 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                          <p style={{ fontSize:13, color:'#6b7280', margin:0 }}>📍 {v.barrio}, {v.ciudad}</p>
                          <span style={{ fontWeight:800, color:'#92400e', fontSize:18 }}>{v.precio}€<span style={{ fontSize:11, fontWeight:500, color:'#6b7280' }}>/mes</span></span>
                        </div>
                        <p style={{ fontSize:13, color:'#374151', margin:'0 0 10px', lineHeight:1.5 }}>{v.desc}</p>
                        <div style={{ display:'flex', gap:6, flexWrap:'wrap' as const, marginBottom:12 }}>
                          {v.sin_nomina && <Badge text="✓ Sin nómina" color="green" />}
                          {v.extranjeros && <Badge text="✓ Acepta extranjeros" color="blue" />}
                          <Badge text={`Fianza: ${v.fianza} mes`} color="gray" />
                          {v.m2 && <Badge text={`${v.m2}m²`} color="gray" />}
                        </div>
                        <div style={{ display:'flex', gap:8 }}>
                          {(v.contacto_tipo === 'whatsapp' || v.contacto_tipo === 'ambos') && v.contacto_whatsapp && (
                            <a href={`https://wa.me/${v.contacto_whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" style={{ flex:1, background:'#25d366', color:'#fff', border:'none', borderRadius:12, padding:'10px 0', fontSize:13, fontWeight:700, cursor:'pointer', textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center' }}>WhatsApp</a>
                          )}
                          {(v.contacto_tipo === 'email' || v.contacto_tipo === 'ambos') && v.contacto_email && (
                            <a href={`mailto:${v.contacto_email}`} style={{ flex:1, background:'#d97706', color:'#fff', border:'none', borderRadius:12, padding:'10px 0', fontSize:13, fontWeight:700, cursor:'pointer', textDecoration:'none', display:'flex', alignItems:'center', justifyContent:'center' }}>Email</a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {pantalla === 'chat' && (
          <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
            <div style={{ flex:1, padding:16, display:'flex', flexDirection:'column', gap:12, overflowY:'auto' }}>
              {chat.length === 0 && (
                <div style={{ textAlign:'center', paddingTop:24 }}>
                  <div style={{ fontSize:48, marginBottom:12 }}>🤖</div>
                  <p style={{ fontWeight:700, fontSize:16, color:'#111', margin:'0 0 4px' }}>Asistente IA 24/7</p>
                  <p style={{ fontSize:13, color:'#6b7280', margin:'0 0 16px' }}>Pregúntame sobre trabajo, vivienda, trámites y derechos</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {['¿Qué es el arraigo social?','¿Cómo consigo un precontrato?','¿Qué documentos necesito para alquilar sin nómina?','¿Puedo trabajar con el NIE en trámite?'].map(q => (
                      <button key={q} onClick={() => setMsg(q)} style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:12, padding:'10px 14px', textAlign:'left', fontSize:13, color:'#1d4ed8', cursor:'pointer', fontFamily:'inherit' }}>{q}</button>
                    ))}
                  </div>
                </div>
              )}
              {chat.map((m, i) => (
                <div key={i} style={{ display:'flex', justifyContent:m.role==='user'?'flex-end':'flex-start' }}>
                  <div style={{ maxWidth:'80%', borderRadius:18, padding:'10px 16px', fontSize:14, background:m.role==='user'?'#1B4FCC':'#fff', color:m.role==='user'?'#fff':'#111', border:m.role==='user'?'none':'1px solid #e5e7eb', lineHeight:1.5 }}>{m.content}</div>
                </div>
              ))}
              {chatLoading && <div style={{ display:'flex' }}><div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:18, padding:'10px 16px', fontSize:14, color:'#9ca3af' }}>Escribiendo...</div></div>}
            </div>
            <div style={{ padding:'12px 16px', background:'#fff', borderTop:'1px solid #e5e7eb', flexShrink:0 }}>
              <div style={{ display:'flex', gap:8 }}>
                <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key==='Enter' && send()} placeholder="Escribe tu pregunta..." style={{ flex:1, border:'1px solid #d1d5db', borderRadius:24, padding:'10px 16px', fontSize:14, outline:'none', fontFamily:'inherit' }} />
                <button onClick={send} disabled={chatLoading} style={{ width:44, height:44, background:'#1B4FCC', border:'none', borderRadius:'50%', color:'#fff', fontSize:18, cursor:'pointer', flexShrink:0, opacity:chatLoading?0.5:1 }}>➤</button>
              </div>
            </div>
          </div>
        )}

        {pantalla === 'tramites' && (
          <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14 }}>
            <h2 style={{ fontSize:20, fontWeight:800, margin:0, color:'#111' }}>📋 Mis Trámites</h2>
            <button onClick={() => setPantalla('calculadora')} style={{ background:'linear-gradient(135deg,#fffbeb,#fef3c7)', border:'1px solid #fde68a', borderRadius:14, padding:'14px 16px', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:12, textAlign:'left' as const }}>
              <span style={{ fontSize:28 }}>🧮</span>
              <div>
                <p style={{ fontWeight:700, fontSize:14, color:'#92400e', margin:0 }}>Calculadora de Arraigo</p>
                <p style={{ fontSize:12, color:'#b45309', margin:0 }}>Descubre qué tipo de regularización puedes pedir →</p>
              </div>
            </button>
            {!ruta && (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <p style={{ fontSize:13, color:'#6b7280', margin:0 }}>Selecciona tu tipo de arraigo para ver los pasos:</p>
                {(Object.keys(RUTAS) as Ruta[]).map(key => (
                  <button key={key} onClick={() => setRuta(key)} style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, padding:'14px 16px', textAlign:'left', cursor:'pointer', fontSize:14, fontFamily:'inherit', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                    <span style={{ fontWeight:700, color:'#111' }}>{RUTAS[key].nombre}</span>
                    <span style={{ color:'#1B4FCC', fontSize:12, fontWeight:600 }}>⏱ {RUTAS[key].tiempo} →</span>
                  </button>
                ))}
              </div>
            )}
            {ruta && (
              <>
                <button onClick={() => setRuta(null)} style={{ background:'none', border:'none', color:'#1B4FCC', fontSize:13, cursor:'pointer', fontFamily:'inherit', textAlign:'left', padding:0, fontWeight:600 }}>← Volver</button>
                <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:18, padding:16 }}>
                  <p style={{ fontWeight:800, fontSize:17, color:'#1e3a8a', margin:'0 0 4px' }}>{RUTAS[ruta].nombre}</p>
                  <p style={{ fontSize:13, color:'#1d4ed8', margin:'0 0 16px' }}>⏱ Tiempo estimado: {RUTAS[ruta].tiempo}</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {RUTAS[ruta].docs.map((doc, i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:12, background:'#fff', borderRadius:12, padding:'12px 14px', border:'1px solid #bfdbfe' }}>
                        <span style={{ width:28, height:28, minWidth:28, background:'#1B4FCC', color:'#fff', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700 }}>{i+1}</span>
                        <span style={{ fontSize:14, color:'#374151' }}>{doc}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setPantalla('chat')} style={{ ...btn, marginTop:16 }}>💬 Preguntar al Chat IA</button>
                </div>
              </>
            )}
          </div>
        )}

        {pantalla === 'publicar-empleo' && (
          <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ background:'linear-gradient(135deg,#065f46,#059669)', borderRadius:20, padding:'20px 24px', color:'#fff' }}>
              <button onClick={() => setPantalla('empleo')} style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:10, padding:'4px 10px', color:'#fff', fontSize:12, cursor:'pointer', fontFamily:'inherit', marginBottom:10 }}>← Volver</button>
              <h2 style={{ fontSize:20, fontWeight:800, margin:'0 0 4px' }}>💼 Publicar oferta de trabajo</h2>
              <p style={{ fontSize:13, opacity:0.9, margin:0 }}>Se revisará antes de publicarse</p>
            </div>
            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:16, display:'flex', flexDirection:'column', gap:12 }}>
              {[
                { label:'Empresa / Empleador *', key:'empresa', ph:'Nombre de la empresa' },
                { label:'Ciudad *', key:'ciudad', ph:'Ciudad donde se trabaja' },
                { label:'Salario *', key:'salario', ph:'Ej: 1.200€' },
              ].map(({ label, key, ph }) => (
                <div key={key}>
                  <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 5px' }}>{label}</p>
                  <input value={(formEmp as any)[key]} onChange={e => setFormEmp(f => ({ ...f, [key]: e.target.value }))} placeholder={ph} style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:10, padding:'10px 12px', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
                </div>
              ))}
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 5px' }}>Sector *</p>
                <select value={formEmp.sector} onChange={e => setFormEmp(f => ({ ...f, sector: e.target.value }))} style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:10, padding:'10px 12px', fontSize:14, fontFamily:'inherit', outline:'none', background:'#fff', boxSizing:'border-box' as const }}>
                  {SECTORES.filter(s => s !== 'Todos').map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 5px' }}>Jornada</p>
                <div style={{ display:'flex', gap:8 }}>
                  {['Completa','Parcial'].map(j => (
                    <button key={j} onClick={() => setFormEmp(f => ({ ...f, jornada: j }))} style={{ flex:1, background:formEmp.jornada===j?'#065f46':'#f3f4f6', color:formEmp.jornada===j?'#fff':'#374151', border:'none', borderRadius:10, padding:'9px 0', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>{j}</button>
                  ))}
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[
                  { label:'Acepta arraigo social/laboral', key:'arraigo' },
                  { label:'Firma precontrato', key:'precontrato' },
                  { label:'NIE en trámite OK', key:'nie' },
                ].map(({ label, key }) => (
                  <label key={key} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
                    <input type="checkbox" checked={(formEmp as any)[key]} onChange={e => setFormEmp(f => ({ ...f, [key]: e.target.checked }))} />
                    <span style={{ fontSize:13, color:'#374151' }}>{label}</span>
                  </label>
                ))}
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 5px' }}>Descripción *</p>
                <textarea value={formEmp.desc} onChange={e => setFormEmp(f => ({ ...f, desc: e.target.value }))} placeholder="Descripción del puesto, requisitos, condiciones..." rows={4} style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:10, padding:'10px 12px', fontSize:13, fontFamily:'inherit', outline:'none', resize:'vertical', boxSizing:'border-box' as const }} />
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 5px' }}>Cómo contactar</p>
                <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                  {[['whatsapp','WhatsApp'],['email','Email'],['ambos','Ambos']].map(([val, lab]) => (
                    <button key={val} onClick={() => setFormEmp(f => ({ ...f, contacto_tipo: val }))} style={{ flex:1, background:formEmp.contacto_tipo===val?'#065f46':'#f3f4f6', color:formEmp.contacto_tipo===val?'#fff':'#374151', border:'none', borderRadius:10, padding:'8px 0', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>{lab}</button>
                  ))}
                </div>
                {(formEmp.contacto_tipo === 'whatsapp' || formEmp.contacto_tipo === 'ambos') && (
                  <input value={formEmp.contacto_whatsapp} onChange={e => setFormEmp(f => ({ ...f, contacto_whatsapp: e.target.value }))} placeholder="Número WhatsApp (con código país, ej: +34600...)" style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:10, padding:'10px 12px', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const, marginBottom:8 }} />
                )}
                {(formEmp.contacto_tipo === 'email' || formEmp.contacto_tipo === 'ambos') && (
                  <input value={formEmp.contacto_email} onChange={e => setFormEmp(f => ({ ...f, contacto_email: e.target.value }))} placeholder="Email de contacto" style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:10, padding:'10px 12px', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
                )}
              </div>
              <button onClick={publishEmpleo} disabled={savingListing || !formEmp.empresa.trim() || !formEmp.ciudad.trim() || !formEmp.salario.trim() || !formEmp.desc.trim()} style={{ ...btn, background:'#065f46', opacity:(savingListing||!formEmp.empresa.trim()||!formEmp.ciudad.trim()||!formEmp.salario.trim()||!formEmp.desc.trim())?0.5:1 }}>
                {savingListing ? 'Enviando...' : 'Enviar para revisión →'}
              </button>
            </div>
            <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:14, padding:14 }}>
              <p style={{ fontSize:12, color:'#166534', margin:0 }}>💡 Tu publicación será revisada antes de aparecer. Recibirás respuesta en 24h.</p>
            </div>
          </div>
        )}

        {pantalla === 'publicar-vivienda' && (
          <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ background:'linear-gradient(135deg,#78350f,#d97706)', borderRadius:20, padding:'20px 24px', color:'#fff' }}>
              <button onClick={() => setPantalla('vivienda')} style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:10, padding:'4px 10px', color:'#fff', fontSize:12, cursor:'pointer', fontFamily:'inherit', marginBottom:10 }}>← Volver</button>
              <h2 style={{ fontSize:20, fontWeight:800, margin:'0 0 4px' }}>🏠 Publicar vivienda</h2>
              <p style={{ fontSize:13, opacity:0.9, margin:0 }}>Se revisará antes de publicarse</p>
            </div>
            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:16, display:'flex', flexDirection:'column', gap:12 }}>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 5px' }}>Tipo de vivienda</p>
                <div style={{ display:'flex', gap:8 }}>
                  {['Habitación','Piso'].map(t => (
                    <button key={t} onClick={() => setFormViv(f => ({ ...f, tipo: t }))} style={{ flex:1, background:formViv.tipo===t?'#d97706':'#f3f4f6', color:formViv.tipo===t?'#fff':'#374151', border:'none', borderRadius:10, padding:'9px 0', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>{t}</button>
                  ))}
                </div>
              </div>
              {[
                { label:'Título del anuncio *', key:'titulo', ph:'Ej: Habitación amplia en piso compartido' },
                { label:'Ciudad *', key:'ciudad', ph:'Ciudad' },
                { label:'Barrio *', key:'barrio', ph:'Barrio o zona' },
                { label:'Precio mensual (€) *', key:'precio', ph:'Ej: 350', type:'number' },
                { label:'Meses de fianza', key:'fianza', ph:'1', type:'number' },
                { label:'Metros cuadrados', key:'m2', ph:'Ej: 14', type:'number' },
              ].map(({ label, key, ph, type }) => (
                <div key={key}>
                  <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 5px' }}>{label}</p>
                  <input type={type||'text'} value={(formViv as any)[key]} onChange={e => setFormViv(f => ({ ...f, [key]: e.target.value }))} placeholder={ph} style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:10, padding:'10px 12px', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
                </div>
              ))}
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[
                  { label:'Sin nómina requerida', key:'sin_nomina' },
                  { label:'Acepta extranjeros', key:'extranjeros' },
                ].map(({ label, key }) => (
                  <label key={key} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
                    <input type="checkbox" checked={(formViv as any)[key]} onChange={e => setFormViv(f => ({ ...f, [key]: e.target.checked }))} />
                    <span style={{ fontSize:13, color:'#374151' }}>{label}</span>
                  </label>
                ))}
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 5px' }}>Descripción *</p>
                <textarea value={formViv.desc} onChange={e => setFormViv(f => ({ ...f, desc: e.target.value }))} placeholder="Describe la vivienda, normas, convivencia..." rows={4} style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:10, padding:'10px 12px', fontSize:13, fontFamily:'inherit', outline:'none', resize:'vertical', boxSizing:'border-box' as const }} />
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 5px' }}>Cómo contactar</p>
                <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                  {[['whatsapp','WhatsApp'],['email','Email'],['ambos','Ambos']].map(([val, lab]) => (
                    <button key={val} onClick={() => setFormViv(f => ({ ...f, contacto_tipo: val }))} style={{ flex:1, background:formViv.contacto_tipo===val?'#d97706':'#f3f4f6', color:formViv.contacto_tipo===val?'#fff':'#374151', border:'none', borderRadius:10, padding:'8px 0', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>{lab}</button>
                  ))}
                </div>
                {(formViv.contacto_tipo === 'whatsapp' || formViv.contacto_tipo === 'ambos') && (
                  <input value={formViv.contacto_whatsapp} onChange={e => setFormViv(f => ({ ...f, contacto_whatsapp: e.target.value }))} placeholder="Número WhatsApp (con código país, ej: +34600...)" style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:10, padding:'10px 12px', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const, marginBottom:8 }} />
                )}
                {(formViv.contacto_tipo === 'email' || formViv.contacto_tipo === 'ambos') && (
                  <input value={formViv.contacto_email} onChange={e => setFormViv(f => ({ ...f, contacto_email: e.target.value }))} placeholder="Email de contacto" style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:10, padding:'10px 12px', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
                )}
              </div>
              <button onClick={publishVivienda} disabled={savingListing || !formViv.titulo.trim() || !formViv.ciudad.trim() || !formViv.barrio.trim() || !formViv.desc.trim() || !formViv.precio} style={{ ...btn, background:'#d97706', opacity:(savingListing||!formViv.titulo.trim()||!formViv.ciudad.trim()||!formViv.barrio.trim()||!formViv.desc.trim()||!formViv.precio)?0.5:1 }}>
                {savingListing ? 'Enviando...' : 'Enviar para revisión →'}
              </button>
            </div>
            <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:14, padding:14 }}>
              <p style={{ fontSize:12, color:'#92400e', margin:0 }}>💡 Tu publicación será revisada antes de aparecer. Recibirás respuesta en 24h.</p>
            </div>
          </div>
        )}

        {pantalla === 'mis-publicaciones' && (
          <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ background:'linear-gradient(135deg,#1B4FCC,#2563eb)', borderRadius:20, padding:'20px 24px', color:'#fff' }}>
              <button onClick={() => setPantalla('perfil')} style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:10, padding:'4px 10px', color:'#fff', fontSize:12, cursor:'pointer', fontFamily:'inherit', marginBottom:10 }}>← Volver</button>
              <h2 style={{ fontSize:20, fontWeight:800, margin:'0 0 4px' }}>📋 Mis publicaciones</h2>
              <p style={{ fontSize:13, opacity:0.9, margin:0 }}>{misEmpleos.length + misViviendas.length} publicación{misEmpleos.length + misViviendas.length !== 1 ? 'es' : ''} en total</p>
            </div>
            {misEmpleos.length === 0 && misViviendas.length === 0 && (
              <div style={{ textAlign:'center', padding:'40px 20px' }}>
                <p style={{ fontSize:32, margin:'0 0 8px' }}>📋</p>
                <p style={{ color:'#6b7280', fontSize:14, margin:'0 0 16px' }}>Aún no has publicado nada</p>
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={() => setPantalla('publicar-empleo')} style={{ flex:1, ...btn, background:'#065f46', fontSize:13 }}>Publicar empleo</button>
                  <button onClick={() => setPantalla('publicar-vivienda')} style={{ flex:1, ...btn, background:'#d97706', fontSize:13 }}>Publicar vivienda</button>
                </div>
              </div>
            )}
            {misEmpleos.length > 0 && (
              <>
                <p style={{ fontSize:13, fontWeight:700, color:'#374151', margin:0 }}>💼 Empleos</p>
                {misEmpleos.map(e => (
                  <div key={e.id} style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                      <div>
                        <p style={{ fontWeight:700, fontSize:14, color:'#111', margin:0 }}>{e.empresa}</p>
                        <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>{e.sector} · {e.ciudad} · {e.salario}</p>
                      </div>
                      <span style={{ fontSize:11, padding:'3px 8px', borderRadius:20, fontWeight:700, background:e.status==='aprobado'?'#dcfce7':e.status==='rechazado'?'#fee2e2':'#fef3c7', color:e.status==='aprobado'?'#166534':e.status==='rechazado'?'#991b1b':'#92400e' }}>
                        {e.status === 'aprobado' ? '✅ Publicado' : e.status === 'rechazado' ? '❌ Rechazado' : '⏳ En revisión'}
                      </span>
                    </div>
                    <p style={{ fontSize:12, color:'#374151', margin:'0 0 10px', lineHeight:1.4 }}>{e.desc}</p>
                    <button onClick={() => deleteMiEmpleo(e.id)} style={{ width:'100%', background:'#fee2e2', color:'#991b1b', border:'none', borderRadius:10, padding:'8px 0', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Eliminar</button>
                  </div>
                ))}
              </>
            )}
            {misViviendas.length > 0 && (
              <>
                <p style={{ fontSize:13, fontWeight:700, color:'#374151', margin:0 }}>🏠 Viviendas</p>
                {misViviendas.map(v => (
                  <div key={v.id} style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                      <div>
                        <p style={{ fontWeight:700, fontSize:14, color:'#111', margin:0 }}>{v.titulo}</p>
                        <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>{v.tipo} · {v.ciudad} · {v.precio}€/mes</p>
                      </div>
                      <span style={{ fontSize:11, padding:'3px 8px', borderRadius:20, fontWeight:700, background:v.status==='aprobado'?'#dcfce7':v.status==='rechazado'?'#fee2e2':'#fef3c7', color:v.status==='aprobado'?'#166534':v.status==='rechazado'?'#991b1b':'#92400e' }}>
                        {v.status === 'aprobado' ? '✅ Publicado' : v.status === 'rechazado' ? '❌ Rechazado' : '⏳ En revisión'}
                      </span>
                    </div>
                    <p style={{ fontSize:12, color:'#374151', margin:'0 0 10px', lineHeight:1.4 }}>{v.desc}</p>
                    <button onClick={() => deleteMiVivienda(v.id)} style={{ width:'100%', background:'#fee2e2', color:'#991b1b', border:'none', borderRadius:10, padding:'8px 0', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Eliminar</button>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {pantalla === 'comunidad' && (
          <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
            <div style={{ background:'linear-gradient(135deg,#6d28d9,#7c3aed)', padding:'14px 16px 10px', flexShrink:0 }}>
              <h2 style={{ color:'#fff', fontSize:18, fontWeight:800, margin:'0 0 2px' }}>👥 Chat Comunidad</h2>
              <p style={{ color:'rgba(255,255,255,0.8)', fontSize:12, margin:0 }}>Conéctate con otros migrantes en España</p>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column', gap:10 }}>
              {comunidadMsgs.length === 0 && (
                <div style={{ textAlign:'center', paddingTop:40 }}>
                  <p style={{ fontSize:40, margin:'0 0 8px' }}>👋</p>
                  <p style={{ fontWeight:700, fontSize:16, color:'#111', margin:'0 0 4px' }}>¡Sé el primero en saludar!</p>
                  <p style={{ fontSize:13, color:'#6b7280', margin:0 }}>Este es el espacio para conocer personas, compartir experiencias y apoyarse</p>
                </div>
              )}
              {comunidadMsgs.map((m, i) => {
                const esMio = m.user_id === userId
                const nombre = m.nombre || m.user_email.split('@')[0]
                const inicial = nombre.charAt(0).toUpperCase()
                const mismoAnterior = i > 0 && comunidadMsgs[i-1].user_id === m.user_id
                return (
                  <div key={m.id} style={{ display:'flex', flexDirection:esMio?'row-reverse':'row', gap:8, alignItems:'flex-end' }}>
                    {!esMio && (
                      <div style={{ width:32, height:32, minWidth:32, background:mismoAnterior?'transparent':'#ede9fe', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#6d28d9' }}>
                        {mismoAnterior ? '' : inicial}
                      </div>
                    )}
                    <div style={{ maxWidth:'72%' }}>
                      {!esMio && !mismoAnterior && (
                        <div style={{ display:'flex', alignItems:'center', gap:8, margin:'0 0 3px 4px' }}>
                          <p style={{ fontSize:11, fontWeight:700, color:'#6d28d9', margin:0 }}>{nombre}</p>
                          <button onClick={() => abrirConversacion({ user_id:m.user_id, nombre, email:m.user_email })} style={{ fontSize:10, color:'#6d28d9', background:'#ede9fe', border:'none', borderRadius:10, padding:'2px 7px', cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>✉ Mensaje</button>
                        </div>
                      )}
                      <div style={{ background:esMio?'#7c3aed':'#fff', color:esMio?'#fff':'#111', borderRadius:esMio?'18px 18px 4px 18px':'18px 18px 18px 4px', padding:'10px 14px', fontSize:14, lineHeight:1.5, border:esMio?'none':'1px solid #e5e7eb', wordBreak:'break-word' as const }}>
                        {m.mensaje}
                      </div>
                      <p style={{ fontSize:10, color:'#9ca3af', margin:'3px 4px 0', textAlign:esMio?'right':'left' }}>
                        {new Date(m.created_at).toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' })}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={comunidadBottomRef} />
            </div>
            <div style={{ padding:'10px 14px', background:'#fff', borderTop:'1px solid #e5e7eb', flexShrink:0 }}>
              <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
                <input
                  value={comunidadMsg}
                  onChange={e => setComunidadMsg(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && !e.shiftKey && sendComunidad()}
                  placeholder="Escribe un mensaje..."
                  style={{ flex:1, border:'1px solid #d1d5db', borderRadius:24, padding:'10px 16px', fontSize:14, outline:'none', fontFamily:'inherit' }}
                />
                <button onClick={sendComunidad} disabled={comunidadSending || !comunidadMsg.trim()} style={{ width:44, height:44, background:'#7c3aed', border:'none', borderRadius:'50%', color:'#fff', fontSize:18, cursor:'pointer', flexShrink:0, opacity:(comunidadSending||!comunidadMsg.trim())?0.5:1 }}>➤</button>
              </div>
            </div>
          </div>
        )}

        {pantalla === 'mensajes' && (
          <div style={{ padding:16, display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h2 style={{ fontSize:20, fontWeight:800, margin:0, color:'#111' }}>✉️ Mensajes</h2>
              <button onClick={() => userId && fetchConversaciones(userId)} style={{ fontSize:12, color:'#7c3aed', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>Actualizar</button>
            </div>
            {conversaciones.length === 0 && (
              <div style={{ textAlign:'center', padding:'48px 20px' }}>
                <p style={{ fontSize:40, margin:'0 0 8px' }}>✉️</p>
                <p style={{ fontWeight:700, fontSize:15, color:'#111', margin:'0 0 4px' }}>Sin mensajes aún</p>
                <p style={{ fontSize:13, color:'#6b7280', margin:'0 0 16px' }}>Ve al chat de comunidad y escribe a alguien</p>
                <button onClick={() => setPantalla('comunidad')} style={{ ...btn, background:'#7c3aed', fontSize:13 }}>Ir a Comunidad →</button>
              </div>
            )}
            {conversaciones.map(c => (
              <button key={c.user_id} onClick={() => abrirConversacion(c)} style={{ background:'#fff', border:`1px solid ${c.no_leidos>0?'#c4b5fd':'#e5e7eb'}`, borderRadius:16, padding:'14px 16px', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:12, textAlign:'left' as const }}>
                <div style={{ width:44, height:44, minWidth:44, background:'#ede9fe', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:'#6d28d9' }}>
                  {c.nombre.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
                    <p style={{ fontWeight:700, fontSize:14, color:'#111', margin:0 }}>{c.nombre}</p>
                    <p style={{ fontSize:11, color:'#9ca3af', margin:0, flexShrink:0 }}>{new Date(c.ultimo_tiempo).toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' })}</p>
                  </div>
                  <p style={{ fontSize:13, color:'#6b7280', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' as const }}>{c.ultimo_mensaje}</p>
                </div>
                {c.no_leidos > 0 && (
                  <span style={{ background:'#7c3aed', color:'#fff', borderRadius:'50%', width:22, height:22, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0 }}>{c.no_leidos}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {pantalla === 'conversacion' && convActiva && (
          <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
            <div style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', padding:'12px 16px', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
              <button onClick={() => setPantalla('mensajes')} style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', padding:0, lineHeight:1 }}>←</button>
              <div style={{ width:38, height:38, background:'#ede9fe', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'#6d28d9' }}>
                {convActiva.nombre.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontWeight:700, fontSize:14, color:'#111', margin:0 }}>{convActiva.nombre}</p>
                <p style={{ fontSize:11, color:'#9ca3af', margin:0 }}>{convActiva.email}</p>
              </div>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 }}>
              {convMensajes.length === 0 && (
                <div style={{ textAlign:'center', paddingTop:40 }}>
                  <p style={{ fontSize:36, margin:'0 0 8px' }}>👋</p>
                  <p style={{ fontSize:13, color:'#6b7280' }}>Sé el primero en escribir</p>
                </div>
              )}
              {convMensajes.map(m => {
                const esMio = m.from_user_id === userId
                return (
                  <div key={m.id} style={{ display:'flex', justifyContent:esMio?'flex-end':'flex-start' }}>
                    <div style={{ maxWidth:'76%' }}>
                      <div style={{ background:esMio?'#7c3aed':'#fff', color:esMio?'#fff':'#111', borderRadius:esMio?'18px 18px 4px 18px':'18px 18px 18px 4px', padding:'10px 14px', fontSize:14, lineHeight:1.5, border:esMio?'none':'1px solid #e5e7eb', wordBreak:'break-word' as const }}>
                        {m.mensaje}
                      </div>
                      <p style={{ fontSize:10, color:'#9ca3af', margin:'3px 4px 0', textAlign:esMio?'right':'left' }}>
                        {new Date(m.created_at).toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' })}
                        {esMio && <span style={{ marginLeft:4 }}>{m.leido ? ' ✓✓' : ' ✓'}</span>}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={convBottomRef} />
            </div>
            <div style={{ padding:'10px 14px', background:'#fff', borderTop:'1px solid #e5e7eb', flexShrink:0 }}>
              <div style={{ display:'flex', gap:8 }}>
                <input value={convMsg} onChange={e => setConvMsg(e.target.value)} onKeyDown={e => e.key==='Enter' && !e.shiftKey && sendMensajePrivado()} placeholder={`Mensaje a ${convActiva.nombre}...`} style={{ flex:1, border:'1px solid #d1d5db', borderRadius:24, padding:'10px 16px', fontSize:14, outline:'none', fontFamily:'inherit' }} />
                <button onClick={sendMensajePrivado} disabled={convSending || !convMsg.trim()} style={{ width:44, height:44, background:'#7c3aed', border:'none', borderRadius:'50%', color:'#fff', fontSize:18, cursor:'pointer', flexShrink:0, opacity:(convSending||!convMsg.trim())?0.5:1 }}>➤</button>
              </div>
            </div>
          </div>
        )}

      </div>

      <nav style={{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:480, background:'#fff', borderTop:'1px solid #e5e7eb', display:'flex', zIndex:100 }}>
        {[
          { id:'inicio', icon:'🏠', label:'Inicio' },
          { id:'empleo', icon:'💼', label:'Trabajo' },
          { id:'comunidad', icon:'👥', label:'Comunidad' },
          { id:'chat', icon:'🤖', label:'Chat IA' },
          { id:'tramites', icon:'📋', label:'Trámites' },
        ].map(({ id, icon, label }) => (
          <button key={id} onClick={() => setPantalla(id as Pantalla)} style={{ flex:1, padding:'8px 0 6px', display:'flex', flexDirection:'column', alignItems:'center', gap:2, background:'none', border:'none', cursor:'pointer', borderTop:pantalla===id?'2px solid #1B4FCC':'2px solid transparent', fontFamily:'inherit' }}>
            <span style={{ fontSize:18 }}>{icon}</span>
            <span style={{ fontSize:9, fontWeight:600, color:pantalla===id?'#1B4FCC':'#9ca3af' }}>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
