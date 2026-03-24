'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Ruta = 'arraigo_social' | 'arraigo_laboral' | 'arraigo_familiar'
type Msg = { role: string; content: string }

const RUTAS = {
  arraigo_social: { nombre: 'Arraigo Social', tiempo: '6-9 meses', docs: ['3 años en España', 'Precontrato de trabajo', 'Sin antecedentes penales'] },
  arraigo_laboral: { nombre: 'Arraigo Laboral', tiempo: '6-12 meses', docs: ['6 meses de trabajo demostrable', 'Informe vida laboral', 'Sin antecedentes penales'] },
  arraigo_familiar: { nombre: 'Arraigo Familiar', tiempo: '2-4 meses', docs: ['Familiar español o residente', 'Certificado de parentesco', 'Sin antecedentes penales'] },
} as const

const EMPLEOS = [
  { id:1, empresa:'Fincas del Sur', sector:'Agricultura', ciudad:'Murcia', salario:'1.250€', jornada:'Completa', arraigo:true, precontrato:true, nie:true, desc:'Se buscan recolectores de fruta. No se requiere experiencia previa.' },
  { id:2, empresa:'Reformas Madrid Centro', sector:'Construcción', ciudad:'Madrid', salario:'1.600€', jornada:'Completa', arraigo:true, precontrato:true, nie:false, desc:'Peones y oficiales de albañilería. Formación a cargo de la empresa.' },
  { id:3, empresa:'Hostal Mediterráneo', sector:'Hostelería', ciudad:'Valencia', salario:'1.100€', jornada:'Parcial', arraigo:true, precontrato:true, nie:true, desc:'Camareros y personal de cocina. Turno de mañana y tarde disponible.' },
  { id:4, empresa:'Limpieza Express BCN', sector:'Limpieza', ciudad:'Barcelona', salario:'950€', jornada:'Parcial', arraigo:true, precontrato:false, nie:true, desc:'Personal de limpieza para hoteles y oficinas. Horario flexible.' },
  { id:5, empresa:'LogiTrans Levante', sector:'Logística', ciudad:'Alicante', salario:'1.400€', jornada:'Completa', arraigo:false, precontrato:true, nie:false, desc:'Mozos de almacén y preparación de pedidos. Turno rotativo.' },
  { id:6, empresa:'Cuidados del Hogar SL', sector:'Cuidados', ciudad:'Sevilla', salario:'1.050€', jornada:'Completa', arraigo:true, precontrato:true, nie:true, desc:'Cuidadores de personas mayores con experiencia. Alojamiento incluido.' },
]

const VIVIENDAS = [
  { id:1, tipo:'Habitación', titulo:'Habitación en piso compartido', ciudad:'Madrid', barrio:'Vallecas', precio:350, fianza:1, sinNomina:true, extranjeros:true, m2:12, habs:4, img:'🏠', desc:'Piso de 4 personas, cocina equipada, wifi incluido. Ambiente multicultural.' },
  { id:2, tipo:'Piso', titulo:'Estudio amueblado', ciudad:'Barcelona', barrio:'Nou Barris', precio:650, fianza:1, sinNomina:true, extranjeros:true, m2:35, habs:1, img:'🏢', desc:'Estudio totalmente equipado. Aceptamos aval solidario en lugar de nómina.' },
  { id:3, tipo:'Habitación', titulo:'Habitación individual luminosa', ciudad:'Valencia', barrio:'Ruzafa', precio:280, fianza:1, sinNomina:true, extranjeros:true, m2:10, habs:3, img:'🏠', desc:'Piso moderno, 3 habitaciones. Se valora convivencia. Gastos incluidos.' },
  { id:4, tipo:'Piso', titulo:'Piso 2 habitaciones', ciudad:'Murcia', barrio:'Centro', precio:550, fianza:2, sinNomina:false, extranjeros:true, m2:65, habs:2, img:'🏡', desc:'Piso céntrico, bien comunicado. Se pide nómina o aval bancario.' },
  { id:5, tipo:'Habitación', titulo:'Habitación en casa familiar', ciudad:'Sevilla', barrio:'Triana', precio:300, fianza:1, sinNomina:true, extranjeros:true, m2:14, habs:5, img:'🏘️', desc:'Casa familiar, ambiente tranquilo. Incluye desayuno. Ideal recién llegados.' },
  { id:6, tipo:'Piso', titulo:'Apartamento completo', ciudad:'Bilbao', barrio:'Deusto', precio:720, fianza:2, sinNomina:false, extranjeros:true, m2:55, habs:2, img:'🏢', desc:'Apartamento moderno, garaje incluido. Aceptamos contratos temporales.' },
]

const SECTORES = ['Todos','Agricultura','Construcción','Hostelería','Limpieza','Logística','Cuidados']
const CIUDADES_EMP = ['Todas','Madrid','Barcelona','Valencia','Murcia','Alicante','Sevilla']
const CIUDADES_VIV = ['Todas','Madrid','Barcelona','Valencia','Murcia','Sevilla','Bilbao']
const TIPOS_VIV = ['Todos','Habitación','Piso']

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

const btn: React.CSSProperties = { width:'100%', background:'#1B4FCC', color:'#fff', border:'none', borderRadius:12, padding:'13px 0', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }

function Badge({ text, color='blue' }: { text: string, color?: string }) {
  const colors: Record<string, { bg: string, txt: string }> = {
    green: { bg:'#dcfce7', txt:'#166534' },
    blue:  { bg:'#dbeafe', txt:'#1e40af' },
    orange:{ bg:'#ffedd5', txt:'#9a3412' },
    gray:  { bg:'#f3f4f6', txt:'#374151' },
  }
  const c = colors[color] || colors.blue
  return (
    <span style={{ fontSize:11, background:c.bg, color:c.txt, padding:'3px 8px', borderRadius:20, fontWeight:700, whiteSpace:'nowrap' as const }}>
      {text}
    </span>
  )
}

export default function Home() {
  const [pantalla, setPantalla] = useState('inicio')
  const [userEmail, setUserEmail] = useState<string|null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [chat, setChat] = useState<Msg[]>([])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [ruta, setRuta] = useState<Ruta|null>(null)
  const [authLoading, setAuthLoading] = useState(false)

  // Empleo filters
  const [busqEmp, setBusqEmp] = useState('')
  const [sectorFilt, setSectorFilt] = useState('Todos')
  const [ciudadEmpFilt, setCiudadEmpFilt] = useState('Todas')
  const [soloArraigo, setSoloArraigo] = useState(false)
  const [soloPrecontrato, setSoloPrecontrato] = useState(false)

  // Vivienda filters
  const [busqViv, setBusqViv] = useState('')
  const [ciudadVivFilt, setCiudadVivFilt] = useState('Todas')
  const [tipoVivFilt, setTipoVivFilt] = useState('Todos')
  const [soloSinNomina, setSoloSinNomina] = useState(false)
  const [precioMax, setPrecioMax] = useState(1000)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null)
      setSessionLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserEmail(session?.user?.email ?? null)
      setSessionLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loginGoogle() {
    setAuthLoading(true)
    await supabase.auth.signInWithOAuth({ provider:'google', options:{ redirectTo:'https://unidosporti.vercel.app' } })
    setAuthLoading(false)
  }

  async function logout() { await supabase.auth.signOut() }

  async function send() {
    if (!msg.trim() || loading) return
    const nc = [...chat, { role:'user', content:msg }]
    setChat(nc); setMsg(''); setLoading(true)
    try {
      const r = await fetch('/api/chat', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ messages:nc }) })
      const d = await r.json()
      setChat([...nc, { role:'assistant', content:d.content }])
    } catch { setChat([...nc, { role:'assistant', content:'Error al conectar.' }]) }
    setLoading(false)
  }

  const empleosFiltrados = EMPLEOS.filter(e => {
    const q = busqEmp.toLowerCase()
    const matchQ = !q || e.empresa.toLowerCase().includes(q) || e.sector.toLowerCase().includes(q) || e.ciudad.toLowerCase().includes(q) || e.desc.toLowerCase().includes(q)
    const matchSector = sectorFilt === 'Todos' || e.sector === sectorFilt
    const matchCiudad = ciudadEmpFilt === 'Todas' || e.ciudad === ciudadEmpFilt
    const matchArraigo = !soloArraigo || e.arraigo
    const matchPre = !soloPrecontrato || e.precontrato
    return matchQ && matchSector && matchCiudad && matchArraigo && matchPre
  })

  const viviendasFiltradas = VIVIENDAS.filter(v => {
    const q = busqViv.toLowerCase()
    const matchQ = !q || v.titulo.toLowerCase().includes(q) || v.ciudad.toLowerCase().includes(q) || v.barrio.toLowerCase().includes(q) || v.desc.toLowerCase().includes(q)
    const matchCiudad = ciudadVivFilt === 'Todas' || v.ciudad === ciudadVivFilt
    const matchTipo = tipoVivFilt === 'Todos' || v.tipo === tipoVivFilt
    const matchNomina = !soloSinNomina || v.sinNomina
    const matchPrecio = v.precio <= precioMax
    return matchQ && matchCiudad && matchTipo && matchNomina && matchPrecio
  })

  const wrap: React.CSSProperties = { maxWidth:480, margin:'0 auto', height:'100dvh', display:'flex', flexDirection:'column', background:'#f8f9ff' }

  if (sessionLoading) return (
    <div style={{ ...wrap, alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:56, height:56, background:'#1B4FCC', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
        <span style={{ color:'#fff', fontWeight:800, fontSize:24 }}>U</span>
      </div>
      <p style={{ color:'#9ca3af', fontSize:14 }}>Cargando...</p>
    </div>
  )

  if (!userEmail) return (
    <div style={{ ...wrap, overflowY:'auto', background:'#f0f4ff' }}>
      <div style={{ background:'linear-gradient(160deg,#1B4FCC 0%,#1e3a8a 100%)', padding:'44px 24px 32px', display:'flex', flexDirection:'column', alignItems:'center', gap:14, textAlign:'center' }}>
        <div style={{ width:64, height:64, background:'rgba(255,255,255,0.15)', borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ color:'#fff', fontWeight:900, fontSize:28 }}>U</span>
        </div>
        <div>
          <h1 style={{ fontSize:32, fontWeight:900, color:'#fff', margin:'0 0 8px', letterSpacing:-1 }}>UnidosPorTi</h1>
          <p style={{ fontSize:17, color:'rgba(255,255,255,0.95)', margin:'0 0 8px', fontWeight:700 }}>Tu guía para vivir mejor en España 🇪🇸</p>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.75)', margin:0, lineHeight:1.6, maxWidth:300 }}>No importa si llevas un mes o tres años — estamos aquí para ayudarte con todo lo que nadie te explica</p>
        </div>
      </div>
      <div style={{ padding:'20px 18px 32px', display:'flex', flexDirection:'column', gap:11 }}>
        {[
          { icon:'📄', title:'Regulariza tu situación', desc:'Arraigo social, laboral y familiar — paso a paso, sin jerga legal', color:'#eff6ff', border:'#bfdbfe' },
          { icon:'💼', title:'Trabajo mejor que InfoJobs', desc:'Filtrado para migrantes: arraigo, precontrato, NIE en trámite — sin discriminación', color:'#f0fdf4', border:'#bbf7d0' },
          { icon:'🏠', title:'Vivienda mejor que Idealista', desc:'Sin nómina, sin aval, sin discriminación — pisos y habitaciones reales para ti', color:'#fefce8', border:'#fde68a' },
          { icon:'🤖', title:'Asistente IA 24/7', desc:'Resuelve tus dudas legales, laborales y de vivienda al instante', color:'#fdf4ff', border:'#e9d5ff' },
          { icon:'🧭', title:'Guía de vida completa', desc:'Nómina, sanidad, banco, escuela — todo lo que necesitas saber', color:'#fff7ed', border:'#fed7aa' },
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
  )

  return (
    <div style={wrap}>
      <header style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:32, height:32, background:'#1B4FCC', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ color:'#fff', fontWeight:700, fontSize:14 }}>U</span>
          </div>
          <span style={{ fontWeight:700, color:'#111', fontSize:16 }}>UnidosPorTi</span>
        </div>
        <button onClick={logout} style={{ fontSize:12, background:'#f3f4f6', border:'none', borderRadius:20, padding:'6px 12px', cursor:'pointer', color:'#374151', fontFamily:'inherit' }}>👤 Salir</button>
      </header>

      <div style={{ flex:1, overflowY:'auto', paddingBottom:72 }}>

        {/* ======== INICIO ======== */}
        {pantalla === 'inicio' && (
          <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ background:'linear-gradient(135deg,#1B4FCC,#2563eb)', borderRadius:20, padding:'20px 24px', color:'#fff' }}>
              <p style={{ fontSize:12, opacity:0.8, margin:'0 0 2px' }}>Hola 👋</p>
              <h1 style={{ fontSize:22, fontWeight:800, margin:'0 0 4px' }}>¿En qué te ayudamos hoy?</h1>
              <p style={{ fontSize:13, opacity:0.85, margin:0 }}>Todo lo que necesitas para vivir mejor en España</p>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[
                { id:'empleo', icon:'💼', label:'Trabajo', sub:'Sin discriminación', color:'#f0fdf4', border:'#bbf7d0', badge:'Nuevo' },
                { id:'vivienda', icon:'🏠', label:'Vivienda', sub:'Sin nómina previa', color:'#fefce8', border:'#fde68a', badge:'Nuevo' },
                { id:'chat', icon:'🤖', label:'Chat IA', sub:'Dudas al instante', color:'#eff6ff', border:'#bfdbfe', badge:'' },
                { id:'tramites', icon:'📋', label:'Trámites', sub:'Arraigo y papeles', color:'#fdf4ff', border:'#e9d5ff', badge:'' },
              ].map(({ id, icon, label, sub, color, border, badge }) => (
                <button key={id} onClick={() => setPantalla(id)} style={{ background:color, border:`1px solid ${border}`, borderRadius:18, padding:'16px 14px', textAlign:'left', cursor:'pointer', fontFamily:'inherit', position:'relative' as const }}>
                  {badge && <span style={{ position:'absolute' as const, top:10, right:10, fontSize:9, background:'#1B4FCC', color:'#fff', padding:'2px 6px', borderRadius:10, fontWeight:700 }}>{badge}</span>}
                  <div style={{ fontSize:28, marginBottom:6 }}>{icon}</div>
                  <p style={{ fontWeight:700, fontSize:15, margin:'0 0 2px', color:'#111' }}>{label}</p>
                  <p style={{ fontSize:11, color:'#6b7280', margin:0 }}>{sub}</p>
                </button>
              ))}
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
          </div>
        )}

        {/* ======== EMPLEO ======== */}
        {pantalla === 'empleo' && (
          <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
            <div style={{ background:'linear-gradient(135deg,#065f46,#059669)', padding:'16px 16px 12px', flexShrink:0 }}>
              <h2 style={{ color:'#fff', fontSize:18, fontWeight:800, margin:'0 0 10px' }}>💼 Trabajo para migrantes</h2>
              <input
                value={busqEmp} onChange={e => setBusqEmp(e.target.value)}
                placeholder="Busca empresa, sector, ciudad..."
                style={{ width:'100%', border:'none', borderRadius:12, padding:'11px 14px', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }}
              />
            </div>

            {/* Filtros */}
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
              <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>{empleosFiltrados.length} ofertas encontradas</p>
              {empleosFiltrados.length === 0 && (
                <div style={{ textAlign:'center', padding:'40px 20px' }}>
                  <p style={{ fontSize:32 }}>🔍</p>
                  <p style={{ color:'#6b7280', fontSize:14 }}>No hay ofertas con esos filtros</p>
                </div>
              )}
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
                  <button onClick={() => { setMsg(`Quiero información sobre la oferta de ${e.empresa} en ${e.ciudad} para el sector ${e.sector}`); setPantalla('chat') }} style={{ ...btn, background:'#065f46', fontSize:13, padding:'10px 0' }}>
                    Consultar por esta oferta →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======== VIVIENDA ======== */}
        {pantalla === 'vivienda' && (
          <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
            <div style={{ background:'linear-gradient(135deg,#78350f,#d97706)', padding:'16px 16px 12px', flexShrink:0 }}>
              <h2 style={{ color:'#fff', fontSize:18, fontWeight:800, margin:'0 0 10px' }}>🏠 Vivienda sin barreras</h2>
              <input
                value={busqViv} onChange={e => setBusqViv(e.target.value)}
                placeholder="Busca ciudad, barrio..."
                style={{ width:'100%', border:'none', borderRadius:12, padding:'11px 14px', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' as const }}
              />
            </div>

            {/* Filtros vivienda */}
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
              <p style={{ fontSize:12, color:'#6b7280', margin:0 }}>{viviendasFiltradas.length} opciones encontradas</p>
              {viviendasFiltradas.length === 0 && (
                <div style={{ textAlign:'center', padding:'40px 20px' }}>
                  <p style={{ fontSize:32 }}>🔍</p>
                  <p style={{ color:'#6b7280', fontSize:14 }}>No hay viviendas con esos filtros</p>
                </div>
              )}
              {viviendasFiltradas.map(v => (
                <div key={v.id} style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:18, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div style={{ background:'linear-gradient(135deg,#fef3c7,#fde68a)', padding:'20px 16px', display:'flex', alignItems:'center', gap:12 }}>
                    <span style={{ fontSize:40 }}>{v.img}</span>
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
                    <button onClick={() => { setMsg(`Me interesa la vivienda "${v.titulo}" en ${v.barrio}, ${v.ciudad} por ${v.precio}€/mes. ¿Cómo puedo solicitarla?`); setPantalla('chat') }} style={{ ...btn, background:'#d97706', fontSize:13, padding:'10px 0' }}>
                      Consultar disponibilidad →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======== CHAT ======== */}
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
              {loading && <div style={{ display:'flex' }}><div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:18, padding:'10px 16px', fontSize:14, color:'#9ca3af' }}>Escribiendo...</div></div>}
            </div>
            <div style={{ padding:'12px 16px', background:'#fff', borderTop:'1px solid #e5e7eb', flexShrink:0 }}>
              <div style={{ display:'flex', gap:8 }}>
                <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key==='Enter' && send()} placeholder="Escribe tu pregunta..." style={{ flex:1, border:'1px solid #d1d5db', borderRadius:24, padding:'10px 16px', fontSize:14, outline:'none', fontFamily:'inherit' }} />
                <button onClick={send} disabled={loading} style={{ width:44, height:44, background:'#1B4FCC', border:'none', borderRadius:'50%', color:'#fff', fontSize:18, cursor:'pointer', flexShrink:0, opacity:loading?0.5:1 }}>➤</button>
              </div>
            </div>
          </div>
        )}

        {/* ======== TRÁMITES ======== */}
        {pantalla === 'tramites' && (
          <div style={{ padding:16, display:'flex', flexDirection:'column', gap:14 }}>
            <h2 style={{ fontSize:20, fontWeight:800, margin:0, color:'#111' }}>📋 Mis Trámites</h2>
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

      </div>

      <nav style={{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:480, background:'#fff', borderTop:'1px solid #e5e7eb', display:'flex', zIndex:100 }}>
        {[
          { id:'inicio', icon:'🏠', label:'Inicio' },
          { id:'empleo', icon:'💼', label:'Trabajo' },
          { id:'vivienda', icon:'🏠', label:'Vivienda' },
          { id:'chat', icon:'🤖', label:'Chat IA' },
          { id:'tramites', icon:'📋', label:'Trámites' },
        ].map(({ id, icon, label }) => (
          <button key={id} onClick={() => setPantalla(id)} style={{ flex:1, padding:'8px 0 6px', display:'flex', flexDirection:'column', alignItems:'center', gap:2, background:'none', border:'none', cursor:'pointer', borderTop:pantalla===id?'2px solid #1B4FCC':'2px solid transparent', fontFamily:'inherit' }}>
            <span style={{ fontSize:18 }}>{icon}</span>
            <span style={{ fontSize:9, fontWeight:600, color:pantalla===id?'#1B4FCC':'#9ca3af' }}>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
                                                                           }
