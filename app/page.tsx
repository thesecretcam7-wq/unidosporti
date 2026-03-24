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

const btn: React.CSSProperties = { width: '100%', background: '#1B4FCC', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 0', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }

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

export default function Home() {
  const [pantalla, setPantalla] = useState('inicio')
  const [userEmail, setUserEmail] = useState<string|null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [chat, setChat] = useState<Msg[]>([])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [ruta, setRuta] = useState<Ruta|null>(null)
  const [authLoading, setAuthLoading] = useState(false)

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
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://unidosporti.vercel.app' }
    })
    setAuthLoading(false)
  }

  async function logout() { await supabase.auth.signOut() }

  async function send() {
    if (!msg.trim() || loading) return
    const nc = [...chat, { role: 'user', content: msg }]
    setChat(nc); setMsg(''); setLoading(true)
    try {
      const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: nc }) })
      const d = await r.json()
      setChat([...nc, { role: 'assistant', content: d.content }])
    } catch { setChat([...nc, { role: 'assistant', content: 'Error al conectar.' }]) }
    setLoading(false)
  }

  const wrap: React.CSSProperties = { maxWidth: 480, margin: '0 auto', height: '100dvh', display: 'flex', flexDirection: 'column', background: '#f8f9ff' }

  if (sessionLoading) {
    return (
      <div style={{ ...wrap, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 56, height: 56, background: '#1B4FCC', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 24 }}>U</span>
        </div>
        <p style={{ color: '#9ca3af', fontSize: 14 }}>Cargando...</p>
      </div>
    )
  }

  if (!userEmail) {
    return (
      <div style={{ ...wrap, overflowY: 'auto', background: '#f0f4ff' }}>
        {/* Hero */}
        <div style={{ background: 'linear-gradient(160deg, #1B4FCC 0%, #1e3a8a 100%)', padding: '44px 24px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.15)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 28 }}>U</span>
          </div>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: '0 0 8px', letterSpacing: -1 }}>UnidosPorTi</h1>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.95)', margin: '0 0 8px', fontWeight: 700 }}>
              Tu guía para vivir mejor en España 🇪🇸
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.6, maxWidth: 300 }}>
              No importa si llevas un mes o tres años — estamos aquí para ayudarte con todo lo que nadie te explica
            </p>
          </div>
        </div>

        <div style={{ padding: '20px 18px 32px', display: 'flex', flexDirection: 'column', gap: 11 }}>

          {/* Cards */}
          {[
            { icon: '📄', title: 'Regulariza tu situación', desc: 'Arraigo social, laboral y familiar — paso a paso, sin jerga legal', color: '#eff6ff', border: '#bfdbfe' },
            { icon: '💼', title: 'Encuentra trabajo', desc: 'Empresas reales que contratan migrantes y firman precontratos', color: '#f0fdf4', border: '#bbf7d0' },
            { icon: '🏠', title: 'Busca vivienda', desc: 'Pisos, habitaciones y recursos para recién llegados', color: '#fefce8', border: '#fde68a' },
            { icon: '🤖', title: 'Asistente IA 24/7', desc: 'Resuelve tus dudas legales, laborales y de vivienda al instante', color: '#fdf4ff', border: '#e9d5ff' },
            { icon: '🧭', title: 'Guía de vida completa', desc: 'Nómina, sanidad, banco, escuela — todo lo que necesitas saber', color: '#fff7ed', border: '#fed7aa' },
          ].map(({ icon, title, desc, color, border }) => (
            <div key={title} style={{ background: color, border: `1px solid ${border}`, borderRadius: 16, padding: '13px 15px', display: 'flex', gap: 13, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 24, flexShrink: 0, marginTop: 1 }}>{icon}</span>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: '#111', margin: '0 0 2px' }}>{title}</p>
                <p style={{ fontSize: 12, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>{desc}</p>
              </div>
            </div>
          ))}

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 2 }}>
            {[{ n: '100%', label: 'Gratis' }, { n: '24/7', label: 'Disponible' }, { n: '0 €', label: 'Sin coste' }].map(({ n, label }) => (
              <div key={label} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '12px 6px', textAlign: 'center' }}>
                <p style={{ fontSize: 18, fontWeight: 900, color: '#1B4FCC', margin: '0 0 2px' }}>{n}</p>
                <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{label}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={loginGoogle}
            disabled={authLoading}
            style={{
              width: '100%', marginTop: 6,
              background: '#fff', color: '#111',
              border: '2px solid #e5e7eb', borderRadius: 16,
              padding: '16px 0', fontSize: 16, fontWeight: 700,
              cursor: authLoading ? 'wait' : 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              opacity: authLoading ? 0.7 : 1,
              boxShadow: '0 4px 20px rgba(27,79,204,0.15)'
            }}
          >
            <GoogleIcon />
            {authLoading ? 'Redirigiendo...' : 'Empezar gratis con Google'}
          </button>

          <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', margin: '2px 0 0' }}>
            Sin tarjeta · Sin publicidad · Tus datos protegidos
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={wrap}>
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, background: '#1B4FCC', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>U</span>
          </div>
          <span style={{ fontWeight: 700, color: '#111', fontSize: 16 }}>UnidosPorTi</span>
        </div>
        <button onClick={logout} style={{ fontSize: 12, background: '#f3f4f6', border: 'none', borderRadius: 20, padding: '6px 12px', cursor: 'pointer', color: '#374151', fontFamily: 'inherit' }}>👤 Salir</button>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 72 }}>
        {pantalla === 'inicio' && (
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>👤</span>
              <div><p style={{ fontSize: 13, fontWeight: 700, color: '#166534', margin: 0 }}>Sesión activa</p><p style={{ fontSize: 12, color: '#4b5563', margin: 0 }}>{userEmail}</p></div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #1B4FCC, #2563eb)', borderRadius: 20, padding: 24, color: '#fff' }}>
              <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>Bienvenido a</p>
              <h1 style={{ fontSize: 26, fontWeight: 800, margin: '4px 0' }}>UnidosPorTi</h1>
              <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>Tu guía para vivir mejor en España</p>
            </div>
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 16, padding: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#92400e', margin: '0 0 12px' }}>⚠️ ¿Cuál es tu situación?</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(Object.keys(RUTAS) as Ruta[]).map(key => (
                  <button key={key} onClick={() => { setRuta(key); setPantalla('tramites') }} style={{ background: '#fff', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 16px', textAlign: 'left', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>
                    <span style={{ fontWeight: 600, color: '#111' }}>{RUTAS[key].nombre}</span>
                    <span style={{ color: '#6b7280', marginLeft: 8 }}>· {RUTAS[key].tiempo}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button onClick={() => setPantalla('chat')} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 16, padding: 16, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>💬</div>
                <p style={{ fontWeight: 700, fontSize: 14, margin: '0 0 2px', color: '#111' }}>Chat IA</p>
                <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Resuelve tus dudas</p>
              </button>
              <button onClick={() => setPantalla('empleo')} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 16, padding: 16, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>💼</div>
                <p style={{ fontWeight: 700, fontSize: 14, margin: '0 0 2px', color: '#111' }}>Empleo</p>
                <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Encuentra trabajo</p>
              </button>
            </div>
          </div>
        )}

        {pantalla === 'chat' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {chat.length === 0 && <div style={{ textAlign: 'center', paddingTop: 24 }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
                <p style={{ fontWeight: 700, fontSize: 16, color: '#111', margin: '0 0 4px' }}>Asistente Legal IA</p>
                <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px' }}>Pregúntame sobre trámites y derechos</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['¿Qué es el arraigo social?','¿Cómo consigo un precontrato?','¿Puedo trabajar sin papeles?'].map(q => (
                    <button key={q} onClick={() => setMsg(q)} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '10px 14px', textAlign: 'left', fontSize: 13, color: '#1d4ed8', cursor: 'pointer', fontFamily: 'inherit' }}>{q}</button>
                  ))}
                </div>
              </div>}
              {chat.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '80%', borderRadius: 18, padding: '10px 16px', fontSize: 14, background: m.role === 'user' ? '#1B4FCC' : '#fff', color: m.role === 'user' ? '#fff' : '#111', border: m.role === 'user' ? 'none' : '1px solid #e5e7eb' }}>{m.content}</div>
                </div>
              ))}
              {loading && <div style={{ display: 'flex' }}><div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 18, padding: '10px 16px', fontSize: 14, color: '#9ca3af' }}>Escribiendo...</div></div>}
            </div>
            <div style={{ padding: '12px 16px', background: '#fff', borderTop: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Escribe tu pregunta..." style={{ flex: 1, border: '1px solid #d1d5db', borderRadius: 24, padding: '10px 16px', fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
                <button onClick={send} disabled={loading} style={{ width: 44, height: 44, background: '#1B4FCC', border: 'none', borderRadius: '50%', color: '#fff', fontSize: 18, cursor: 'pointer', flexShrink: 0, opacity: loading ? 0.5 : 1 }}>➤</button>
              </div>
            </div>
          </div>
        )}

        {pantalla === 'empleo' && (
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#111' }}>💼 Ofertas de Empleo</h2>
            <p style={{ fontSize: 13, color: '#1d4ed8', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: 12, margin: 0 }}>✅ Empresas que aceptan migrantes y firman precontratos</p>
            {[{ empresa: 'Fincas Martínez', sector: '🌱 Agricultura', ciudad: 'Murcia', salario: '1.200€/mes' },{ empresa: 'Construcciones Levante', sector: '🔨 Construcción', ciudad: 'Murcia', salario: '1.400€/mes' },{ empresa: 'Hostal Los Pinos', sector: '🏨 Hostelería', ciudad: 'Cartagena', salario: '1.100€/mes' }].map((o, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div><p style={{ fontWeight: 700, fontSize: 15, margin: '0 0 2px', color: '#111' }}>{o.empresa}</p><p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{o.sector} · {o.ciudad}</p></div>
                  <span style={{ fontWeight: 700, color: '#166534', fontSize: 14 }}>{o.salario}</span>
                </div>
                <span style={{ fontSize: 12, background: '#dcfce7', color: '#166534', padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>✓ Firma precontratos</span>
                <button onClick={() => setPantalla('chat')} style={{ ...btn, marginTop: 12 }}>Consultar via Chat IA</button>
              </div>
            ))}
          </div>
        )}

        {pantalla === 'tramites' && (
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#111' }}>📋 Mis Trámites</h2>
            {ruta ? (
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 16, padding: 16 }}>
                <p style={{ fontWeight: 700, fontSize: 16, color: '#1e3a8a', margin: '0 0 4px' }}>{RUTAS[ruta].nombre}</p>
                <p style={{ fontSize: 13, color: '#1d4ed8', margin: '0 0 16px' }}>⏱ {RUTAS[ruta].tiempo}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {RUTAS[ruta].docs.map((doc, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 12, padding: 12, border: '1px solid #bfdbfe' }}>
                      <span style={{ width: 24, height: 24, minWidth: 24, background: '#1B4FCC', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{i+1}</span>
                      <span style={{ fontSize: 14, color: '#374151' }}>{doc}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => setPantalla('chat')} style={{ ...btn, marginTop: 16 }}>💬 Preguntar al Chat IA</button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', paddingTop: 32 }}>
                <p style={{ fontSize: 40 }}>📋</p>
                <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>Selecciona tu situación desde el inicio</p>
                <button onClick={() => setPantalla('inicio')} style={{ ...btn, width: 'auto', padding: '12px 24px' }}>Ir al inicio</button>
              </div>
            )}
          </div>
        )}
      </div>

      <nav style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 480, background: '#fff', borderTop: '1px solid #e5e7eb', display: 'flex', zIndex: 100 }}>
        {[{ id: 'inicio', icon: '🏠', label: 'Inicio' },{ id: 'chat', icon: '💬', label: 'Chat IA' },{ id: 'empleo', icon: '💼', label: 'Empleo' },{ id: 'tramites', icon: '📋', label: 'Trámites' }].map(({ id, icon, label }) => (
          <button key={id} onClick={() => setPantalla(id)} style={{ flex: 1, padding: '10px 0 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', borderTop: pantalla === id ? '2px solid #1B4FCC' : '2px solid transparent', fontFamily: 'inherit' }}>
            <span style={{ fontSize: 22 }}>{icon}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: pantalla === id ? '#1B4FCC' : '#9ca3af' }}>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
