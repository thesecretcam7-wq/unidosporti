'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: true, detectSessionInUrl: true, autoRefreshToken: true } }
)

type Pantalla = 'inicio' | 'empleo' | 'vivienda' | 'chat' | 'tramites' | 'perfil' | 'calculadora' | 'contrato' | 'nomina' | 'notificaciones' | 'admin' | 'publicar-empleo' | 'publicar-vivienda' | 'mis-publicaciones' | 'comunidad' | 'mensajes' | 'conversacion' | 'premium' | 'citas' | 'nueva-cita' | 'alertas' | 'ong-dashboard' | 'ong-registro' | 'ong-recursos' | 'ong-nuevo-recurso' | 'ong-alertas-b2b' | 'ong-stats' | 'ong-anuncios' | 'ong-nuevo-anuncio' | 'cv-generador'
type Ruta = 'arraigo_social' | 'arraigo_laboral' | 'arraigo_familiar'
type Msg = { role: string; content: string }

const RUTAS = {
  arraigo_social: { nombre: 'Arraigo Social', tiempo: '6-9 meses', docs: ['3 años en España con padrón continuo', 'Precontrato de trabajo firmado', 'Sin antecedentes penales en España ni país de origen', 'Solicitar cita en extranjería'] },
  arraigo_laboral: { nombre: 'Arraigo Laboral', tiempo: '6-12 meses', docs: ['6 meses de trabajo demostrable en España', 'Informe vida laboral (SEPE)', 'Sin antecedentes penales', 'Solicitar cita en extranjería'] },
  arraigo_familiar: { nombre: 'Arraigo Familiar', tiempo: '2-4 meses', docs: ['Familiar directo español o residente legal', 'Certificado de parentesco apostillado', 'Sin antecedentes penales', 'Solicitar cita en extranjería'] },
} as const


const NOTIFICACIONES_INIT: { id:number; icono:string; titulo:string; desc:string; tiempo:string; leida:boolean }[] = []

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
type DbEmpleo = { id:string; user_id:string; user_email:string; empresa:string; sector:string; ciudad:string; salario:string; jornada:string; arraigo:boolean; precontrato:boolean; nie:boolean; desc:string; contacto_tipo:string; contacto_whatsapp?:string; contacto_email?:string; status:string; destacado?:boolean }
type DbVivienda = { id:string; user_id:string; user_email:string; tipo:string; titulo:string; ciudad:string; barrio:string; precio:number; fianza:number; sin_nomina:boolean; extranjeros:boolean; m2?:number; desc:string; contacto_tipo:string; contacto_whatsapp?:string; contacto_email?:string; status:string; destacado?:boolean }
type FormEmpleo = { empresa:string; sector:string; ciudad:string; salario:string; jornada:string; arraigo:boolean; precontrato:boolean; nie:boolean; desc:string; contacto_tipo:string; contacto_whatsapp:string; contacto_email:string }
type FormVivienda = { tipo:string; titulo:string; ciudad:string; barrio:string; precio:string; fianza:string; sin_nomina:boolean; extranjeros:boolean; m2:string; desc:string; contacto_tipo:string; contacto_whatsapp:string; contacto_email:string }
const EMPTY_EMP: FormEmpleo = { empresa:'', sector:'Agricultura', ciudad:'', salario:'', jornada:'Completa', arraigo:false, precontrato:false, nie:false, desc:'', contacto_tipo:'ambos', contacto_whatsapp:'', contacto_email:'' }
const EMPTY_VIV: FormVivienda = { tipo:'Habitación', titulo:'', ciudad:'', barrio:'', precio:'', fianza:'1', sin_nomina:false, extranjeros:true, m2:'', desc:'', contacto_tipo:'ambos', contacto_whatsapp:'', contacto_email:'' }

type Cita = { id:string; user_id:string; tipo:string; titulo:string; fecha:string; hora?:string; lugar?:string; notas?:string; completada:boolean; created_at:string }
type FormCita = { tipo:string; titulo:string; fecha:string; hora:string; lugar:string; notas:string }
const EMPTY_CITA: FormCita = { tipo:'Extranjería', titulo:'', fecha:'', hora:'', lugar:'', notas:'' }
const TIPOS_CITA = ['Extranjería','Médico','Trabajo','Escuela','Banco','Abogado','Otro']

type RatingInfo = { avg:number; count:number }
type Alerta = { id:string; user_id:string; tipo:string; sector?:string; ciudad?:string; precio_max?:number; created_at:string }
type FormAlerta = { tipo:string; sector:string; ciudad:string; precio_max:string }
const EMPTY_ALERTA: FormAlerta = { tipo:'empleo', sector:'', ciudad:'', precio_max:'' }

type Organizacion = { id:string; user_id:string; nombre:string; tipo:string; descripcion:string; ciudad:string; web?:string; telefono?:string; email_contacto:string; plan:string; stripe_customer_id?:string; verificada:boolean; created_at:string }
type RecursoOng = { id:string; org_id:string; org_nombre:string; org_verificada:boolean; tipo:string; titulo:string; descripcion:string; ciudad:string; direccion?:string; horario?:string; telefono?:string; email?:string; web?:string; gratuito:boolean; activo:boolean; created_at:string }
type AnuncioNativo = { id:string; org_nombre?:string; titulo:string; descripcion:string; cta:string; url:string; imagen_url?:string; tipo_pantalla:string; activo:boolean }
type FormOrg = { nombre:string; tipo:string; descripcion:string; ciudad:string; web:string; telefono:string; email_contacto:string }
type FormRecurso = { tipo:string; titulo:string; descripcion:string; ciudad:string; direccion:string; horario:string; telefono:string; email:string; web:string; gratuito:boolean }
const EMPTY_ORG: FormOrg = { nombre:'', tipo:'ong', descripcion:'', ciudad:'', web:'', telefono:'', email_contacto:'' }
const EMPTY_RECURSO: FormRecurso = { tipo:'Asesoría jurídica', titulo:'', descripcion:'', ciudad:'', direccion:'', horario:'', telefono:'', email:'', web:'', gratuito:true }
const TIPOS_RECURSO = ['Asesoría jurídica','Taller formativo','Alojamiento','Empleo','Apoyo psicológico','Banco de alimentos','Documentación','Otro']
const TIPOS_ORG = [['ong','🏢 ONG / Entidad social'],['empresa','🏭 Empresa'],['administracion','🏛 Administración pública'],['gestor','👔 Gestoría / Despacho']]

type CampanaAd = { id:string; org_id:string; org_nombre:string; titulo:string; descripcion:string; cta:string; url:string; imagen_url?:string; tipo_pantalla:string; activo:boolean; status:string; duracion:string; precio_pagado:number; fecha_inicio?:string; fecha_fin?:string; stripe_session_id?:string; created_at:string }
type ExpCV = { empresa:string; cargo:string; desde:string; hasta:string; descripcion:string }
type EduCV = { institucion:string; titulo:string; desde:string; hasta:string }
type IdiomaCV = { idioma:string; nivel:string }
type DatosCV = { telefono:string; linkedin:string; objetivo:string; habilidades:string; otros:string }
const EMPTY_EXP_CV: ExpCV = { empresa:'', cargo:'', desde:'', hasta:'', descripcion:'' }
const EMPTY_EDU_CV: EduCV = { institucion:'', titulo:'', desde:'', hasta:'' }
const NIVELES_IDIOMA = ['Básico','Intermedio','Avanzado','Nativo']
type FormAnuncio = { titulo:string; descripcion:string; cta:string; url:string; imagen_url:string; tipo_pantalla:string; duracion:string }
const EMPTY_ANUNCIO: FormAnuncio = { titulo:'', descripcion:'', cta:'Ver más', url:'', imagen_url:'', tipo_pantalla:'empleo', duracion:'semana' }
const PAQUETES_PUB = [
  { id:'semana', label:'1 semana', precio:99, desc:'7 días visible · ideal para probar', badge:'', color:'#eff6ff', border:'#bfdbfe' },
  { id:'mes', label:'1 mes', precio:299, desc:'30 días · máximo alcance · más popular', badge:'⭐ Popular', color:'#f0fdf4', border:'#059669' },
  { id:'mes_todas', label:'1 mes · todas las pantallas', precio:499, desc:'Empleo + Vivienda + Trámites a la vez', badge:'🔥 Pro', color:'#fffbeb', border:'#fde68a' },
]
const PANTALLAS_AD = [
  { id:'empleo', label:'💼 Empleo', desc:'Audiencia: buscadores de trabajo' },
  { id:'vivienda', label:'🏠 Vivienda', desc:'Audiencia: personas buscando piso' },
  { id:'tramites', label:'📋 Trámites', desc:'Audiencia: en proceso de regularización' },
]

function getDayLabel(fecha: string): { label:string; color:string; bg:string } {
  const hoy = new Date(new Date().toDateString())
  const d = new Date(fecha + 'T00:00:00')
  const diff = Math.round((d.getTime() - hoy.getTime()) / (1000*60*60*24))
  if (diff === 0) return { label:'Hoy', color:'#d97706', bg:'#fef3c7' }
  if (diff === 1) return { label:'Mañana', color:'#1d4ed8', bg:'#dbeafe' }
  if (diff > 1 && diff <= 7) return { label:`En ${diff} días`, color:'#059669', bg:'#d1fae5' }
  if (diff > 7) return { label:`${new Date(fecha+'T00:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short'})}`, color:'#6b7280', bg:'#f3f4f6' }
  return { label:`Hace ${Math.abs(diff)} día${Math.abs(diff)!==1?'s':''}`, color:'#991b1b', bg:'#fee2e2' }
}

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

const btn: React.CSSProperties = { width:'100%', background:'#2563EB', color:'#fff', border:'none', borderRadius:14, padding:'14px 0', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }

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
  const [userPlan, setUserPlan] = useState<'free'|'premium'>('free')
  const [chatUsadoHoy, setChatUsadoHoy] = useState(0)
  const [premiumLoading, setPremiumLoading] = useState(false)
  const [premiumSuccess, setPremiumSuccess] = useState(false)
  const CHAT_LIMITE_FREE = 5
  const [citas, setCitas] = useState<Cita[]>([])
  const [citaSaving, setCitaSaving] = useState(false)
  const [formCita, setFormCita] = useState<FormCita>(EMPTY_CITA)
  const [ratingsMap, setRatingsMap] = useState<Record<string, RatingInfo>>({})
  const [misRatings, setMisRatings] = useState<Record<string, number>>({})
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [formAlerta, setFormAlerta] = useState<FormAlerta>(EMPTY_ALERTA)
  const [alertaSaving, setAlertaSaving] = useState(false)
  const [miOrg, setMiOrg] = useState<Organizacion | null>(null)
  const [orgLoading, setOrgLoading] = useState(false)
  const [orgSaving, setOrgSaving] = useState(false)
  const [recursosOng, setRecursosOng] = useState<RecursoOng[]>([])
  const [recursosPublicos, setRecursosPublicos] = useState<RecursoOng[]>([])
  const [anunciosNativos, setAnunciosNativos] = useState<AnuncioNativo[]>([])
  const [formOrg, setFormOrg] = useState<FormOrg>(EMPTY_ORG)
  const [formRecurso, setFormRecurso] = useState<FormRecurso>(EMPTY_RECURSO)
  const [recursoSaving, setRecursoSaving] = useState(false)
  const [b2bSuccess, setB2bSuccess] = useState(false)
  const [misAnuncios, setMisAnuncios] = useState<CampanaAd[]>([])
  const [formAnuncio, setFormAnuncio] = useState<FormAnuncio>(EMPTY_ANUNCIO)
  const [anuncioSaving, setAnuncioSaving] = useState(false)
  const [adSuccess, setAdSuccess] = useState(false)
  const [adsPendientes, setAdsPendientes] = useState<CampanaAd[]>([])
  const [adminStats, setAdminStats] = useState<{ totalUsuarios:number; activosHoy:number; totalMensajes:number; totalOrgs:number; totalEmpleos:number; totalViviendas:number } | null>(null)
  const [datosCV, setDatosCV] = useState<DatosCV>({ telefono:'', linkedin:'', objetivo:'', habilidades:'', otros:'' })
  const [expCV, setExpCV] = useState<ExpCV[]>([{ ...EMPTY_EXP_CV }])
  const [eduCV, setEduCV] = useState<EduCV[]>([{ ...EMPTY_EDU_CV }])
  const [idiomasCV, setIdiomasCV] = useState<IdiomaCV[]>([{ idioma:'Español', nivel:'Nativo' }])
  const [cvResult, setCvResult] = useState('')
  const [cvLoading, setCvLoading] = useState(false)
  const [cvCopiado, setCvCopiado] = useState(false)

  useEffect(() => {
    const key = 'chat_' + new Date().toDateString()
    setChatUsadoHoy(parseInt(localStorage.getItem(key) || '0'))
    const params = new URLSearchParams(window.location.search)
    if (params.get('premium') === 'success') {
      setPremiumSuccess(true)
      window.history.replaceState({}, '', '/')
    }
    if (params.get('b2b') === 'success') {
      setB2bSuccess(true)
      window.history.replaceState({}, '', '/')
    }
    if (params.get('portal') === 'registro-ong') {
      setPantalla('ong-registro')
      window.history.replaceState({}, '', '/')
    }
    if (params.get('ad') === 'success') {
      setAdSuccess(true)
      setPantalla('ong-anuncios')
      window.history.replaceState({}, '', '/')
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const email = data.session?.user?.email ?? null
      setUserEmail(email)
      if (data.session?.user) {
        setUserId(data.session.user.id)
        await loadProfile(data.session.user.id)
        await fetchDbListings(data.session.user.id)
        fetchMensajesNoLeidos(data.session.user.id)
        fetchCitas(data.session.user.id)
        fetchValoraciones()
        fetchAlertas(data.session.user.id)
        fetchMiOrg(data.session.user.id)
        fetchRecursosPublicos()
        fetchAnunciosNativos()
      } else setSessionLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, session) => {
      setUserEmail(session?.user?.email ?? null)
      if (session?.user) {
        setUserId(session.user.id)
        await loadProfile(session.user.id)
        await fetchDbListings(session.user.id)
        fetchMensajesNoLeidos(session.user.id)
        fetchCitas(session.user.id)
        fetchValoraciones()
        fetchAlertas(session.user.id)
        fetchMiOrg(session.user.id)
        fetchRecursosPublicos()
        fetchAnunciosNativos()
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
    if (!r.ok) {
      const err = await r.json().catch(() => ({}))
      alert(`Error al cargar pendientes (${r.status}): ${err.error || 'Sin detalle'}`)
      return
    }
    const d = await r.json()
    setPendienteEmpleos(d.empleos ?? [])
    setPendienteViviendas(d.viviendas ?? [])
  }

  async function fetchAdminStats() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const r = await fetch('/api/admin/stats', { headers: { authorization: `Bearer ${session.access_token}` } })
    if (!r.ok) return
    const d = await r.json()
    setAdminStats(d)
  }

  async function moderate(table: string, id: string, action: 'aprobar' | 'rechazar' | 'destacar' | 'no-destacar') {
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
      const newMsg = payload.new as ChatMsg
      setComunidadMsgs(prev => [...prev, newMsg])
      setTimeout(() => comunidadBottomRef.current?.scrollIntoView({ behavior:'smooth' }), 50)
      if (newMsg.user_id !== userId) {
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
          const o = ctx.createOscillator()
          const g = ctx.createGain()
          o.connect(g); g.connect(ctx.destination)
          o.frequency.setValueAtTime(880, ctx.currentTime)
          o.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15)
          g.gain.setValueAtTime(0.3, ctx.currentTime)
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)
          o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.25)
        } catch {}
      }
    }).subscribe()
    return () => { if (channel) supabase.removeChannel(channel) }
  }, [pantalla])

  async function sendComunidad() {
    if (!comunidadMsg.trim() || comunidadSending || !userId || !userEmail) return
    setComunidadSending(true)
    const texto = comunidadMsg.trim()
    setComunidadMsg('')
    const { error } = await supabase.from('chat_comunidad').insert({ user_id:userId, user_email:userEmail, nombre:editNombre||null, mensaje:texto })
    if (error) { alert('Error al enviar el mensaje: ' + error.message); setComunidadMsg(texto) }
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
    const { error } = await supabase.from('mensajes_privados').insert({ from_user_id:userId, from_nombre:editNombre||null, from_email:userEmail, to_user_id:convActiva.user_id, to_nombre:convActiva.nombre, to_email:convActiva.email, mensaje:texto, leido:false })
    if (error) { alert('Error al enviar el mensaje: ' + error.message); setConvMsg(texto) }
    else await fetchConversacion(userId, convActiva.user_id)
    setConvSending(false)
  }

  function abrirConversacion(otro: {user_id:string; nombre:string; email:string}) {
    setConvActiva(otro)
    setPantalla('conversacion')
    if (userId) fetchConversacion(userId, otro.user_id)
  }

  async function fetchCitas(uid: string) {
    const { data } = await supabase.from('citas').select('*').eq('user_id', uid).order('fecha', { ascending:true })
    setCitas(data ?? [])
  }

  async function saveCita() {
    if (!formCita.titulo.trim() || !formCita.fecha || !userId) return
    setCitaSaving(true)
    try {
      const { error } = await supabase.from('citas').insert({
        user_id: userId,
        tipo: formCita.tipo,
        titulo: formCita.titulo.trim(),
        fecha: formCita.fecha,
        hora: formCita.hora || null,
        lugar: formCita.lugar.trim() || null,
        notas: formCita.notas.trim() || null,
        completada: false,
      })
      if (error) throw error
      setFormCita(EMPTY_CITA)
      setPantalla('citas')
      await fetchCitas(userId)
    } catch { alert('Error al guardar la cita') }
    setCitaSaving(false)
  }

  async function toggleCitaCompletada(id: string, val: boolean) {
    await supabase.from('citas').update({ completada: val }).eq('id', id)
    if (userId) await fetchCitas(userId)
  }

  async function deleteCita(id: string) {
    if (!confirm('¿Eliminar esta cita?')) return
    await supabase.from('citas').delete().eq('id', id)
    if (userId) await fetchCitas(userId)
  }

  async function fetchValoraciones() {
    const { data } = await supabase.from('valoraciones').select('item_id, estrellas, user_id')
    if (!data) return
    const sums: Record<string, { sum:number; count:number }> = {}
    data.forEach(v => {
      if (!sums[v.item_id]) sums[v.item_id] = { sum:0, count:0 }
      sums[v.item_id].sum += v.estrellas
      sums[v.item_id].count++
    })
    const result: Record<string, RatingInfo> = {}
    Object.keys(sums).forEach(k => { result[k] = { avg: sums[k].sum / sums[k].count, count: sums[k].count } })
    setRatingsMap(result)
    if (userId) {
      const mine: Record<string, number> = {}
      data.filter(v => v.user_id === userId).forEach(v => { mine[v.item_id] = v.estrellas })
      setMisRatings(mine)
    }
  }

  async function rateItem(tabla: string, itemId: string, estrellas: number) {
    if (!userId) return
    await supabase.from('valoraciones').upsert({ user_id:userId, tabla, item_id:itemId, estrellas }, { onConflict:'user_id,item_id' })
    setMisRatings(prev => ({ ...prev, [itemId]: estrellas }))
    fetchValoraciones()
  }

  async function fetchAlertas(uid: string) {
    const { data } = await supabase.from('alertas').select('*').eq('user_id', uid)
    setAlertas(data ?? [])
  }

  async function saveAlerta() {
    if (!userId) return
    setAlertaSaving(true)
    try {
      await supabase.from('alertas').insert({
        user_id: userId, tipo: formAlerta.tipo,
        sector: formAlerta.sector || null,
        ciudad: formAlerta.ciudad || null,
        precio_max: formAlerta.precio_max ? Number(formAlerta.precio_max) : null,
      })
      setFormAlerta(EMPTY_ALERTA)
      await fetchAlertas(userId)
    } catch { alert('Error al guardar alerta') }
    setAlertaSaving(false)
  }

  async function deleteAlerta(id: string) {
    await supabase.from('alertas').delete().eq('id', id)
    if (userId) await fetchAlertas(userId)
  }

  async function fetchMiOrg(uid: string) {
    setOrgLoading(true)
    const { data } = await supabase.from('organizaciones').select('*').eq('user_id', uid).maybeSingle()
    if (data) {
      setMiOrg(data)
      setFormOrg({ nombre:data.nombre, tipo:data.tipo, descripcion:data.descripcion, ciudad:data.ciudad, web:data.web||'', telefono:data.telefono||'', email_contacto:data.email_contacto })
      const { data: recursos } = await supabase.from('recursos_ong').select('*').eq('org_id', data.id).order('created_at', { ascending:false })
      setRecursosOng(recursos ?? [])
    }
    setOrgLoading(false)
  }

  async function saveOrg() {
    if (!formOrg.nombre.trim() || !formOrg.descripcion.trim() || !formOrg.ciudad.trim() || !formOrg.email_contacto.trim() || !userId) return
    setOrgSaving(true)
    try {
      if (miOrg) {
        await supabase.from('organizaciones').update({ nombre:formOrg.nombre, tipo:formOrg.tipo, descripcion:formOrg.descripcion, ciudad:formOrg.ciudad, web:formOrg.web||null, telefono:formOrg.telefono||null, email_contacto:formOrg.email_contacto }).eq('id', miOrg.id)
      } else {
        const { data } = await supabase.from('organizaciones').insert({ user_id:userId, nombre:formOrg.nombre, tipo:formOrg.tipo, descripcion:formOrg.descripcion, ciudad:formOrg.ciudad, web:formOrg.web||null, telefono:formOrg.telefono||null, email_contacto:formOrg.email_contacto, plan:'free', verificada:false }).select().single()
        if (data) setMiOrg(data)
      }
      await fetchMiOrg(userId)
      setPantalla('ong-dashboard')
    } catch { alert('Error al guardar') }
    setOrgSaving(false)
  }

  async function fetchRecursosPublicos() {
    const { data } = await supabase.from('recursos_ong').select('*').eq('activo', true).order('created_at', { ascending:false }).limit(20)
    setRecursosPublicos(data ?? [])
  }

  async function fetchAnunciosNativos() {
    const { data } = await supabase.from('anuncios_nativos').select('*').eq('activo', true)
    setAnunciosNativos(data ?? [])
  }

  async function saveRecurso() {
    if (!formRecurso.titulo.trim() || !formRecurso.descripcion.trim() || !formRecurso.ciudad.trim() || !miOrg) return
    setRecursoSaving(true)
    try {
      await supabase.from('recursos_ong').insert({ org_id:miOrg.id, org_nombre:miOrg.nombre, org_verificada:miOrg.verificada, tipo:formRecurso.tipo, titulo:formRecurso.titulo.trim(), descripcion:formRecurso.descripcion.trim(), ciudad:formRecurso.ciudad.trim(), direccion:formRecurso.direccion||null, horario:formRecurso.horario||null, telefono:formRecurso.telefono||null, email:formRecurso.email||null, web:formRecurso.web||null, gratuito:formRecurso.gratuito, activo:true })
      setFormRecurso(EMPTY_RECURSO)
      if (userId) await fetchMiOrg(userId)
      await fetchRecursosPublicos()
      setPantalla('ong-recursos')
    } catch { alert('Error al guardar recurso') }
    setRecursoSaving(false)
  }

  async function deleteRecurso(id: string) {
    if (!confirm('¿Eliminar este recurso?')) return
    await supabase.from('recursos_ong').delete().eq('id', id)
    if (userId) await fetchMiOrg(userId)
    await fetchRecursosPublicos()
  }

  async function iniciarPagoB2B(plan: string) {
    setOrgSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const r = await fetch('/api/stripe/checkout-b2b', { method:'POST', headers:{ 'Content-Type':'application/json', authorization:`Bearer ${session.access_token}` }, body:JSON.stringify({ plan, email:userEmail, org_id:miOrg?.id }) })
      const d = await r.json()
      if (d.url) window.location.href = d.url
    } catch { alert('Error al iniciar el pago') }
    setOrgSaving(false)
  }

  async function fetchMisAnuncios() {
    if (!miOrg) return
    const { data } = await supabase.from('anuncios_nativos').select('*').eq('org_id', miOrg.id).order('created_at', { ascending:false })
    setMisAnuncios(data ?? [])
  }

  async function fetchAdsPendientes() {
    const { data } = await supabase.from('anuncios_nativos').select('*').eq('status', 'pendiente_revision').order('created_at', { ascending:true })
    setAdsPendientes(data ?? [])
  }

  async function moderateAd(id: string, action: 'aprobar' | 'rechazar') {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    await fetch('/api/admin/moderate-ad', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ id, action }),
    })
    await fetchAdsPendientes()
    await fetchAnunciosNativos()
  }

  async function iniciarPagoAnuncio() {
    if (!formAnuncio.titulo.trim() || !formAnuncio.descripcion.trim() || !formAnuncio.url.trim() || !miOrg) return
    setAnuncioSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const paquete = PAQUETES_PUB.find(p => p.id === formAnuncio.duracion)!
      const r = await fetch('/api/stripe/checkout-ad', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', authorization:`Bearer ${session.access_token}` },
        body: JSON.stringify({
          org_id: miOrg.id,
          org_nombre: miOrg.nombre,
          titulo: formAnuncio.titulo.trim(),
          descripcion: formAnuncio.descripcion.trim(),
          cta: formAnuncio.cta.trim() || 'Ver más',
          url: formAnuncio.url.trim(),
          imagen_url: formAnuncio.imagen_url.trim() || null,
          tipo_pantalla: formAnuncio.duracion === 'mes_todas' ? 'todas' : formAnuncio.tipo_pantalla,
          duracion: formAnuncio.duracion,
          precio: paquete.precio,
          email: userEmail,
        })
      })
      const d = await r.json()
      if (d.url) window.location.href = d.url
      else alert(`Error: ${d.error || 'No se pudo iniciar el pago'}`)
    } catch { alert('Error al iniciar el pago del anuncio') }
    setAnuncioSaving(false)
  }

  useEffect(() => {
    if (!userId) return
    if (pantalla === 'mensajes') fetchConversaciones(userId)
    if (pantalla === 'conversacion' && convActiva) fetchConversacion(userId, convActiva.user_id)
    if (pantalla === 'citas') fetchCitas(userId)
    if (pantalla === 'alertas') fetchAlertas(userId)
    if (pantalla === 'empleo' || pantalla === 'vivienda') fetchValoraciones()
    if (pantalla === 'ong-dashboard' || pantalla === 'ong-recursos') fetchMiOrg(userId)
    if (pantalla === 'ong-anuncios') { fetchMiOrg(userId); fetchMisAnuncios() }
    if (pantalla === 'admin') { fetchAdsPendientes(); fetchPendientes() }
    if (pantalla === 'tramites') fetchRecursosPublicos()
  }, [pantalla])

  async function loadProfile(userId: string) {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
      if (data) { setEditNombre(data.nombre||''); setEditPais(data.pais||''); setEditCiudad(data.ciudad||''); setEditSituacion(data.situacion||''); setUserPlan(data.plan||'free') }
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
    if (userPlan === 'free' && chatUsadoHoy >= CHAT_LIMITE_FREE) { setPantalla('premium'); return }
    const nc = [...chat, { role:'user', content:msg }]
    setChat(nc); setMsg(''); setChatLoading(true)
    const newCount = chatUsadoHoy + 1
    setChatUsadoHoy(newCount)
    localStorage.setItem('chat_' + new Date().toDateString(), String(newCount))
    try {
      const r = await fetch('/api/chat', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ messages:nc }) })
      const d = await r.json()
      setChat([...nc, { role:'assistant', content:d.content }])
    } catch { setChat([...nc, { role:'assistant', content:'Error al conectar.' }]) }
    setChatLoading(false)
  }

  async function iniciarPago() {
    setPremiumLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const r = await fetch('/api/stripe/checkout', { method:'POST', headers:{ 'Content-Type':'application/json', authorization:`Bearer ${session.access_token}` }, body:JSON.stringify({ email:userEmail }) })
      const d = await r.json()
      if (d.url) window.location.href = d.url
    } catch { alert('Error al iniciar el pago') }
    setPremiumLoading(false)
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

  const dbEmpleosFiltrados = [...dbEmpleos].sort((a,b) => (b.destacado?1:0)-(a.destacado?1:0)).filter(e => {
    const q = busqEmp.toLowerCase()
    return (!q || e.empresa.toLowerCase().includes(q) || e.sector.toLowerCase().includes(q) || e.ciudad.toLowerCase().includes(q))
      && (sectorFilt==='Todos'||e.sector===sectorFilt) && (ciudadEmpFilt==='Todas'||e.ciudad===ciudadEmpFilt)
      && (!soloArraigo||e.arraigo) && (!soloPrecontrato||e.precontrato)
  })

  const dbViviendosFiltradas = [...dbViviendas].sort((a,b) => (b.destacado?1:0)-(a.destacado?1:0)).filter(v => {
    const q = busqViv.toLowerCase()
    return (!q || v.titulo.toLowerCase().includes(q) || v.ciudad.toLowerCase().includes(q) || v.barrio.toLowerCase().includes(q))
      && (ciudadVivFilt==='Todas'||v.ciudad===ciudadVivFilt) && (tipoVivFilt==='Todos'||v.tipo===tipoVivFilt)
      && (!soloSinNomina||v.sin_nomina) && v.precio<=precioMax
  })

  const citasProximas = citas.filter(c => !c.completada && new Date(c.fecha + 'T00:00:00') >= new Date(new Date().toDateString()))

  function empMatchesAlerta(e: DbEmpleo) {
    return alertas.some(a => a.tipo==='empleo' && (!a.sector || a.sector===e.sector) && (!a.ciudad || a.ciudad===e.ciudad))
  }
  function vivMatchesAlerta(v: DbVivienda) {
    return alertas.some(a => a.tipo==='vivienda' && (!a.ciudad || a.ciudad===v.ciudad) && (!a.precio_max || v.precio<=a.precio_max))
  }
  const alertasMatchEmp = dbEmpleos.filter(empMatchesAlerta).length
  const alertasMatchViv = dbViviendas.filter(vivMatchesAlerta).length

  function Stars({ id, tabla, canRate }: { id:string; tabla:string; canRate:boolean }) {
    const r = ratingsMap[id]
    const mine = misRatings[id] || 0
    return (
      <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:8 }}>
        <div style={{ display:'flex', gap:2 }}>
          {[1,2,3,4,5].map(n => (
            <span key={n} onClick={() => canRate && rateItem(tabla, id, n)} style={{ fontSize:16, cursor:canRate?'pointer':'default', color: (canRate ? mine : (r?.avg||0)) >= n ? '#f59e0b' : '#d1d5db', transition:'color 0.1s' }}>★</span>
          ))}
        </div>
        {r && <span style={{ fontSize:11, color:'#6b7280' }}>{r.avg.toFixed(1)} ({r.count})</span>}
        {!r && canRate && <span style={{ fontSize:11, color:'#9ca3af' }}>Sin valoraciones aún</span>}
      </div>
    )
  }

  const wrap: React.CSSProperties = { maxWidth:480, margin:'0 auto', height:'100dvh', display:'flex', flexDirection:'column', background:'#F1F5F9' }

  if (sessionLoading) return (
    <div style={{ ...wrap, alignItems:'center', justifyContent:'center' }}>
      <img src="/logo.png" alt="UnidosPorTi" style={{ width:120, height:120, objectFit:'contain', marginBottom:16 }} />
      <p style={{ color:'#9ca3af', fontSize:14 }}>Cargando...</p>
    </div>
  );

  if (!userEmail) return (
    <div style={{ ...wrap, overflowY:'auto', background:'#f0f4ff' }}>
      <div style={{ background:'linear-gradient(160deg,#1e40af 0%,#2563EB 50%,#3b82f6 100%)', padding:'52px 24px 36px', display:'flex', flexDirection:'column', alignItems:'center', gap:14, textAlign:'center' }}>
        <img src="/logo.png" alt="UnidosPorTi" style={{ width:160, height:160, objectFit:'contain' }} />
        <div>
          <p style={{ fontSize:17, color:'rgba(255,255,255,0.95)', margin:'0 0 8px', fontWeight:700 }}>Tu guía para vivir mejor en España 🇪🇸</p>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.75)', margin:0, lineHeight:1.6, maxWidth:300 }}>No importa si llevas un mes o tres años — estamos aquí para ayudarte</p>
        </div>
      </div>
      <div style={{ padding:'24px 18px 32px', display:'flex', flexDirection:'column', gap:10 }}>
        {[
          { icon:'📄', title:'Regulariza tu situación', desc:'Arraigo social, laboral y familiar — paso a paso' },
          { icon:'💼', title:'Trabajo para migrantes', desc:'Arraigo, precontrato, NIE en trámite — sin discriminación' },
          { icon:'🏡', title:'Vivienda sin barreras', desc:'Sin nómina, sin aval, sin discriminación' },
          { icon:'🤖', title:'Asistente IA 24/7', desc:'Resuelve tus dudas legales, laborales y de vivienda' },
          { icon:'🧮', title:'Calculadora de arraigo', desc:'Descubre qué tipo de regularización puedes pedir' },
          { icon:'📋', title:'Analiza tu contrato con IA', desc:'Detecta cláusulas abusivas antes de firmar' },
        ].map(({ icon, title, desc }) => (
          <div key={title} style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:14, padding:'13px 15px', display:'flex', gap:13, alignItems:'flex-start', boxShadow:'0 1px 2px rgba(15,23,42,0.04)' }}>
            <span style={{ fontSize:22, flexShrink:0, marginTop:1 }}>{icon}</span>
            <div>
              <p style={{ fontWeight:700, fontSize:14, color:'#0F172A', margin:'0 0 2px' }}>{title}</p>
              <p style={{ fontSize:12, color:'#64748B', margin:0, lineHeight:1.5 }}>{desc}</p>
            </div>
          </div>
        ))}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginTop:2 }}>
          {[{ n:'100%', label:'Gratis' },{ n:'24/7', label:'Disponible' },{ n:'0€', label:'Sin coste' }].map(({ n, label }) => (
            <div key={label} style={{ background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:14, padding:'12px 6px', textAlign:'center' }}>
              <p style={{ fontSize:18, fontWeight:900, color:'#2563EB', margin:'0 0 2px' }}>{n}</p>
              <p style={{ fontSize:11, color:'#64748B', margin:0 }}>{label}</p>
            </div>
          ))}
        </div>
        <button onClick={loginGoogle} disabled={authLoading} style={{ width:'100%', marginTop:6, background:'#fff', color:'#0F172A', border:'1.5px solid #E2E8F0', borderRadius:16, padding:'15px 0', fontSize:15, fontWeight:700, cursor:authLoading?'wait':'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:12, opacity:authLoading?0.7:1, boxShadow:'0 2px 8px rgba(15,23,42,0.08)' }}>
          <GoogleIcon />
          {authLoading ? 'Redirigiendo...' : 'Empezar gratis con Google'}
        </button>
        <p style={{ fontSize:11, color:'#9ca3af', textAlign:'center', margin:'2px 0 0' }}>Sin tarjeta · Sin publicidad · Tus datos protegidos</p>
      </div>
    </div>
  );

  return (
    <div style={wrap}>
      <header style={{ background:'#fff', borderBottom:'1px solid #E2E8F0', padding:'0 16px', paddingTop:'env(safe-area-inset-top, 0px)', height:'calc(56px + env(safe-area-inset-top, 0px))', display:'flex', alignItems:'flex-end', justifyContent:'space-between', paddingBottom:10, flexShrink:0, boxShadow:'0 1px 3px rgba(15,23,42,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <img src="/logo.png" alt="UnidosPorTi" style={{ width:36, height:36, objectFit:'contain' }} />
          <span style={{ fontWeight:800, fontSize:17, color:'#0F172A', letterSpacing:'-0.3px' }}>UnidosPorTi</span>
        </div>
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          <button onClick={() => setPantalla('citas')} style={{ background:'none', border:'none', cursor:'pointer', position:'relative' as const, padding:6, borderRadius:10 }}>
            <span style={{ fontSize:20 }}>📅</span>
            {citasProximas.length > 0 && <span style={{ position:'absolute' as const, top:2, right:2, background:'#2563EB', color:'#fff', borderRadius:'50%', width:14, height:14, fontSize:9, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>{citasProximas.length}</span>}
          </button>
          <button onClick={() => setPantalla('mensajes')} style={{ background:'none', border:'none', cursor:'pointer', position:'relative' as const, padding:6, borderRadius:10 }}>
            <span style={{ fontSize:20 }}>✉️</span>
            {mensajesNoLeidos > 0 && <span style={{ position:'absolute' as const, top:2, right:2, background:'#7c3aed', color:'#fff', borderRadius:'50%', width:14, height:14, fontSize:9, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>{mensajesNoLeidos}</span>}
          </button>
          <button onClick={() => setPantalla('notificaciones')} style={{ background:'none', border:'none', cursor:'pointer', position:'relative' as const, padding:6, borderRadius:10 }}>
            <span style={{ fontSize:20 }}>🔔</span>
            {notifCount > 0 && <span style={{ position:'absolute' as const, top:2, right:2, background:'#ef4444', color:'#fff', borderRadius:'50%', width:14, height:14, fontSize:9, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>{notifCount}</span>}
          </button>
          <button onClick={() => setPantalla('perfil')} style={{ background:'#2563EB', border:'none', borderRadius:'50%', width:34, height:34, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <span style={{ color:'#fff', fontWeight:800, fontSize:14 }}>{editNombre ? editNombre.trim()[0].toUpperCase() : userEmail ? userEmail[0].toUpperCase() : '?'}</span>
          </button>
        </div>
      </header>

      <div style={{ flex:1, overflowY:'auto', paddingBottom:'calc(72px + env(safe-area-inset-bottom, 0px))' }}>

        {pantalla === 'inicio' && (
          <div style={{ padding:'16px 16px', display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ background:'linear-gradient(135deg,#1e40af 0%,#2563EB 60%,#3b82f6 100%)', borderRadius:20, padding:'22px 24px', color:'#fff', position:'relative' as const, overflow:'hidden' }}>
              <div style={{ position:'absolute' as const, top:-20, right:-20, width:120, height:120, background:'rgba(255,255,255,0.06)', borderRadius:'50%' }} />
              <div style={{ position:'absolute' as const, bottom:-30, right:20, width:80, height:80, background:'rgba(255,255,255,0.04)', borderRadius:'50%' }} />
              <p style={{ fontSize:12, opacity:0.8, margin:'0 0 4px', letterSpacing:'0.3px' }}>Hola {editNombre ? `${editNombre.split(' ')[0]} 👋` : '👋'}</p>
              <h1 style={{ fontSize:22, fontWeight:800, margin:'0 0 6px', letterSpacing:'-0.5px' }}>¿En qué te ayudamos hoy?</h1>
              <p style={{ fontSize:13, opacity:0.85, margin:0, lineHeight:1.5 }}>Todo lo que necesitas para vivir mejor en España</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { id:'empleo', icon:'💼', label:'Trabajo', sub:`${dbEmpleos.length} ofertas activas`, accent:'#059669' },
                { id:'vivienda', icon:'🏡', label:'Vivienda', sub:`${dbViviendas.length} disponibles`, accent:'#D97706' },
                { id:'chat', icon:'🤖', label:'Chat IA', sub:'Dudas al instante', accent:'#7c3aed' },
                { id:'tramites', icon:'📋', label:'Trámites', sub:'Arraigo y papeles', accent:'#2563EB' },
              ].map(({ id, icon, label, sub, accent }) => (
                <button key={id} onClick={() => setPantalla(id as Pantalla)} style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:18, padding:'18px 16px', textAlign:'left', cursor:'pointer', fontFamily:'inherit', boxShadow:'0 1px 3px rgba(15,23,42,0.07)', position:'relative' as const, overflow:'hidden' }}>
                  <div style={{ position:'absolute' as const, top:0, left:0, right:0, height:3, background:accent, borderRadius:'18px 18px 0 0' }} />
                  <div style={{ fontSize:28, marginBottom:10 }}>{icon}</div>
                  <p style={{ fontWeight:700, fontSize:14, margin:'0 0 3px', color:'#0F172A' }}>{label}</p>
                  <p style={{ fontSize:11, color:'#94A3B8', margin:0 }}>{sub}</p>
                </button>
              ))}
            </div>
            <div>
              <p style={{ fontSize:12, fontWeight:700, color:'#94A3B8', margin:'0 0 8px', textTransform:'uppercase' as const, letterSpacing:'0.8px' }}>Herramientas con IA</p>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {[
                  { id:'calculadora', icon:'🧮', label:'Calculadora de Arraigo', desc:'¿Puedes regularizarte ya?' },
                  { id:'contrato', icon:'📄', label:'Analiza tu Contrato', desc:'Detecta cláusulas abusivas' },
                  { id:'nomina', icon:'💰', label:'Explica tu Nómina', desc:'Entiende cada línea del recibo' },
                ].map(({ id, icon, label, desc }) => (
                  <button key={id} onClick={() => setPantalla(id as Pantalla)} style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:14, padding:'13px 14px', textAlign:'left', cursor:'pointer', fontFamily:'inherit', display:'flex', gap:12, alignItems:'center', boxShadow:'0 1px 2px rgba(15,23,42,0.04)' }}>
                    <span style={{ fontSize:22 }}>{icon}</span>
                    <div style={{ flex:1 }}>
                      <p style={{ fontWeight:600, fontSize:14, color:'#0F172A', margin:0 }}>{label}</p>
                      <p style={{ fontSize:12, color:'#64748B', margin:0 }}>{desc}</p>
                    </div>
                    <span style={{ color:'#CBD5E1', fontSize:16 }}>›</span>
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setPantalla('citas')} style={{ background:'#f0f9ff', border:'1px solid #bae6fd', borderRadius:16, padding:'14px 16px', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:13, textAlign:'left' as const, width:'100%' }}>
              <span style={{ fontSize:26 }}>📅</span>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:700, fontSize:14, color:'#0c4a6e', margin:'0 0 2px' }}>Mis Citas y Recordatorios</p>
                <p style={{ fontSize:12, color:'#0369a1', margin:0 }}>
                  {citasProximas.length > 0 ? `${citasProximas.length} cita${citasProximas.length!==1?'s':''} próxima${citasProximas.length!==1?'s':''}` : 'Sin citas próximas'}
                </p>
              </div>
              {citasProximas.length > 0 && (
                <span style={{ background:'#0284c7', color:'#fff', borderRadius:'50%', width:24, height:24, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0 }}>{citasProximas.length}</span>
              )}
              <span style={{ color:'#9ca3af', fontSize:16 }}>→</span>
            </button>
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
            <div style={{ background:'linear-gradient(135deg,#1e40af,#2563EB)', borderRadius:20, padding:'24px', textAlign:'center', color:'#fff' }}>
              <div style={{ width:64, height:64, background:'rgba(255,255,255,0.2)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px', fontSize:28, fontWeight:800 }}>{editNombre ? editNombre.trim()[0].toUpperCase() : userEmail ? userEmail[0].toUpperCase() : '?'}</div>
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
            <button onClick={() => setPantalla('alertas')} style={{ background:'#f0f9ff', border:'1px solid #bae6fd', borderRadius:14, padding:'14px 16px', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:12, textAlign:'left' as const, width:'100%' }}>
              <span style={{ fontSize:24 }}>🔔</span>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:700, fontSize:14, color:'#0c4a6e', margin:0 }}>Mis alertas personalizadas</p>
                <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>{alertas.length} alerta{alertas.length !== 1 ? 's' : ''} activa{alertas.length !== 1 ? 's' : ''}</p>
              </div>
              <span style={{ color:'#9ca3af' }}>→</span>
            </button>
            <button onClick={() => setPantalla(miOrg ? 'ong-dashboard' : 'ong-registro')} style={{ background: miOrg ? '#f0fdf4' : 'linear-gradient(135deg,#f0f9ff,#e0f2fe)', border:`1px solid ${miOrg?'#bbf7d0':'#bae6fd'}`, borderRadius:14, padding:'14px 16px', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:12, textAlign:'left' as const, width:'100%' }}>
              <span style={{ fontSize:24 }}>🏢</span>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:700, fontSize:14, color: miOrg ? '#065f46' : '#0c4a6e', margin:0 }}>
                  {miOrg ? `Portal: ${miOrg.nombre}` : 'Para ONGs y Empresas'}
                </p>
                <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>
                  {miOrg ? `Plan ${miOrg.plan} · ${recursosOng.length} recurso${recursosOng.length!==1?'s':''}` : 'Publica recursos y llega a miles de migrantes'}
                </p>
              </div>
              <span style={{ color:'#9ca3af' }}>→</span>
            </button>
            <button onClick={() => { setCvResult(''); setPantalla('cv-generador') }} style={{ background:'linear-gradient(135deg,#ecfdf5,#d1fae5)', border:'1px solid #6ee7b7', borderRadius:14, padding:'14px 16px', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:12, textAlign:'left' as const, width:'100%' }}>
              <span style={{ fontSize:24 }}>📄</span>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:700, fontSize:14, color:'#065f46', margin:0 }}>Genera tu Currículum</p>
                <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>Crea un CV profesional con IA en segundos</p>
              </div>
              <span style={{ background:'#059669', color:'#fff', fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:10 }}>IA</span>
            </button>
            <button onClick={() => setPantalla('tramites')} style={{ background:'#faf5ff', border:'1px solid #e9d5ff', borderRadius:14, padding:'14px 16px', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:12, textAlign:'left' as const, width:'100%' }}>
              <span style={{ fontSize:24 }}>📋</span>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:700, fontSize:14, color:'#581c87', margin:0 }}>Trámites</p>
                <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>Guías de documentación y gestiones</p>
              </div>
              <span style={{ color:'#9ca3af' }}>→</span>
            </button>
            <button onClick={() => setPantalla('chat')} style={{ background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:14, padding:'14px 16px', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:12, textAlign:'left' as const, width:'100%' }}>
              <span style={{ fontSize:24 }}>🤖</span>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:700, fontSize:14, color:'#7c2d12', margin:0 }}>Chat IA</p>
                <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>Resuelve tus dudas con inteligencia artificial</p>
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
            <button onClick={logout} style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:14, padding:'13px 16px', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:12, textAlign:'left' as const, width:'100%' }}>
              <span style={{ fontSize:20 }}>🚪</span>
              <p style={{ fontWeight:600, fontSize:14, color:'#ef4444', margin:0 }}>Cerrar sesión</p>
            </button>
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
            {!adminStats && (
              <button onClick={fetchAdminStats} style={{ ...btn, background:'#312e81' }}>Cargar estadísticas reales →</button>
            )}
            {adminStats && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { n: String(adminStats.totalUsuarios), label:'Usuarios', icon:'👥' },
                { n: String(adminStats.activosHoy), label:'Activos hoy', icon:'🟢' },
                { n: String(adminStats.totalMensajes), label:'Mensajes comunidad', icon:'💬' },
                { n: String(adminStats.totalOrgs), label:'ONGs', icon:'🏛️' },
                { n: String(adminStats.totalEmpleos), label:'Empleos activos', icon:'💼' },
                { n: String(adminStats.totalViviendas), label:'Viviendas activas', icon:'🏠' },
              ].map(({ n, label, icon }) => (
                <div key={label} style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:'14px', textAlign:'center' }}>
                  <p style={{ fontSize:24, margin:'0 0 4px' }}>{icon}</p>
                  <p style={{ fontWeight:900, fontSize:22, color:'#2563EB', margin:'0 0 2px' }}>{n}</p>
                  <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>{label}</p>
                </div>
              ))}
            </div>
            )}
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
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={() => moderate('empleos_usuarios', e.id, 'aprobar')} disabled={moderandoId===e.id} style={{ flex:2, background:'#065f46', color:'#fff', border:'none', borderRadius:10, padding:'8px 0', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', opacity:moderandoId===e.id?0.6:1 }}>✅ Aprobar</button>
                    <button onClick={() => moderate('empleos_usuarios', e.id, 'rechazar')} disabled={moderandoId===e.id} style={{ flex:2, background:'#dc2626', color:'#fff', border:'none', borderRadius:10, padding:'8px 0', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', opacity:moderandoId===e.id?0.6:1 }}>❌ Rechazar</button>
                    <button onClick={() => moderate('empleos_usuarios', e.id, e.destacado?'no-destacar':'destacar')} disabled={moderandoId===e.id} style={{ flex:1, background:e.destacado?'#fef3c7':'#f3f4f6', color:e.destacado?'#92400e':'#374151', border:'none', borderRadius:10, padding:'8px 0', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>{e.destacado?'★':'☆'}</button>
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
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={() => moderate('viviendas_usuarios', v.id, 'aprobar')} disabled={moderandoId===v.id} style={{ flex:2, background:'#065f46', color:'#fff', border:'none', borderRadius:10, padding:'8px 0', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', opacity:moderandoId===v.id?0.6:1 }}>✅ Aprobar</button>
                    <button onClick={() => moderate('viviendas_usuarios', v.id, 'rechazar')} disabled={moderandoId===v.id} style={{ flex:2, background:'#dc2626', color:'#fff', border:'none', borderRadius:10, padding:'8px 0', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', opacity:moderandoId===v.id?0.6:1 }}>❌ Rechazar</button>
                    <button onClick={() => moderate('viviendas_usuarios', v.id, v.destacado?'no-destacar':'destacar')} disabled={moderandoId===v.id} style={{ flex:1, background:v.destacado?'#fef3c7':'#f3f4f6', color:v.destacado?'#92400e':'#374151', border:'none', borderRadius:10, padding:'8px 0', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>{v.destacado?'★':'☆'}</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <p style={{ fontWeight:700, fontSize:15, margin:0, color:'#111' }}>📣 Anuncios pendientes de revisión</p>
                <button onClick={fetchAdsPendientes} style={{ fontSize:12, color:'#d97706', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:600 }}>Actualizar</button>
              </div>
              {adsPendientes.length === 0 && (
                <p style={{ fontSize:13, color:'#9ca3af', margin:0, textAlign:'center', padding:'12px 0' }}>No hay anuncios pendientes ✅</p>
              )}
              {adsPendientes.map(ad => (
                <div key={ad.id} style={{ borderBottom:'1px solid #f3f4f6', padding:'12px 0' }}>
                  <span style={{ fontSize:10, background:'#fffbeb', color:'#92400e', padding:'2px 6px', borderRadius:8, fontWeight:700 }}>ANUNCIO NATIVO</span>
                  <p style={{ fontWeight:700, fontSize:14, color:'#111', margin:'4px 0 2px' }}>{ad.titulo}</p>
                  <p style={{ fontSize:12, color:'#6b7280', margin:'0 0 2px' }}>{ad.descripcion}</p>
                  <p style={{ fontSize:11, color:'#6b7280', margin:'0 0 6px' }}>Pantalla: {ad.tipo_pantalla} · {ad.duracion} · {ad.precio_pagado}€ · {ad.org_nombre}</p>
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={() => moderateAd(ad.id, 'aprobar')} style={{ flex:2, background:'#065f46', color:'#fff', border:'none', borderRadius:10, padding:'8px 0', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>✅ Activar</button>
                    <button onClick={() => moderateAd(ad.id, 'rechazar')} style={{ flex:2, background:'#dc2626', color:'#fff', border:'none', borderRadius:10, padding:'8px 0', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>❌ Rechazar</button>
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
                <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>{dbEmpleosFiltrados.length} ofertas encontradas</p>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={() => setPantalla('alertas')} style={{ background: alertasMatchEmp>0?'#dbeafe':'#f0fdf4', color: alertasMatchEmp>0?'#1d4ed8':'#065f46', border:'none', borderRadius:20, padding:'6px 12px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                    🔔{alertas.filter(a=>a.tipo==='empleo').length > 0 ? ` ${alertas.filter(a=>a.tipo==='empleo').length}` : ''}
                  </button>
                  <button onClick={() => setPantalla('publicar-empleo')} style={{ background:'#065f46', color:'#fff', border:'none', borderRadius:20, padding:'6px 14px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>+ Publicar</button>
                </div>
              </div>
              {dbEmpleosFiltrados.length === 0 && <div style={{ textAlign:'center', padding:'40px 20px' }}><p style={{ fontSize:32 }}>🔍</p><p style={{ color:'#6b7280', fontSize:14 }}>No hay ofertas publicadas aún. ¡Sé el primero en publicar!</p></div>}
              {anunciosNativos.filter(a => a.tipo_pantalla === 'empleo' || a.tipo_pantalla === 'todas').map(ad => (
                <div key={ad.id} style={{ border:'1px solid #93c5fd', borderRadius:16, overflow:'hidden' }}>
                  {ad.imagen_url && <img src={ad.imagen_url} alt={ad.titulo} style={{ width:'100%', maxHeight:160, objectFit:'cover', display:'block' }} />}
                  <div style={{ background: ad.imagen_url ? '#fff' : 'linear-gradient(135deg,#eff6ff,#dbeafe)', padding:'12px 14px' }}>
                    <span style={{ fontSize:10, background:'#1B4FCC', color:'#fff', padding:'2px 8px', borderRadius:10, fontWeight:700 }}>Patrocinado · {ad.org_nombre}</span>
                    <p style={{ fontWeight:700, fontSize:14, color:'#1e3a8a', margin:'8px 0 4px' }}>{ad.titulo}</p>
                    <p style={{ fontSize:13, color:'#374151', margin:'0 0 10px', lineHeight:1.5 }}>{ad.descripcion}</p>
                    <a href={ad.url} target="_blank" rel="noopener noreferrer" style={{ display:'block', background:'#1B4FCC', color:'#fff', borderRadius:10, padding:'9px 0', fontSize:13, fontWeight:700, textDecoration:'none', textAlign:'center' as const }}>{ad.cta} →</a>
                  </div>
                </div>
              ))}
              {dbEmpleosFiltrados.length > 0 && (
                <>
                  <p style={{ fontSize:11, fontWeight:700, color:'#6b7280', textTransform:'uppercase' as const, letterSpacing:1, margin:'4px 0 0' }}>Publicadas por la comunidad</p>
                  {dbEmpleosFiltrados.map(e => (
                    <div key={e.id} style={{ background:'#fff', border:`1px solid ${empMatchesAlerta(e)?'#93c5fd':e.destacado?'#fcd34d':'#E2E8F0'}`, borderRadius:16, padding:16, boxShadow:'0 1px 3px rgba(15,23,42,0.07)' }}>
                      <div style={{ display:'flex', gap:6, marginBottom:6 }}>
                        {e.destacado && <div style={{ background:'#fef3c7', borderRadius:10, padding:'4px 10px', fontSize:11, fontWeight:700, color:'#92400e' }}>⭐ Destacado</div>}
                        {empMatchesAlerta(e) && <div style={{ background:'#dbeafe', borderRadius:10, padding:'4px 10px', fontSize:11, fontWeight:700, color:'#1d4ed8' }}>🔔 Coincide con tu alerta</div>}
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                        <div>
                          <p style={{ fontWeight:700, fontSize:15, margin:'0 0 3px', color:'#0F172A' }}>{e.empresa}</p>
                          <p style={{ fontSize:12, color:'#64748B', margin:0 }}>{e.sector} · {e.ciudad} · {e.jornada}</p>
                        </div>
                        <span style={{ fontWeight:700, color:'#059669', fontSize:15, flexShrink:0, background:'#F0FDF4', padding:'4px 10px', borderRadius:20 }}>{e.salario}<span style={{ fontSize:11, fontWeight:500, color:'#6b7280' }}>/mes</span></span>
                      </div>
                      <p style={{ fontSize:13, color:'#374151', margin:'0 0 10px', lineHeight:1.5 }}>{e.desc}</p>
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap' as const, marginBottom:8 }}>
                        {e.arraigo && <Badge text="✓ Acepta arraigo" color="green" />}
                        {e.precontrato && <Badge text="✓ Firma precontrato" color="blue" />}
                        {e.nie && <Badge text="✓ NIE en trámite OK" color="orange" />}
                      </div>
                      <Stars id={e.id} tabla="empleos_usuarios" canRate={e.user_id !== userId} />
                      <div style={{ display:'flex', gap:8, marginTop:12 }}>
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
                <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>{dbViviendosFiltradas.length} viviendas encontradas</p>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={() => setPantalla('alertas')} style={{ background: alertasMatchViv>0?'#dbeafe':'#fffbeb', color: alertasMatchViv>0?'#1d4ed8':'#92400e', border:'none', borderRadius:20, padding:'6px 12px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                    🔔{alertas.filter(a=>a.tipo==='vivienda').length > 0 ? ` ${alertas.filter(a=>a.tipo==='vivienda').length}` : ''}
                  </button>
                  <button onClick={() => setPantalla('publicar-vivienda')} style={{ background:'#d97706', color:'#fff', border:'none', borderRadius:20, padding:'6px 14px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>+ Publicar</button>
                </div>
              </div>
              {dbViviendosFiltradas.length === 0 && <div style={{ textAlign:'center', padding:'40px 20px' }}><p style={{ fontSize:32 }}>🔍</p><p style={{ color:'#6b7280', fontSize:14 }}>No hay viviendas publicadas aún. ¡Sé el primero en publicar!</p></div>}
              {anunciosNativos.filter(a => a.tipo_pantalla === 'vivienda' || a.tipo_pantalla === 'todas').map(ad => (
                <div key={ad.id} style={{ border:'1px solid #fcd34d', borderRadius:16, overflow:'hidden' }}>
                  {ad.imagen_url && <img src={ad.imagen_url} alt={ad.titulo} style={{ width:'100%', maxHeight:160, objectFit:'cover', display:'block' }} />}
                  <div style={{ background: ad.imagen_url ? '#fff' : 'linear-gradient(135deg,#fffbeb,#fef3c7)', padding:'12px 14px' }}>
                    <span style={{ fontSize:10, background:'#d97706', color:'#fff', padding:'2px 8px', borderRadius:10, fontWeight:700 }}>Patrocinado · {ad.org_nombre}</span>
                    <p style={{ fontWeight:700, fontSize:14, color:'#78350f', margin:'8px 0 4px' }}>{ad.titulo}</p>
                    <p style={{ fontSize:13, color:'#374151', margin:'0 0 10px', lineHeight:1.5 }}>{ad.descripcion}</p>
                    <a href={ad.url} target="_blank" rel="noopener noreferrer" style={{ display:'block', background:'#d97706', color:'#fff', borderRadius:10, padding:'9px 0', fontSize:13, fontWeight:700, textDecoration:'none', textAlign:'center' as const }}>{ad.cta} →</a>
                  </div>
                </div>
              ))}
              {dbViviendosFiltradas.length > 0 && (
                <>
                  <p style={{ fontSize:11, fontWeight:700, color:'#6b7280', textTransform:'uppercase' as const, letterSpacing:1, margin:'4px 0 0' }}>Publicadas por la comunidad</p>
                  {dbViviendosFiltradas.map(v => (
                    <div key={v.id} style={{ background:'#fff', border:`1px solid ${vivMatchesAlerta(v)?'#93c5fd':v.destacado?'#fcd34d':'#E2E8F0'}`, borderRadius:16, overflow:'hidden', boxShadow:'0 1px 3px rgba(15,23,42,0.07)' }}>
                      <div style={{ display:'flex', gap:6, padding:'6px 14px 0', flexWrap:'wrap' as const }}>
                        {v.destacado && <div style={{ background:'#fef3c7', borderRadius:10, padding:'3px 10px', fontSize:11, fontWeight:700, color:'#92400e' }}>⭐ Destacado</div>}
                        {vivMatchesAlerta(v) && <div style={{ background:'#dbeafe', borderRadius:10, padding:'3px 10px', fontSize:11, fontWeight:700, color:'#1d4ed8' }}>🔔 Coincide con tu alerta</div>}
                      </div>
                      <div style={{ padding:'14px 14px 0' }}>
                        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8, marginBottom:8 }}>
                          <div>
                            <span style={{ fontSize:11, background:'#FEF3C7', color:'#92400e', padding:'3px 8px', borderRadius:20, fontWeight:700 }}>{v.tipo}</span>
                            <p style={{ fontWeight:700, fontSize:15, color:'#0F172A', margin:'6px 0 0' }}>{v.titulo}</p>
                          </div>
                          <span style={{ fontWeight:700, color:'#D97706', fontSize:17, flexShrink:0, background:'#FFFBEB', padding:'4px 10px', borderRadius:20 }}>{v.precio}€<span style={{ fontSize:10, fontWeight:500, color:'#9ca3af' }}>/mes</span></span>
                        </div>
                      </div>
                      <div style={{ padding:14 }}>
                        <div style={{ marginBottom:8 }}>
                          <p style={{ fontSize:12, color:'#64748B', margin:0 }}>📍 {v.barrio}, {v.ciudad}</p>
                        </div>
                        <p style={{ fontSize:13, color:'#374151', margin:'0 0 10px', lineHeight:1.5 }}>{v.desc}</p>
                        <div style={{ display:'flex', gap:6, flexWrap:'wrap' as const, marginBottom:4 }}>
                          {v.sin_nomina && <Badge text="✓ Sin nómina" color="green" />}
                          {v.extranjeros && <Badge text="✓ Acepta extranjeros" color="blue" />}
                          <Badge text={`Fianza: ${v.fianza} mes`} color="gray" />
                          {v.m2 && <Badge text={`${v.m2}m²`} color="gray" />}
                        </div>
                        <Stars id={v.id} tabla="viviendas_usuarios" canRate={v.user_id !== userId} />
                        <div style={{ display:'flex', gap:8, marginTop:12 }}>
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
            {userPlan === 'free' && chatUsadoHoy >= CHAT_LIMITE_FREE ? (
              <div style={{ padding:'12px 16px', background:'#fef3c7', borderTop:'1px solid #fde68a', flexShrink:0 }}>
                <p style={{ fontSize:13, fontWeight:700, color:'#92400e', margin:'0 0 8px', textAlign:'center' }}>Has usado tus {CHAT_LIMITE_FREE} mensajes gratuitos de hoy</p>
                <button onClick={() => setPantalla('premium')} style={{ ...btn, background:'linear-gradient(135deg,#f59e0b,#d97706)', fontSize:13 }}>✨ Hazte Premium — mensajes ilimitados →</button>
              </div>
            ) : (
              <div style={{ padding:'12px 16px', background:'#fff', borderTop:'1px solid #e5e7eb', flexShrink:0 }}>
                {userPlan === 'free' && (
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                    <p style={{ fontSize:11, color:'#9ca3af', margin:0 }}>{chatUsadoHoy}/{CHAT_LIMITE_FREE} mensajes hoy (plan gratuito)</p>
                    <button onClick={() => setPantalla('premium')} style={{ fontSize:11, color:'#f59e0b', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:700 }}>✨ Hazte Premium</button>
                  </div>
                )}
                <div style={{ display:'flex', gap:8 }}>
                  <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key==='Enter' && send()} placeholder="Escribe tu pregunta..." style={{ flex:1, border:'1px solid #d1d5db', borderRadius:24, padding:'10px 16px', fontSize:14, outline:'none', fontFamily:'inherit' }} />
                  <button onClick={send} disabled={chatLoading} style={{ width:44, height:44, background:'#1B4FCC', border:'none', borderRadius:'50%', color:'#fff', fontSize:18, cursor:'pointer', flexShrink:0, opacity:chatLoading?0.5:1 }}>➤</button>
                </div>
              </div>
            )}
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
            {recursosPublicos.length > 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <p style={{ fontSize:13, fontWeight:700, color:'#374151', margin:0 }}>🏢 Recursos de ONGs y Entidades</p>
                  <span style={{ fontSize:11, color:'#6b7280' }}>{recursosPublicos.length} disponibles</span>
                </div>
                {recursosPublicos.slice(0, 5).map(r => (
                  <div key={r.id} style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:14, padding:'12px 14px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3, flexWrap:'wrap' as const }}>
                          <span style={{ fontSize:11, background:'#eff6ff', color:'#1e40af', padding:'2px 8px', borderRadius:10, fontWeight:700 }}>{r.tipo}</span>
                          {r.gratuito && <span style={{ fontSize:11, background:'#f0fdf4', color:'#166534', padding:'2px 8px', borderRadius:10, fontWeight:700 }}>✓ Gratuito</span>}
                          {r.org_verificada && <span style={{ fontSize:11, background:'#fef3c7', color:'#92400e', padding:'2px 8px', borderRadius:10, fontWeight:700 }}>✓ Verificado</span>}
                        </div>
                        <p style={{ fontWeight:700, fontSize:14, color:'#111', margin:'0 0 2px' }}>{r.titulo}</p>
                        <p style={{ fontSize:12, color:'#6b7280', margin:'0 0 3px' }}>🏢 {r.org_nombre} · 📍 {r.ciudad}</p>
                        <p style={{ fontSize:12, color:'#374151', margin:0, lineHeight:1.4 }}>{r.descripcion}</p>
                        {r.horario && <p style={{ fontSize:11, color:'#6b7280', margin:'4px 0 0' }}>🕒 {r.horario}</p>}
                      </div>
                    </div>
                    {(r.telefono || r.email || r.web) && (
                      <div style={{ display:'flex', gap:6, marginTop:8, flexWrap:'wrap' as const }}>
                        {r.telefono && <a href={`tel:${r.telefono}`} style={{ background:'#f0fdf4', color:'#065f46', borderRadius:8, padding:'6px 10px', fontSize:12, fontWeight:600, textDecoration:'none' }}>📞 Llamar</a>}
                        {r.email && <a href={`mailto:${r.email}`} style={{ background:'#eff6ff', color:'#1e40af', borderRadius:8, padding:'6px 10px', fontSize:12, fontWeight:600, textDecoration:'none' }}>✉️ Email</a>}
                        {r.web && <a href={r.web} target="_blank" rel="noopener noreferrer" style={{ background:'#f3f4f6', color:'#374151', borderRadius:8, padding:'6px 10px', fontSize:12, fontWeight:600, textDecoration:'none' }}>🌐 Web</a>}
                      </div>
                    )}
                  </div>
                ))}
                {recursosPublicos.length > 5 && (
                  <p style={{ fontSize:12, color:'#1B4FCC', textAlign:'center', margin:0, fontWeight:600 }}>+{recursosPublicos.length - 5} recursos más disponibles</p>
                )}
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
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={() => setPantalla('empleo')} style={{ flex:1, background:'#eff6ff', color:'#1d4ed8', border:'1px solid #bfdbfe', borderRadius:10, padding:'8px 0', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Ver publicación →</button>
                      <button onClick={() => deleteMiEmpleo(e.id)} style={{ flex:1, background:'#fee2e2', color:'#991b1b', border:'none', borderRadius:10, padding:'8px 0', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Eliminar</button>
                    </div>
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
                    <div style={{ display:'flex', gap:8 }}>
                      <button onClick={() => setPantalla('vivienda')} style={{ flex:1, background:'#fffbeb', color:'#92400e', border:'1px solid #fde68a', borderRadius:10, padding:'8px 0', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Ver publicación →</button>
                      <button onClick={() => deleteMiVivienda(v.id)} style={{ flex:1, background:'#fee2e2', color:'#991b1b', border:'none', borderRadius:10, padding:'8px 0', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Eliminar</button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {pantalla === 'comunidad' && (
          <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#0a0a1a' }}>
            {/* Header estilo LatinChat */}
            <div style={{ background:'linear-gradient(180deg,#1a1a6e 0%,#0d0d4d 100%)', borderBottom:'2px solid #ffcc00', padding:'8px 12px', flexShrink:0 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:18 }}>💬</span>
                  <div>
                    <p style={{ color:'#ffcc00', fontSize:15, fontWeight:900, margin:0, letterSpacing:1, textShadow:'0 0 8px #ffcc00' }}>LatinChat</p>
                    <p style={{ color:'#aac4ff', fontSize:11, margin:0 }}>Sala: Migrantes en España · {comunidadMsgs.length > 0 ? `${new Set(comunidadMsgs.map(m=>m.user_id)).size} usuarios` : '0 usuarios'}</p>
                  </div>
                </div>
                <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                  <div style={{ width:8, height:8, background:'#00ff00', borderRadius:'50%', boxShadow:'0 0 6px #00ff00' }} />
                  <span style={{ color:'#00ff00', fontSize:11, fontWeight:700 }}>EN LÍNEA</span>
                </div>
              </div>
            </div>

            {/* Área de mensajes estilo terminal */}
            <div style={{ flex:1, overflowY:'auto', padding:'8px 10px', display:'flex', flexDirection:'column', gap:1, fontFamily:'monospace' }}>
              {comunidadMsgs.length === 0 && (
                <div style={{ paddingTop:20 }}>
                  <p style={{ color:'#555', fontSize:12, fontFamily:'monospace', margin:'0 0 4px' }}>*** Bienvenido a la sala "Migrantes en España" ***</p>
                  <p style={{ color:'#555', fontSize:12, fontFamily:'monospace', margin:'0 0 4px' }}>*** Sé el primero en escribir! ***</p>
                  <p style={{ color:'#226600', fontSize:12, fontFamily:'monospace', margin:0 }}>» Escribe tu primer mensaje abajo...</p>
                </div>
              )}
              {comunidadMsgs.map((m) => {
                const nombre = (m.nombre || m.user_email.split('@')[0]).split(' ')[0]
                const esMio = m.user_id === userId
                const hora = new Date(m.created_at).toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' })
                // Colores de nick estilo LatinChat (determinista según nombre)
                const nickColors = ['#ff9900','#00ccff','#ff66cc','#66ff66','#ff6666','#ffff00','#ff99cc','#99ffcc','#cc99ff','#ffcc66']
                const nickColor = esMio ? '#ffcc00' : nickColors[nombre.charCodeAt(0) % nickColors.length]
                return (
                  <div key={m.id} style={{ display:'flex', alignItems:'flex-start', gap:0, lineHeight:1.6 }}>
                    <span style={{ color:'#555', fontSize:11, flexShrink:0, marginRight:6, fontFamily:'monospace' }}>[{hora}]</span>
                    <span
                      style={{ color:nickColor, fontWeight:700, fontSize:13, flexShrink:0, marginRight:2, fontFamily:'monospace', cursor: esMio ? 'default' : 'pointer', textDecoration: esMio ? 'none' : 'underline' }}
                      onClick={() => !esMio && abrirConversacion({ user_id:m.user_id, nombre, email:m.user_email })}
                      title={esMio ? '' : `Enviar mensaje privado a ${nombre}`}
                    >{nombre}</span>
                    <span style={{ color:'#aaa', fontSize:13, marginRight:4, fontFamily:'monospace' }}>:</span>
                    <span style={{ color: esMio ? '#ffffff' : '#d4e8ff', fontSize:13, fontFamily:'monospace', wordBreak:'break-word' as const, flex:1 }}>{m.mensaje}</span>
                  </div>
                )
              })}
              <div ref={comunidadBottomRef} />
            </div>

            {/* Barra de entrada estilo LatinChat */}
            <div style={{ background:'#0d0d4d', borderTop:'2px solid #333399', padding:'8px 10px', flexShrink:0 }}>
              <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                <span style={{ color:'#ffcc00', fontSize:12, fontWeight:700, fontFamily:'monospace', flexShrink:0 }}>{editNombre ? editNombre.split(' ')[0] : 'Tú'}:</span>
                <input
                  value={comunidadMsg}
                  onChange={e => setComunidadMsg(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && !e.shiftKey && sendComunidad()}
                  placeholder="Escribe aquí y presiona Enter..."
                  style={{ flex:1, background:'#000033', border:'1px solid #333399', borderRadius:0, padding:'7px 10px', fontSize:13, outline:'none', fontFamily:'monospace', color:'#ffffff', caretColor:'#ffcc00' }}
                />
                <button
                  onClick={sendComunidad}
                  disabled={comunidadSending || !comunidadMsg.trim()}
                  style={{ background:'#333399', border:'1px solid #6666cc', color:'#ffcc00', fontWeight:700, fontSize:12, padding:'7px 14px', cursor:'pointer', fontFamily:'monospace', opacity:(comunidadSending||!comunidadMsg.trim())?0.4:1, flexShrink:0 }}
                >
                  ENVIAR
                </button>
              </div>
            </div>
          </div>
        )}

        {pantalla === 'premium' && (
          <div style={{ padding:16, display:'flex', flexDirection:'column', gap:16 }}>
            {premiumSuccess && (
              <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:16, padding:16, textAlign:'center' }}>
                <p style={{ fontSize:28, margin:'0 0 6px' }}>🎉</p>
                <p style={{ fontWeight:800, fontSize:16, color:'#065f46', margin:'0 0 4px' }}>¡Ya eres Premium!</p>
                <p style={{ fontSize:13, color:'#166534', margin:0 }}>Gracias por apoyar UnidosPorTi. Disfruta de todas las ventajas.</p>
              </div>
            )}
            <div style={{ background:'linear-gradient(135deg,#f59e0b,#d97706)', borderRadius:20, padding:'24px', textAlign:'center', color:'#fff' }}>
              <p style={{ fontSize:36, margin:'0 0 8px' }}>✨</p>
              <h2 style={{ fontSize:22, fontWeight:900, margin:'0 0 6px' }}>UnidosPorTi Premium</h2>
              <p style={{ fontSize:14, opacity:0.9, margin:0 }}>Todo lo que necesitas, sin límites</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { icon:'🤖', title:'Chat IA ilimitado', sub:'Sin límite diario de mensajes', premium:true },
                { icon:'⭐', title:'Badge Premium', sub:'Destaca en la comunidad', premium:true },
                { icon:'🔔', title:'Alertas prioritarias', sub:'Primero en enterarte', premium:true },
                { icon:'📋', title:'Publicaciones ilimitadas', sub:'Sin restricciones', premium:true },
              ].map(({ icon, title, sub }) => (
                <div key={title} style={{ background:'#fff', border:'1px solid #fde68a', borderRadius:16, padding:'14px 12px', textAlign:'center' }}>
                  <p style={{ fontSize:26, margin:'0 0 6px' }}>{icon}</p>
                  <p style={{ fontWeight:700, fontSize:13, color:'#111', margin:'0 0 2px' }}>{title}</p>
                  <p style={{ fontSize:11, color:'#6b7280', margin:0 }}>{sub}</p>
                </div>
              ))}
            </div>
            <div style={{ background:'#fff', border:'2px solid #f59e0b', borderRadius:20, padding:20, textAlign:'center' }}>
              <p style={{ fontSize:13, color:'#6b7280', margin:'0 0 4px' }}>Plan mensual</p>
              <p style={{ fontSize:42, fontWeight:900, color:'#d97706', margin:'0 0 2px' }}>4,99€</p>
              <p style={{ fontSize:13, color:'#9ca3af', margin:'0 0 16px' }}>por mes · cancela cuando quieras</p>
              {userPlan === 'premium' ? (
                <div style={{ background:'#f0fdf4', borderRadius:12, padding:'12px', marginBottom:12 }}>
                  <p style={{ fontWeight:700, color:'#065f46', margin:0 }}>✅ Ya tienes Premium activo</p>
                </div>
              ) : (
                <button onClick={iniciarPago} disabled={premiumLoading} style={{ ...btn, background:'linear-gradient(135deg,#f59e0b,#d97706)', fontSize:16, padding:'16px 0', opacity:premiumLoading?0.7:1 }}>
                  {premiumLoading ? 'Redirigiendo...' : '✨ Hazte Premium →'}
                </button>
              )}
              <p style={{ fontSize:11, color:'#9ca3af', margin:'10px 0 0' }}>Pago seguro con Stripe · Cancela en cualquier momento</p>
            </div>
            <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:14, padding:14 }}>
              <p style={{ fontSize:13, fontWeight:700, color:'#92400e', margin:'0 0 8px' }}>¿Por qué pagar?</p>
              <p style={{ fontSize:12, color:'#92400e', margin:0, lineHeight:1.7 }}>
                UnidosPorTi es gratuita para todos. El plan Premium cubre el coste del Chat IA y nos permite seguir mejorando la app para ayudar a más migrantes en España. 💛
              </p>
            </div>
          </div>
        )}

        {pantalla === 'ong-registro' && (
          <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ background:'linear-gradient(135deg,#1B4FCC,#1e3a8a)', borderRadius:20, padding:'20px 24px', color:'#fff' }}>
              <button onClick={() => setPantalla('perfil')} style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:10, padding:'4px 10px', color:'#fff', fontSize:12, cursor:'pointer', fontFamily:'inherit', marginBottom:10 }}>← Volver</button>
              <h2 style={{ fontSize:20, fontWeight:800, margin:'0 0 4px' }}>🏢 Registro de Organización</h2>
              <p style={{ fontSize:13, opacity:0.9, margin:0 }}>Publica recursos y llega a miles de migrantes</p>
            </div>
            {b2bSuccess && (
              <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:14, padding:14 }}>
                <p style={{ fontSize:14, fontWeight:700, color:'#065f46', margin:0 }}>🎉 ¡Bienvenido al portal B2B! Tu suscripción está activa.</p>
              </div>
            )}
            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:16, display:'flex', flexDirection:'column', gap:14 }}>
              <p style={{ fontWeight:700, fontSize:14, color:'#111', margin:0 }}>Datos de tu organización</p>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 8px' }}>Tipo de organización</p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {TIPOS_ORG.map(([val, lab]) => (
                    <button key={val} onClick={() => setFormOrg(f => ({ ...f, tipo:val }))} style={{ background:formOrg.tipo===val?'#1B4FCC':'#f3f4f6', color:formOrg.tipo===val?'#fff':'#374151', border:'none', borderRadius:10, padding:'9px 6px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>{lab}</button>
                  ))}
                </div>
              </div>
              {[
                { label:'Nombre de la organización *', key:'nombre', ph:'Ej: Cruz Roja España' },
                { label:'Ciudad principal *', key:'ciudad', ph:'Ej: Madrid' },
                { label:'Email de contacto *', key:'email_contacto', ph:'info@tuorganizacion.org' },
                { label:'Teléfono', key:'telefono', ph:'+34 900 000 000' },
                { label:'Sitio web', key:'web', ph:'https://tuorganizacion.org' },
              ].map(({ label, key, ph }) => (
                <div key={key}>
                  <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 5px' }}>{label}</p>
                  <input value={(formOrg as any)[key]} onChange={e => setFormOrg(f => ({ ...f, [key]:e.target.value }))} placeholder={ph} style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:10, padding:'10px 12px', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
                </div>
              ))}
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 5px' }}>Descripción *</p>
                <textarea value={formOrg.descripcion} onChange={e => setFormOrg(f => ({ ...f, descripcion:e.target.value }))} placeholder="¿A qué se dedica tu organización? ¿A quién ayuda?" rows={3} style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:10, padding:'10px 12px', fontSize:13, fontFamily:'inherit', outline:'none', resize:'vertical', boxSizing:'border-box' as const }} />
              </div>
              <button onClick={saveOrg} disabled={orgSaving || !formOrg.nombre.trim() || !formOrg.descripcion.trim() || !formOrg.ciudad.trim() || !formOrg.email_contacto.trim()} style={{ ...btn, opacity:(orgSaving||!formOrg.nombre.trim()||!formOrg.descripcion.trim()||!formOrg.ciudad.trim()||!formOrg.email_contacto.trim())?0.5:1 }}>
                {orgSaving ? 'Guardando...' : miOrg ? '💾 Guardar cambios' : '🚀 Registrar organización →'}
              </button>
            </div>
          </div>
        )}

        {pantalla === 'ong-dashboard' && miOrg && (
          <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ background:'linear-gradient(135deg,#1B4FCC,#1e3a8a)', borderRadius:20, padding:'20px 24px', color:'#fff' }}>
              <button onClick={() => setPantalla('perfil')} style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:10, padding:'4px 10px', color:'#fff', fontSize:12, cursor:'pointer', fontFamily:'inherit', marginBottom:10 }}>← Volver</button>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <h2 style={{ fontSize:20, fontWeight:800, margin:'0 0 2px' }}>{miOrg.nombre}</h2>
                  <p style={{ fontSize:13, opacity:0.9, margin:0 }}>{TIPOS_ORG.find(t => t[0]===miOrg.tipo)?.[1] || miOrg.tipo}</p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <span style={{ fontSize:11, background:'rgba(255,255,255,0.25)', padding:'4px 10px', borderRadius:10, fontWeight:700 }}>Plan {miOrg.plan}</span>
                  {miOrg.verificada && <div style={{ fontSize:11, color:'#fde68a', marginTop:4 }}>✓ Verificada</div>}
                </div>
              </div>
            </div>
            {b2bSuccess && (
              <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:14, padding:14 }}>
                <p style={{ fontSize:14, fontWeight:700, color:'#065f46', margin:0 }}>🎉 ¡Suscripción activada! Tu plan está ahora activo.</p>
              </div>
            )}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { icon:'📋', val:String(recursosOng.length), label:'Recursos activos', bg:'#eff6ff', border:'#bfdbfe', color:'#1e40af' },
                { icon:'👁', val:miOrg.plan === 'premium' ? 'Ilimitadas' : '500+', label:'Visitas estimadas', bg:'#f0fdf4', border:'#bbf7d0', color:'#065f46' },
              ].map(({ icon, val, label, bg, border, color }) => (
                <div key={label} style={{ background:bg, border:`1px solid ${border}`, borderRadius:14, padding:'14px 12px', textAlign:'center' }}>
                  <p style={{ fontSize:22, margin:'0 0 4px' }}>{icon}</p>
                  <p style={{ fontWeight:800, fontSize:20, color, margin:'0 0 2px' }}>{val}</p>
                  <p style={{ fontSize:11, color:'#6b7280', margin:0 }}>{label}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setPantalla('ong-recursos')} style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:14, padding:'14px 16px', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:12, textAlign:'left' as const }}>
              <span style={{ fontSize:22 }}>📋</span>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:700, fontSize:14, color:'#1e3a8a', margin:0 }}>Gestionar recursos</p>
                <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>{recursosOng.length} recurso{recursosOng.length!==1?'s':''} publicado{recursosOng.length!==1?'s':''}</p>
              </div>
              <span style={{ color:'#9ca3af' }}>→</span>
            </button>
            <button onClick={() => { fetchMisAnuncios(); setPantalla('ong-anuncios') }} style={{ background:'linear-gradient(135deg,#fffbeb,#fef3c7)', border:'1px solid #fcd34d', borderRadius:14, padding:'14px 16px', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:12, textAlign:'left' as const }}>
              <span style={{ fontSize:22 }}>📣</span>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:700, fontSize:14, color:'#92400e', margin:0 }}>Publicidad segmentada</p>
                <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>{misAnuncios.filter(a=>a.activo).length} campaña{misAnuncios.filter(a=>a.activo).length!==1?'s':''} activa{misAnuncios.filter(a=>a.activo).length!==1?'s':''} · desde 99€</p>
              </div>
              <span style={{ color:'#9ca3af' }}>→</span>
            </button>
            <button onClick={() => setPantalla('ong-registro')} style={{ background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:14, padding:'14px 16px', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:12, textAlign:'left' as const }}>
              <span style={{ fontSize:22 }}>✏️</span>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:700, fontSize:14, color:'#374151', margin:0 }}>Editar perfil</p>
                <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>{miOrg.ciudad} · {miOrg.email_contacto}</p>
              </div>
              <span style={{ color:'#9ca3af' }}>→</span>
            </button>
            {miOrg.plan === 'free' && (
              <div style={{ background:'linear-gradient(135deg,#fffbeb,#fef3c7)', border:'1px solid #fde68a', borderRadius:18, padding:18 }}>
                <p style={{ fontWeight:800, fontSize:16, color:'#92400e', margin:'0 0 8px' }}>✨ Amplía tu alcance</p>
                <p style={{ fontSize:13, color:'#78350f', margin:'0 0 14px', lineHeight:1.5 }}>Con el plan de pago puedes publicar más recursos, aparecer destacado y llegar a más personas.</p>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {[
                    { plan:'basico', label:'Básico', precio:'49€/mes', desc:'Hasta 5 recursos, badge verificado' },
                    { plan:'estandar', label:'Estándar', precio:'149€/mes', desc:'Recursos ilimitados + anuncio nativo' },
                    { plan:'premium', label:'Premium', precio:'399€/mes', desc:'Todo + destacado en portada' },
                  ].map(({ plan, label, precio, desc }) => (
                    <button key={plan} onClick={() => iniciarPagoB2B(plan)} disabled={orgSaving} style={{ background:'#fff', border:'1px solid #fcd34d', borderRadius:12, padding:'12px 14px', cursor:'pointer', fontFamily:'inherit', textAlign:'left' as const, opacity:orgSaving?0.6:1 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <p style={{ fontWeight:700, fontSize:14, color:'#92400e', margin:0 }}>{label}</p>
                        <p style={{ fontWeight:800, fontSize:14, color:'#d97706', margin:0 }}>{precio}</p>
                      </div>
                      <p style={{ fontSize:12, color:'#6b7280', margin:'3px 0 0' }}>{desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {miOrg.plan !== 'free' && (
              <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:14, padding:14 }}>
                <p style={{ fontWeight:700, fontSize:14, color:'#065f46', margin:'0 0 4px' }}>✅ Plan {miOrg.plan} activo</p>
                <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>Contacta con soporte si necesitas cambiar tu plan.</p>
              </div>
            )}
          </div>
        )}

        {pantalla === 'ong-recursos' && miOrg && (
          <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ background:'linear-gradient(135deg,#059669,#065f46)', borderRadius:20, padding:'20px 24px', color:'#fff' }}>
              <button onClick={() => setPantalla('ong-dashboard')} style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:10, padding:'4px 10px', color:'#fff', fontSize:12, cursor:'pointer', fontFamily:'inherit', marginBottom:10 }}>← Volver</button>
              <h2 style={{ fontSize:20, fontWeight:800, margin:'0 0 4px' }}>📋 Recursos publicados</h2>
              <p style={{ fontSize:13, opacity:0.9, margin:0 }}>{miOrg.nombre}</p>
            </div>
            <button onClick={() => { setFormRecurso(EMPTY_RECURSO); setPantalla('ong-nuevo-recurso') }} style={{ ...btn, background:'#059669', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              + Nuevo recurso
            </button>
            {recursosOng.length === 0 && (
              <div style={{ textAlign:'center', padding:'40px 20px' }}>
                <p style={{ fontSize:40, margin:'0 0 8px' }}>📋</p>
                <p style={{ fontWeight:700, fontSize:15, color:'#111', margin:'0 0 4px' }}>Sin recursos todavía</p>
                <p style={{ fontSize:13, color:'#6b7280', margin:0 }}>Publica tu primer recurso para llegar a los migrantes</p>
              </div>
            )}
            {recursosOng.map(r => (
              <div key={r.id} style={{ background:'#fff', border:`1px solid ${r.activo?'#bbf7d0':'#e5e7eb'}`, borderRadius:16, padding:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', gap:6, marginBottom:4, flexWrap:'wrap' as const }}>
                      <span style={{ fontSize:11, background:'#eff6ff', color:'#1e40af', padding:'2px 8px', borderRadius:10, fontWeight:700 }}>{r.tipo}</span>
                      {r.gratuito && <span style={{ fontSize:11, background:'#f0fdf4', color:'#166534', padding:'2px 8px', borderRadius:10, fontWeight:700 }}>Gratuito</span>}
                      <span style={{ fontSize:11, background:r.activo?'#f0fdf4':'#f3f4f6', color:r.activo?'#166534':'#6b7280', padding:'2px 8px', borderRadius:10, fontWeight:700 }}>{r.activo?'✓ Activo':'Inactivo'}</span>
                    </div>
                    <p style={{ fontWeight:700, fontSize:14, color:'#111', margin:'0 0 2px' }}>{r.titulo}</p>
                    <p style={{ fontSize:12, color:'#6b7280', margin:'0 0 3px' }}>📍 {r.ciudad}{r.direccion?` · ${r.direccion}`:''}</p>
                    <p style={{ fontSize:12, color:'#374151', margin:0, lineHeight:1.4 }}>{r.descripcion}</p>
                  </div>
                </div>
                <button onClick={() => deleteRecurso(r.id)} style={{ marginTop:10, background:'#fee2e2', color:'#991b1b', border:'none', borderRadius:8, padding:'6px 12px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>🗑 Eliminar</button>
              </div>
            ))}
          </div>
        )}

        {pantalla === 'ong-nuevo-recurso' && miOrg && (
          <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ background:'linear-gradient(135deg,#059669,#065f46)', borderRadius:20, padding:'20px 24px', color:'#fff' }}>
              <button onClick={() => setPantalla('ong-recursos')} style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:10, padding:'4px 10px', color:'#fff', fontSize:12, cursor:'pointer', fontFamily:'inherit', marginBottom:10 }}>← Volver</button>
              <h2 style={{ fontSize:20, fontWeight:800, margin:'0 0 4px' }}>+ Nuevo Recurso</h2>
              <p style={{ fontSize:13, opacity:0.9, margin:0 }}>Será visible para todos los usuarios de la app</p>
            </div>
            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:16, display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 8px' }}>Tipo de recurso</p>
                <div style={{ display:'flex', flexWrap:'wrap' as const, gap:8 }}>
                  {TIPOS_RECURSO.map(t => (
                    <button key={t} onClick={() => setFormRecurso(f => ({ ...f, tipo:t }))} style={{ background:formRecurso.tipo===t?'#059669':'#f3f4f6', color:formRecurso.tipo===t?'#fff':'#374151', border:'none', borderRadius:20, padding:'7px 14px', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>{t}</button>
                  ))}
                </div>
              </div>
              {[
                { label:'Título del recurso *', key:'titulo', ph:'Ej: Asesoría jurídica gratuita para migrantes' },
                { label:'Ciudad *', key:'ciudad', ph:'Ej: Madrid' },
                { label:'Dirección', key:'direccion', ph:'Ej: Calle Mayor 10, bajo' },
                { label:'Horario', key:'horario', ph:'Ej: Lunes a viernes, 9:00-14:00' },
                { label:'Teléfono de contacto', key:'telefono', ph:'+34 900 000 000' },
                { label:'Email de contacto', key:'email', ph:'info@ong.org' },
                { label:'Web o más info', key:'web', ph:'https://...' },
              ].map(({ label, key, ph }) => (
                <div key={key}>
                  <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 5px' }}>{label}</p>
                  <input value={(formRecurso as any)[key]} onChange={e => setFormRecurso(f => ({ ...f, [key]:e.target.value }))} placeholder={ph} style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:10, padding:'10px 12px', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
                </div>
              ))}
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 5px' }}>Descripción *</p>
                <textarea value={formRecurso.descripcion} onChange={e => setFormRecurso(f => ({ ...f, descripcion:e.target.value }))} placeholder="Describe el servicio, quién puede acceder, requisitos..." rows={3} style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:10, padding:'10px 12px', fontSize:13, fontFamily:'inherit', outline:'none', resize:'vertical', boxSizing:'border-box' as const }} />
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <input type="checkbox" id="gratuito" checked={formRecurso.gratuito} onChange={e => setFormRecurso(f => ({ ...f, gratuito:e.target.checked }))} style={{ width:18, height:18 }} />
                <label htmlFor="gratuito" style={{ fontSize:14, color:'#374151', fontWeight:600, cursor:'pointer' }}>✓ Es un servicio gratuito</label>
              </div>
              <button onClick={saveRecurso} disabled={recursoSaving || !formRecurso.titulo.trim() || !formRecurso.descripcion.trim() || !formRecurso.ciudad.trim()} style={{ ...btn, background:'#059669', opacity:(recursoSaving||!formRecurso.titulo.trim()||!formRecurso.descripcion.trim()||!formRecurso.ciudad.trim())?0.5:1 }}>
                {recursoSaving ? 'Publicando...' : '📋 Publicar recurso →'}
              </button>
            </div>
          </div>
        )}

        {pantalla === 'ong-anuncios' && miOrg && (
          <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ background:'linear-gradient(135deg,#d97706,#92400e)', borderRadius:20, padding:'20px 24px', color:'#fff' }}>
              <button onClick={() => setPantalla('ong-dashboard')} style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:10, padding:'4px 10px', color:'#fff', fontSize:12, cursor:'pointer', fontFamily:'inherit', marginBottom:10 }}>← Volver</button>
              <h2 style={{ fontSize:20, fontWeight:800, margin:'0 0 4px' }}>📣 Publicidad segmentada</h2>
              <p style={{ fontSize:13, opacity:0.9, margin:0 }}>Llega exactamente a quien lo necesita · desde 99€</p>
            </div>
            {adSuccess && (
              <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:14, padding:14 }}>
                <p style={{ fontSize:14, fontWeight:700, color:'#065f46', margin:'0 0 2px' }}>🎉 ¡Pago recibido! Tu campaña está en revisión.</p>
                <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>La activaremos en menos de 24h. Te avisaremos por email.</p>
              </div>
            )}
            <button onClick={() => { setFormAnuncio(EMPTY_ANUNCIO); setPantalla('ong-nuevo-anuncio') }} style={{ ...btn, background:'#d97706', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              📣 + Nueva campaña
            </button>
            {misAnuncios.length === 0 && !adSuccess && (
              <div style={{ textAlign:'center', padding:'32px 20px' }}>
                <p style={{ fontSize:40, margin:'0 0 8px' }}>📣</p>
                <p style={{ fontWeight:700, fontSize:15, color:'#111', margin:'0 0 4px' }}>Sin campañas todavía</p>
                <p style={{ fontSize:13, color:'#6b7280', margin:'0 0 16px' }}>Crea tu primera campaña y llega a miles de migrantes segmentados por lo que buscan</p>
                <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:14, padding:14, textAlign:'left' as const }}>
                  <p style={{ fontWeight:700, fontSize:13, color:'#92400e', margin:'0 0 8px' }}>¿Por qué anunciarte aquí?</p>
                  {['10.000+ usuarios activos cada mes','Segmentación por pantalla: Empleo, Vivienda, Trámites','Público con alta intención: buscan activamente','Formatos nativos — no intrusivos, alta conversión','Sin contrato mínimo — paga por campaña'].map(item => (
                    <div key={item} style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:5 }}>
                      <span style={{ color:'#d97706', fontWeight:700, fontSize:12 }}>✓</span>
                      <p style={{ fontSize:12, color:'#374151', margin:0 }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {misAnuncios.length > 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <p style={{ fontSize:13, fontWeight:700, color:'#374151', margin:0 }}>Tus campañas</p>
                {misAnuncios.map(a => {
                  const statusColor = a.status==='activo'?{bg:'#f0fdf4',txt:'#065f46',label:'✓ Activo'} : a.status==='pendiente'?{bg:'#fef3c7',txt:'#92400e',label:'⏳ En revisión'} : a.status==='expirado'?{bg:'#f3f4f6',txt:'#6b7280',label:'Expirado'} : {bg:'#fee2e2',txt:'#991b1b',label:'Rechazado'}
                  const pantLabel = a.tipo_pantalla==='empleo'?'💼 Empleo':a.tipo_pantalla==='vivienda'?'🏠 Vivienda':a.tipo_pantalla==='tramites'?'📋 Trámites':'🌐 Todas'
                  return (
                    <div key={a.id} style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:14 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:'flex', gap:6, marginBottom:4, flexWrap:'wrap' as const }}>
                            <span style={{ fontSize:11, background:statusColor.bg, color:statusColor.txt, padding:'2px 8px', borderRadius:10, fontWeight:700 }}>{statusColor.label}</span>
                            <span style={{ fontSize:11, background:'#eff6ff', color:'#1e40af', padding:'2px 8px', borderRadius:10, fontWeight:600 }}>{pantLabel}</span>
                            <span style={{ fontSize:11, background:'#f3f4f6', color:'#374151', padding:'2px 8px', borderRadius:10, fontWeight:600 }}>{a.duracion==='semana'?'1 semana':a.duracion==='mes'?'1 mes':'1 mes · todas'}</span>
                          </div>
                          <p style={{ fontWeight:700, fontSize:14, color:'#111', margin:'0 0 2px' }}>{a.titulo}</p>
                          <p style={{ fontSize:12, color:'#6b7280', margin:'0 0 2px' }}>{a.descripcion}</p>
                          <p style={{ fontSize:11, color:'#1B4FCC', margin:0 }}>🔗 {a.url}</p>
                        </div>
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8, paddingTop:8, borderTop:'1px solid #f3f4f6' }}>
                        <p style={{ fontSize:11, color:'#6b7280', margin:0 }}>
                          {a.fecha_inicio && a.fecha_fin ? `${new Date(a.fecha_inicio).toLocaleDateString('es-ES',{day:'numeric',month:'short'})} → ${new Date(a.fecha_fin).toLocaleDateString('es-ES',{day:'numeric',month:'short'})}` : `Creado ${new Date(a.created_at).toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'})}`}
                        </p>
                        <p style={{ fontSize:12, fontWeight:700, color:'#d97706', margin:0 }}>{a.precio_pagado}€ pagados</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {pantalla === 'ong-nuevo-anuncio' && miOrg && (
          <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ background:'linear-gradient(135deg,#d97706,#92400e)', borderRadius:20, padding:'20px 24px', color:'#fff' }}>
              <button onClick={() => setPantalla('ong-anuncios')} style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:10, padding:'4px 10px', color:'#fff', fontSize:12, cursor:'pointer', fontFamily:'inherit', marginBottom:10 }}>← Volver</button>
              <h2 style={{ fontSize:20, fontWeight:800, margin:'0 0 4px' }}>📣 Nueva campaña</h2>
              <p style={{ fontSize:13, opacity:0.9, margin:0 }}>Tu anuncio aparecerá como card nativo en la pantalla elegida</p>
            </div>

            {/* Paso 1: Elige paquete */}
            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:16 }}>
              <p style={{ fontWeight:700, fontSize:14, color:'#111', margin:'0 0 12px' }}>1. Elige tu paquete</p>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {PAQUETES_PUB.map(p => (
                  <button key={p.id} onClick={() => setFormAnuncio(f => ({ ...f, duracion:p.id }))} style={{ background:formAnuncio.duracion===p.id?p.color:'#f9fafb', border:`2px solid ${formAnuncio.duracion===p.id?p.border:'#e5e7eb'}`, borderRadius:14, padding:'12px 14px', cursor:'pointer', fontFamily:'inherit', textAlign:'left' as const, transition:'all 0.15s' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <p style={{ fontWeight:700, fontSize:14, color:'#111', margin:0 }}>{p.label}</p>
                        {p.badge && <span style={{ fontSize:11, background:p.id==='mes'?'#059669':'#d97706', color:'#fff', padding:'2px 8px', borderRadius:10, fontWeight:700 }}>{p.badge}</span>}
                      </div>
                      <p style={{ fontWeight:800, fontSize:18, color:'#d97706', margin:0 }}>{p.precio}€</p>
                    </div>
                    <p style={{ fontSize:12, color:'#6b7280', margin:'4px 0 0' }}>{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Paso 2: Elige pantalla (no aplica si es mes_todas) */}
            {formAnuncio.duracion !== 'mes_todas' && (
              <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:16 }}>
                <p style={{ fontWeight:700, fontSize:14, color:'#111', margin:'0 0 12px' }}>2. Selecciona la pantalla</p>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {PANTALLAS_AD.map(p => (
                    <button key={p.id} onClick={() => setFormAnuncio(f => ({ ...f, tipo_pantalla:p.id }))} style={{ background:formAnuncio.tipo_pantalla===p.id?'#eff6ff':'#f9fafb', border:`2px solid ${formAnuncio.tipo_pantalla===p.id?'#1B4FCC':'#e5e7eb'}`, borderRadius:12, padding:'11px 14px', cursor:'pointer', fontFamily:'inherit', textAlign:'left' as const, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <p style={{ fontWeight:700, fontSize:14, color:'#111', margin:0 }}>{p.label}</p>
                      <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {formAnuncio.duracion === 'mes_todas' && (
              <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:14, padding:12 }}>
                <p style={{ fontSize:13, color:'#92400e', margin:0, fontWeight:600 }}>🌐 Tu anuncio aparecerá en Empleo + Vivienda + Trámites simultáneamente</p>
              </div>
            )}

            {/* Paso 3: Contenido del anuncio */}
            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:16, display:'flex', flexDirection:'column', gap:14 }}>
              <p style={{ fontWeight:700, fontSize:14, color:'#111', margin:0 }}>{formAnuncio.duracion !== 'mes_todas' ? '3' : '2'}. Contenido del anuncio</p>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 5px' }}>Título del anuncio * <span style={{ fontWeight:400, color:'#9ca3af' }}>(máx. 60 caracteres)</span></p>
                <input value={formAnuncio.titulo} onChange={e => setFormAnuncio(f => ({ ...f, titulo:e.target.value.slice(0,60) }))} placeholder="Ej: Asesoría gratis para tu arraigo social" style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:10, padding:'10px 12px', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
                <p style={{ fontSize:11, color:'#9ca3af', margin:'3px 0 0', textAlign:'right' as const }}>{formAnuncio.titulo.length}/60</p>
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 5px' }}>Descripción * <span style={{ fontWeight:400, color:'#9ca3af' }}>(máx. 120 caracteres)</span></p>
                <textarea value={formAnuncio.descripcion} onChange={e => setFormAnuncio(f => ({ ...f, descripcion:e.target.value.slice(0,120) }))} placeholder="Ej: Cruz Roja te ayuda con los trámites de forma gratuita. Sin cita previa." rows={2} style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:10, padding:'10px 12px', fontSize:13, fontFamily:'inherit', outline:'none', resize:'none', boxSizing:'border-box' as const }} />
                <p style={{ fontSize:11, color:'#9ca3af', margin:'3px 0 0', textAlign:'right' as const }}>{formAnuncio.descripcion.length}/120</p>
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 5px' }}>
                  🖼 Imagen del anuncio <span style={{ fontWeight:400, color:'#9ca3af' }}>(opcional — convierte en banner visual)</span>
                </p>
                <input value={formAnuncio.imagen_url} onChange={e => setFormAnuncio(f => ({ ...f, imagen_url:e.target.value }))} placeholder="https://tuempresa.com/imagen-banner.jpg" style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:10, padding:'10px 12px', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
                <p style={{ fontSize:11, color:'#6b7280', margin:'4px 0 0' }}>Recomendado: 800×400px JPG/PNG · Sin imagen = anuncio de texto (también funciona muy bien)</p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 5px' }}>Texto del botón</p>
                  <input value={formAnuncio.cta} onChange={e => setFormAnuncio(f => ({ ...f, cta:e.target.value.slice(0,30) }))} placeholder="Ver más" style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:10, padding:'10px 12px', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 5px' }}>URL de destino *</p>
                  <input value={formAnuncio.url} onChange={e => setFormAnuncio(f => ({ ...f, url:e.target.value }))} placeholder="https://..." style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:10, padding:'10px 12px', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
                </div>
              </div>
            </div>

            {/* Preview */}
            {formAnuncio.titulo && (
              <div>
                <p style={{ fontSize:12, fontWeight:600, color:'#6b7280', margin:'0 0 8px' }}>Vista previa:</p>
                <div style={{ border:'1px solid #93c5fd', borderRadius:16, overflow:'hidden' }}>
                  {formAnuncio.imagen_url && (
                    <img src={formAnuncio.imagen_url} alt="Banner" style={{ width:'100%', maxHeight:160, objectFit:'cover', display:'block' }} onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
                  )}
                  <div style={{ background: formAnuncio.imagen_url ? '#fff' : 'linear-gradient(135deg,#eff6ff,#dbeafe)', padding:'12px 14px' }}>
                    <span style={{ fontSize:10, background:'#1B4FCC', color:'#fff', padding:'2px 8px', borderRadius:10, fontWeight:700 }}>Patrocinado · {miOrg.nombre}</span>
                    <p style={{ fontWeight:700, fontSize:14, color:'#1e3a8a', margin:'8px 0 4px' }}>{formAnuncio.titulo}</p>
                    <p style={{ fontSize:13, color:'#374151', margin:'0 0 10px', lineHeight:1.5 }}>{formAnuncio.descripcion}</p>
                    <div style={{ background:'#1B4FCC', color:'#fff', borderRadius:10, padding:'9px 16px', fontSize:13, fontWeight:700, display:'inline-block' }}>{formAnuncio.cta || 'Ver más'} →</div>
                  </div>
                </div>
              </div>
            )}

            {/* Resumen y pago */}
            <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:16, padding:16 }}>
              <p style={{ fontWeight:700, fontSize:14, color:'#065f46', margin:'0 0 10px' }}>Resumen del pedido</p>
              {(() => { const p = PAQUETES_PUB.find(x => x.id===formAnuncio.duracion)!; return (
                <>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <p style={{ fontSize:13, color:'#374151', margin:0 }}>{p.label} · {formAnuncio.duracion!=='mes_todas' ? PANTALLAS_AD.find(x=>x.id===formAnuncio.tipo_pantalla)?.label : '🌐 Todas las pantallas'}</p>
                    <p style={{ fontWeight:700, fontSize:14, color:'#065f46', margin:0 }}>{p.precio}€</p>
                  </div>
                  <p style={{ fontSize:11, color:'#6b7280', margin:'4px 0 12px' }}>IVA incluido · Pago único · Sin renovación automática</p>
                  <button onClick={iniciarPagoAnuncio} disabled={anuncioSaving || !formAnuncio.titulo.trim() || !formAnuncio.descripcion.trim() || !formAnuncio.url.trim()} style={{ ...btn, background:'#d97706', opacity:(anuncioSaving||!formAnuncio.titulo.trim()||!formAnuncio.descripcion.trim()||!formAnuncio.url.trim())?0.5:1 }}>
                    {anuncioSaving ? 'Redirigiendo a Stripe...' : `💳 Pagar ${p.precio}€ y publicar →`}
                  </button>
                </>
              )})()}
            </div>
          </div>
        )}

        {pantalla === 'alertas' && (
          <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ background:'linear-gradient(135deg,#0284c7,#0369a1)', borderRadius:20, padding:'20px 24px', color:'#fff' }}>
              <button onClick={() => setPantalla('perfil')} style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:10, padding:'4px 10px', color:'#fff', fontSize:12, cursor:'pointer', fontFamily:'inherit', marginBottom:10 }}>← Volver</button>
              <h2 style={{ fontSize:20, fontWeight:800, margin:'0 0 4px' }}>🔔 Alertas personalizadas</h2>
              <p style={{ fontSize:13, opacity:0.9, margin:0 }}>Te avisamos cuando haya ofertas que coincidan con lo que buscas</p>
            </div>
            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:16, display:'flex', flexDirection:'column', gap:12 }}>
              <p style={{ fontWeight:700, fontSize:14, color:'#111', margin:0 }}>+ Nueva alerta</p>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 8px' }}>Tipo</p>
                <div style={{ display:'flex', gap:8 }}>
                  {[['empleo','💼 Empleo'],['vivienda','🏠 Vivienda']].map(([val,lab]) => (
                    <button key={val} onClick={() => setFormAlerta(f => ({ ...f, tipo:val }))} style={{ flex:1, background:formAlerta.tipo===val?'#0284c7':'#f3f4f6', color:formAlerta.tipo===val?'#fff':'#374151', border:'none', borderRadius:10, padding:'9px 0', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>{lab}</button>
                  ))}
                </div>
              </div>
              {formAlerta.tipo === 'empleo' && (
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 5px' }}>Sector (opcional)</p>
                  <select value={formAlerta.sector} onChange={e => setFormAlerta(f => ({ ...f, sector:e.target.value }))} style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:10, padding:'10px 12px', fontSize:14, fontFamily:'inherit', outline:'none', background:'#fff', boxSizing:'border-box' as const }}>
                    <option value="">Cualquier sector</option>
                    {SECTORES.filter(s => s !== 'Todos').map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}
              {formAlerta.tipo === 'vivienda' && (
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 5px' }}>Precio máximo (€/mes, opcional)</p>
                  <input type="number" value={formAlerta.precio_max} onChange={e => setFormAlerta(f => ({ ...f, precio_max:e.target.value }))} placeholder="Ej: 500" style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:10, padding:'10px 12px', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
                </div>
              )}
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 5px' }}>Ciudad (opcional)</p>
                <select value={formAlerta.ciudad} onChange={e => setFormAlerta(f => ({ ...f, ciudad:e.target.value }))} style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:10, padding:'10px 12px', fontSize:14, fontFamily:'inherit', outline:'none', background:'#fff', boxSizing:'border-box' as const }}>
                  <option value="">Cualquier ciudad</option>
                  {Array.from(new Set([...CIUDADES_EMP, ...CIUDADES_VIV])).filter(c => c !== 'Todas').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button onClick={saveAlerta} disabled={alertaSaving} style={{ ...btn, background:'#0284c7', opacity:alertaSaving?0.7:1 }}>
                {alertaSaving ? 'Guardando...' : '+ Añadir alerta'}
              </button>
            </div>
            {alertas.length === 0 && (
              <div style={{ textAlign:'center', padding:'32px 20px' }}>
                <p style={{ fontSize:36, margin:'0 0 8px' }}>🔔</p>
                <p style={{ fontWeight:700, fontSize:14, color:'#111', margin:'0 0 4px' }}>Sin alertas todavía</p>
                <p style={{ fontSize:13, color:'#6b7280', margin:0 }}>Crea una alerta y te destacaremos los anuncios que coincidan</p>
              </div>
            )}
            {alertas.length > 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <p style={{ fontSize:13, fontWeight:700, color:'#374151', margin:0 }}>Tus alertas activas</p>
                {alertas.map(a => (
                  <div key={a.id} style={{ background:'#fff', border:'1px solid #bae6fd', borderRadius:14, padding:'12px 14px', display:'flex', alignItems:'center', gap:12 }}>
                    <span style={{ fontSize:22 }}>{a.tipo === 'empleo' ? '💼' : '🏠'}</span>
                    <div style={{ flex:1 }}>
                      <p style={{ fontWeight:700, fontSize:13, color:'#111', margin:'0 0 2px' }}>
                        {a.tipo === 'empleo' ? 'Empleo' : 'Vivienda'}
                        {a.sector && ` · ${a.sector}`}
                        {a.ciudad && ` · ${a.ciudad}`}
                        {a.precio_max && ` · hasta ${a.precio_max}€`}
                      </p>
                      <p style={{ fontSize:11, color:'#0369a1', margin:0 }}>
                        {a.tipo === 'empleo'
                          ? `${dbEmpleos.filter(e => (!a.sector||a.sector===e.sector)&&(!a.ciudad||a.ciudad===e.ciudad)).length} oferta${dbEmpleos.filter(e => (!a.sector||a.sector===e.sector)&&(!a.ciudad||a.ciudad===e.ciudad)).length !== 1?'s':''} coincide${dbEmpleos.filter(e => (!a.sector||a.sector===e.sector)&&(!a.ciudad||a.ciudad===e.ciudad)).length !== 1?'n':''}`
                          : `${dbViviendas.filter(v => (!a.ciudad||a.ciudad===v.ciudad)&&(!a.precio_max||v.precio<=a.precio_max)).length} vivienda${dbViviendas.filter(v => (!a.ciudad||a.ciudad===v.ciudad)&&(!a.precio_max||v.precio<=a.precio_max)).length !== 1?'s':''} coincide${dbViviendas.filter(v => (!a.ciudad||a.ciudad===v.ciudad)&&(!a.precio_max||v.precio<=a.precio_max)).length !== 1?'n':''}`
                        }
                      </p>
                    </div>
                    <button onClick={() => deleteAlerta(a.id)} style={{ background:'#fee2e2', color:'#991b1b', border:'none', borderRadius:8, padding:'6px 10px', fontSize:12, cursor:'pointer', fontFamily:'inherit', fontWeight:700 }}>🗑</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {pantalla === 'citas' && (
          <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ background:'linear-gradient(135deg,#0284c7,#0369a1)', borderRadius:20, padding:'20px 24px', color:'#fff' }}>
              <h2 style={{ fontSize:20, fontWeight:800, margin:'0 0 4px' }}>📅 Mis Citas</h2>
              <p style={{ fontSize:13, opacity:0.9, margin:0 }}>
                {citasProximas.length > 0 ? `${citasProximas.length} cita${citasProximas.length!==1?'s':''} pendiente${citasProximas.length!==1?'s':''}` : 'Sin citas próximas'}
              </p>
            </div>
            <button onClick={() => { setFormCita(EMPTY_CITA); setPantalla('nueva-cita') }} style={{ ...btn, background:'#0284c7', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              + Nueva Cita
            </button>
            {citas.length === 0 && (
              <div style={{ textAlign:'center', padding:'40px 20px' }}>
                <p style={{ fontSize:40, margin:'0 0 8px' }}>📅</p>
                <p style={{ fontWeight:700, fontSize:15, color:'#111', margin:'0 0 4px' }}>Sin citas todavía</p>
                <p style={{ fontSize:13, color:'#6b7280', margin:0 }}>Añade tu primera cita o recordatorio</p>
              </div>
            )}
            {citas.length > 0 && (
              <>
                {citas.filter(c => !c.completada).length > 0 && (
                  <>
                    <p style={{ fontSize:13, fontWeight:700, color:'#374151', margin:0 }}>🔔 Pendientes</p>
                    {citas.filter(c => !c.completada).map(c => {
                      const day = getDayLabel(c.fecha)
                      const isVencida = new Date(c.fecha + 'T00:00:00') < new Date(new Date().toDateString())
                      return (
                        <div key={c.id} style={{ background:'#fff', border:`1px solid ${isVencida?'#fca5a5':'#e5e7eb'}`, borderRadius:16, padding:14 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                                <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, fontWeight:700, background:day.bg, color:day.color }}>{day.label}</span>
                                <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, fontWeight:600, background:'#f3f4f6', color:'#374151' }}>{c.tipo}</span>
                              </div>
                              <p style={{ fontWeight:700, fontSize:14, color:'#111', margin:'0 0 2px' }}>{c.titulo}</p>
                              <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>
                                {new Date(c.fecha+'T00:00:00').toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'})}
                                {c.hora && ` · ${c.hora}`}
                              </p>
                              {c.lugar && <p style={{ fontSize:12, color:'#6b7280', margin:'2px 0 0' }}>📍 {c.lugar}</p>}
                              {c.notas && <p style={{ fontSize:12, color:'#6b7280', margin:'4px 0 0', fontStyle:'italic' }}>{c.notas}</p>}
                            </div>
                          </div>
                          <div style={{ display:'flex', gap:8, marginTop:10 }}>
                            <button onClick={() => toggleCitaCompletada(c.id, true)} style={{ flex:1, background:'#dcfce7', color:'#166534', border:'none', borderRadius:10, padding:'8px 0', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>✅ Completada</button>
                            <button onClick={() => deleteCita(c.id)} style={{ background:'#fee2e2', color:'#991b1b', border:'none', borderRadius:10, padding:'8px 12px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>🗑</button>
                          </div>
                        </div>
                      )
                    })}
                  </>
                )}
                {citas.filter(c => c.completada).length > 0 && (
                  <>
                    <p style={{ fontSize:13, fontWeight:700, color:'#9ca3af', margin:'4px 0 0' }}>✅ Completadas</p>
                    {citas.filter(c => c.completada).map(c => (
                      <div key={c.id} style={{ background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:16, padding:14, opacity:0.7 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <div style={{ flex:1 }}>
                            <p style={{ fontWeight:700, fontSize:13, color:'#6b7280', margin:'0 0 2px', textDecoration:'line-through' }}>{c.titulo}</p>
                            <p style={{ fontSize:12, color:'#9ca3af', margin:0 }}>
                              {new Date(c.fecha+'T00:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'})}
                              {c.hora && ` · ${c.hora}`}
                            </p>
                          </div>
                          <div style={{ display:'flex', gap:6 }}>
                            <button onClick={() => toggleCitaCompletada(c.id, false)} style={{ background:'#dbeafe', color:'#1d4ed8', border:'none', borderRadius:8, padding:'6px 10px', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>↩</button>
                            <button onClick={() => deleteCita(c.id)} style={{ background:'#fee2e2', color:'#991b1b', border:'none', borderRadius:8, padding:'6px 10px', fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>🗑</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        )}

        {pantalla === 'nueva-cita' && (
          <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ background:'linear-gradient(135deg,#0284c7,#0369a1)', borderRadius:20, padding:'20px 24px', color:'#fff' }}>
              <button onClick={() => setPantalla('citas')} style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:10, padding:'4px 10px', color:'#fff', fontSize:12, cursor:'pointer', fontFamily:'inherit', marginBottom:10 }}>← Volver</button>
              <h2 style={{ fontSize:20, fontWeight:800, margin:'0 0 4px' }}>📅 Nueva Cita</h2>
              <p style={{ fontSize:13, opacity:0.9, margin:0 }}>Añade un recordatorio o cita importante</p>
            </div>
            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:16, display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 8px' }}>Tipo de cita</p>
                <div style={{ display:'flex', flexWrap:'wrap' as const, gap:8 }}>
                  {TIPOS_CITA.map(t => (
                    <button key={t} onClick={() => setFormCita(f => ({ ...f, tipo:t }))} style={{ background:formCita.tipo===t?'#0284c7':'#f3f4f6', color:formCita.tipo===t?'#fff':'#374151', border:'none', borderRadius:20, padding:'7px 14px', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 5px' }}>Título *</p>
                <input value={formCita.titulo} onChange={e => setFormCita(f => ({ ...f, titulo:e.target.value }))} placeholder="Ej: Cita en Extranjería para arraigo social" style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:10, padding:'10px 12px', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 5px' }}>Fecha *</p>
                  <input type="date" value={formCita.fecha} onChange={e => setFormCita(f => ({ ...f, fecha:e.target.value }))} style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:10, padding:'10px 12px', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 5px' }}>Hora</p>
                  <input type="time" value={formCita.hora} onChange={e => setFormCita(f => ({ ...f, hora:e.target.value }))} style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:10, padding:'10px 12px', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
                </div>
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 5px' }}>Lugar</p>
                <input value={formCita.lugar} onChange={e => setFormCita(f => ({ ...f, lugar:e.target.value }))} placeholder="Ej: Oficina de Extranjería, Calle Mayor 1" style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:10, padding:'10px 12px', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:'#374151', margin:'0 0 5px' }}>Notas</p>
                <textarea value={formCita.notas} onChange={e => setFormCita(f => ({ ...f, notas:e.target.value }))} placeholder="Documentos que necesitas llevar, instrucciones..." rows={3} style={{ width:'100%', border:'1px solid #d1d5db', borderRadius:10, padding:'10px 12px', fontSize:13, fontFamily:'inherit', outline:'none', resize:'vertical', boxSizing:'border-box' as const }} />
              </div>
              <button onClick={saveCita} disabled={citaSaving || !formCita.titulo.trim() || !formCita.fecha} style={{ ...btn, background:'#0284c7', opacity:(citaSaving||!formCita.titulo.trim()||!formCita.fecha)?0.5:1 }}>
                {citaSaving ? 'Guardando...' : '💾 Guardar cita →'}
              </button>
            </div>
            <div style={{ background:'#f0f9ff', border:'1px solid #bae6fd', borderRadius:14, padding:14 }}>
              <p style={{ fontSize:12, color:'#0369a1', margin:0 }}>💡 <strong>Consejo:</strong> Añade las citas en Extranjería con anticipación y apunta los documentos que debes llevar en las notas.</p>
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

        {pantalla === 'cv-generador' && (
          <div style={{ padding:16, display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ background:'linear-gradient(135deg,#065f46,#059669)', borderRadius:20, padding:'20px 24px', color:'#fff' }}>
              <button onClick={() => setPantalla('perfil')} style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:10, padding:'4px 10px', color:'#fff', fontSize:12, cursor:'pointer', fontFamily:'inherit', marginBottom:10 }}>← Volver</button>
              <h2 style={{ fontSize:20, fontWeight:800, margin:'0 0 4px' }}>📄 Genera tu Currículum</h2>
              <p style={{ fontSize:13, opacity:0.9, margin:0 }}>Completa los datos y la IA lo redacta por ti</p>
            </div>

            {/* Datos personales */}
            <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:16, padding:16, display:'flex', flexDirection:'column', gap:12 }}>
              <p style={{ fontWeight:700, fontSize:14, color:'#0F172A', margin:0 }}>👤 Datos personales</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div>
                  <p style={{ fontSize:12, fontWeight:600, color:'#475569', margin:'0 0 4px' }}>Nombre completo</p>
                  <input value={editNombre} onChange={e => setEditNombre(e.target.value)} placeholder="Tu nombre" style={{ width:'100%', border:'1px solid #E2E8F0', borderRadius:10, padding:'9px 12px', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
                </div>
                <div>
                  <p style={{ fontSize:12, fontWeight:600, color:'#475569', margin:'0 0 4px' }}>Teléfono</p>
                  <input value={datosCV.telefono} onChange={e => setDatosCV(d => ({ ...d, telefono: e.target.value }))} placeholder="+34 600 000 000" style={{ width:'100%', border:'1px solid #E2E8F0', borderRadius:10, padding:'9px 12px', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
                </div>
                <div>
                  <p style={{ fontSize:12, fontWeight:600, color:'#475569', margin:'0 0 4px' }}>Ciudad</p>
                  <input value={editCiudad} onChange={e => setEditCiudad(e.target.value)} placeholder="Madrid, Barcelona..." style={{ width:'100%', border:'1px solid #E2E8F0', borderRadius:10, padding:'9px 12px', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
                </div>
                <div>
                  <p style={{ fontSize:12, fontWeight:600, color:'#475569', margin:'0 0 4px' }}>LinkedIn (opcional)</p>
                  <input value={datosCV.linkedin} onChange={e => setDatosCV(d => ({ ...d, linkedin: e.target.value }))} placeholder="linkedin.com/in/..." style={{ width:'100%', border:'1px solid #E2E8F0', borderRadius:10, padding:'9px 12px', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
                </div>
              </div>
              <div>
                <p style={{ fontSize:12, fontWeight:600, color:'#475569', margin:'0 0 4px' }}>Objetivo profesional</p>
                <textarea value={datosCV.objetivo} onChange={e => setDatosCV(d => ({ ...d, objetivo: e.target.value }))} placeholder="Ej: Profesional con 5 años de experiencia en hostelería, busco oportunidades en Madrid..." rows={3} style={{ width:'100%', border:'1px solid #E2E8F0', borderRadius:10, padding:'9px 12px', fontSize:13, fontFamily:'inherit', outline:'none', resize:'vertical', boxSizing:'border-box' as const }} />
              </div>
            </div>

            {/* Experiencia laboral */}
            <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:16, padding:16, display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <p style={{ fontWeight:700, fontSize:14, color:'#0F172A', margin:0 }}>💼 Experiencia laboral</p>
                <button onClick={() => setExpCV(e => [...e, { ...EMPTY_EXP_CV }])} style={{ background:'#EFF6FF', color:'#2563EB', border:'none', borderRadius:8, padding:'5px 10px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>+ Añadir</button>
              </div>
              {expCV.map((exp, i) => (
                <div key={i} style={{ border:'1px solid #E2E8F0', borderRadius:12, padding:12, display:'flex', flexDirection:'column', gap:8, position:'relative' as const }}>
                  {expCV.length > 1 && (
                    <button onClick={() => setExpCV(e => e.filter((_,j) => j !== i))} style={{ position:'absolute' as const, top:8, right:8, background:'#FEE2E2', color:'#991b1b', border:'none', borderRadius:6, padding:'2px 8px', fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>✕</button>
                  )}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    <div>
                      <p style={{ fontSize:11, fontWeight:600, color:'#475569', margin:'0 0 3px' }}>Empresa</p>
                      <input value={exp.empresa} onChange={e => setExpCV(arr => arr.map((x,j) => j===i ? { ...x, empresa:e.target.value } : x))} placeholder="Nombre de la empresa" style={{ width:'100%', border:'1px solid #E2E8F0', borderRadius:8, padding:'7px 10px', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
                    </div>
                    <div>
                      <p style={{ fontSize:11, fontWeight:600, color:'#475569', margin:'0 0 3px' }}>Cargo / Puesto</p>
                      <input value={exp.cargo} onChange={e => setExpCV(arr => arr.map((x,j) => j===i ? { ...x, cargo:e.target.value } : x))} placeholder="Ej: Camarero, Albañil..." style={{ width:'100%', border:'1px solid #E2E8F0', borderRadius:8, padding:'7px 10px', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
                    </div>
                    <div>
                      <p style={{ fontSize:11, fontWeight:600, color:'#475569', margin:'0 0 3px' }}>Desde</p>
                      <input value={exp.desde} onChange={e => setExpCV(arr => arr.map((x,j) => j===i ? { ...x, desde:e.target.value } : x))} placeholder="Ej: 2021" style={{ width:'100%', border:'1px solid #E2E8F0', borderRadius:8, padding:'7px 10px', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
                    </div>
                    <div>
                      <p style={{ fontSize:11, fontWeight:600, color:'#475569', margin:'0 0 3px' }}>Hasta</p>
                      <input value={exp.hasta} onChange={e => setExpCV(arr => arr.map((x,j) => j===i ? { ...x, hasta:e.target.value } : x))} placeholder="Actual o 2023" style={{ width:'100%', border:'1px solid #E2E8F0', borderRadius:8, padding:'7px 10px', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize:11, fontWeight:600, color:'#475569', margin:'0 0 3px' }}>Descripción de tareas</p>
                    <textarea value={exp.descripcion} onChange={e => setExpCV(arr => arr.map((x,j) => j===i ? { ...x, descripcion:e.target.value } : x))} placeholder="Breve descripción de tus tareas y logros..." rows={2} style={{ width:'100%', border:'1px solid #E2E8F0', borderRadius:8, padding:'7px 10px', fontSize:13, fontFamily:'inherit', outline:'none', resize:'vertical', boxSizing:'border-box' as const }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Formación */}
            <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:16, padding:16, display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <p style={{ fontWeight:700, fontSize:14, color:'#0F172A', margin:0 }}>🎓 Formación académica</p>
                <button onClick={() => setEduCV(e => [...e, { ...EMPTY_EDU_CV }])} style={{ background:'#EFF6FF', color:'#2563EB', border:'none', borderRadius:8, padding:'5px 10px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>+ Añadir</button>
              </div>
              {eduCV.map((edu, i) => (
                <div key={i} style={{ border:'1px solid #E2E8F0', borderRadius:12, padding:12, display:'flex', flexDirection:'column', gap:8, position:'relative' as const }}>
                  {eduCV.length > 1 && (
                    <button onClick={() => setEduCV(e => e.filter((_,j) => j !== i))} style={{ position:'absolute' as const, top:8, right:8, background:'#FEE2E2', color:'#991b1b', border:'none', borderRadius:6, padding:'2px 8px', fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>✕</button>
                  )}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    <div>
                      <p style={{ fontSize:11, fontWeight:600, color:'#475569', margin:'0 0 3px' }}>Centro educativo</p>
                      <input value={edu.institucion} onChange={e => setEduCV(arr => arr.map((x,j) => j===i ? { ...x, institucion:e.target.value } : x))} placeholder="Universidad, instituto..." style={{ width:'100%', border:'1px solid #E2E8F0', borderRadius:8, padding:'7px 10px', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
                    </div>
                    <div>
                      <p style={{ fontSize:11, fontWeight:600, color:'#475569', margin:'0 0 3px' }}>Título / Estudios</p>
                      <input value={edu.titulo} onChange={e => setEduCV(arr => arr.map((x,j) => j===i ? { ...x, titulo:e.target.value } : x))} placeholder="Ej: Bachillerato, FP..." style={{ width:'100%', border:'1px solid #E2E8F0', borderRadius:8, padding:'7px 10px', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
                    </div>
                    <div>
                      <p style={{ fontSize:11, fontWeight:600, color:'#475569', margin:'0 0 3px' }}>Desde</p>
                      <input value={edu.desde} onChange={e => setEduCV(arr => arr.map((x,j) => j===i ? { ...x, desde:e.target.value } : x))} placeholder="Ej: 2015" style={{ width:'100%', border:'1px solid #E2E8F0', borderRadius:8, padding:'7px 10px', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
                    </div>
                    <div>
                      <p style={{ fontSize:11, fontWeight:600, color:'#475569', margin:'0 0 3px' }}>Hasta</p>
                      <input value={edu.hasta} onChange={e => setEduCV(arr => arr.map((x,j) => j===i ? { ...x, hasta:e.target.value } : x))} placeholder="Ej: 2018" style={{ width:'100%', border:'1px solid #E2E8F0', borderRadius:8, padding:'7px 10px', fontSize:13, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Idiomas */}
            <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:16, padding:16, display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <p style={{ fontWeight:700, fontSize:14, color:'#0F172A', margin:0 }}>🌐 Idiomas</p>
                <button onClick={() => setIdiomasCV(e => [...e, { idioma:'', nivel:'Básico' }])} style={{ background:'#EFF6FF', color:'#2563EB', border:'none', borderRadius:8, padding:'5px 10px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>+ Añadir</button>
              </div>
              {idiomasCV.map((id, i) => (
                <div key={i} style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <input value={id.idioma} onChange={e => setIdiomasCV(arr => arr.map((x,j) => j===i ? { ...x, idioma:e.target.value } : x))} placeholder="Idioma" style={{ flex:1, border:'1px solid #E2E8F0', borderRadius:8, padding:'8px 10px', fontSize:13, fontFamily:'inherit', outline:'none' }} />
                  <select value={id.nivel} onChange={e => setIdiomasCV(arr => arr.map((x,j) => j===i ? { ...x, nivel:e.target.value } : x))} style={{ flex:1, border:'1px solid #E2E8F0', borderRadius:8, padding:'8px 10px', fontSize:13, fontFamily:'inherit', outline:'none', background:'#fff' }}>
                    {NIVELES_IDIOMA.map(n => <option key={n}>{n}</option>)}
                  </select>
                  {idiomasCV.length > 1 && (
                    <button onClick={() => setIdiomasCV(e => e.filter((_,j) => j !== i))} style={{ background:'#FEE2E2', color:'#991b1b', border:'none', borderRadius:6, padding:'8px 10px', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>✕</button>
                  )}
                </div>
              ))}
            </div>

            {/* Habilidades */}
            <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:16, padding:16, display:'flex', flexDirection:'column', gap:10 }}>
              <p style={{ fontWeight:700, fontSize:14, color:'#0F172A', margin:0 }}>⚡ Habilidades y competencias</p>
              <textarea value={datosCV.habilidades} onChange={e => setDatosCV(d => ({ ...d, habilidades: e.target.value }))} placeholder="Ej: Trabajo en equipo, manejo de caja, carnet de conducir B, Microsoft Office..." rows={3} style={{ width:'100%', border:'1px solid #E2E8F0', borderRadius:10, padding:'9px 12px', fontSize:13, fontFamily:'inherit', outline:'none', resize:'vertical', boxSizing:'border-box' as const }} />
              <p style={{ fontWeight:700, fontSize:14, color:'#0F172A', margin:0 }}>📝 Información adicional (opcional)</p>
              <textarea value={datosCV.otros} onChange={e => setDatosCV(d => ({ ...d, otros: e.target.value }))} placeholder="Disponibilidad, referencias, cursos extra, voluntariado..." rows={2} style={{ width:'100%', border:'1px solid #E2E8F0', borderRadius:10, padding:'9px 12px', fontSize:13, fontFamily:'inherit', outline:'none', resize:'vertical', boxSizing:'border-box' as const }} />
            </div>

            <button
              onClick={async () => {
                setCvLoading(true)
                setCvResult('')
                try {
                  const r = await fetch('/api/cv', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ datos: { nombre:editNombre, email:userEmail, ciudad:editCiudad, pais:editPais, telefono:datosCV.telefono, linkedin:datosCV.linkedin, objetivo:datosCV.objetivo, habilidades:datosCV.habilidades, otros:datosCV.otros, experiencias:expCV, educacion:eduCV, idiomas:idiomasCV } })
                  })
                  const d = await r.json()
                  setCvResult(d.content)
                } catch { setCvResult('Error al generar el CV. Inténtalo de nuevo.') }
                setCvLoading(false)
              }}
              disabled={cvLoading || !editNombre.trim()}
              style={{ ...btn, background:'#059669', opacity:(cvLoading||!editNombre.trim())?0.5:1 }}
            >
              {cvLoading ? '✍️ Generando tu CV...' : '✨ Generar mi CV con IA →'}
            </button>

            {cvResult && (
              <div style={{ background:'#fff', border:'1px solid #E2E8F0', borderRadius:16, padding:16, display:'flex', flexDirection:'column', gap:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <p style={{ fontWeight:700, fontSize:14, color:'#0F172A', margin:0 }}>📄 Tu currículum generado</p>
                  <button
                    onClick={() => { navigator.clipboard.writeText(cvResult); setCvCopiado(true); setTimeout(() => setCvCopiado(false), 2000) }}
                    style={{ background:cvCopiado?'#059669':'#2563EB', color:'#fff', border:'none', borderRadius:8, padding:'6px 14px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}
                  >
                    {cvCopiado ? '✓ Copiado' : '📋 Copiar'}
                  </button>
                </div>
                <div style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:12, padding:'16px', fontSize:13, color:'#0F172A', lineHeight:1.8, whiteSpace:'pre-wrap' as const, fontFamily:'monospace', maxHeight:500, overflowY:'auto' as const }}>
                  {cvResult}
                </div>
                <div style={{ background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:12, padding:12 }}>
                  <p style={{ fontSize:12, color:'#1e40af', margin:0, lineHeight:1.6 }}>💡 <strong>Consejo:</strong> Copia el texto y pégalo en Word o Google Docs para darle formato visual. Guárdalo en PDF antes de enviarlo.</p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      <nav style={{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:480, background:'#fff', borderTop:'1px solid #E2E8F0', display:'flex', zIndex:100, paddingBottom:'env(safe-area-inset-bottom, 0px)', boxShadow:'0 -1px 10px rgba(15,23,42,0.06)' }}>
        {[
          { id:'inicio', icon:'⚡', label:'Inicio' },
          { id:'empleo', icon:'💼', label:'Trabajo' },
          { id:'vivienda', icon:'🏠', label:'Vivienda' },
          { id:'comunidad', icon:'💬', label:'Comunidad' },
          { id:'perfil', icon:'👤', label:'Perfil' },
        ].map(({ id, icon, label }) => (
          <button key={id} onClick={() => setPantalla(id as Pantalla)} style={{ flex:1, padding:'10px 0 8px', display:'flex', flexDirection:'column', alignItems:'center', gap:3, background:'none', border:'none', cursor:'pointer', borderTop:pantalla===id?'2px solid #2563EB':'2px solid transparent', fontFamily:'inherit', transition:'all 0.15s' }}>
            <span style={{ fontSize:19, opacity:pantalla===id?1:0.55 }}>{icon}</span>
            <span style={{ fontSize:9, fontWeight:pantalla===id?700:500, color:pantalla===id?'#2563EB':'#64748B' }}>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
