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
const btnOut: React.CSSProperties = { width: '100%', background: '#fff', color: '#1B4FCC', border: '2px solid #1B4FCC', borderRadius: 12, padding: '12px 0', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }
const inp: React.CSSProperties = { width: '100%', border: '1px solid #d1d5db', borderRadius: 12, padding: '14px 16px', fontSize: 15, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }

export default function Home() {
  const [pantalla, setPantalla] = useState('inicio')
  const [authModal, setAuthModal] = useState<'login'|'registro'|null>(null)
  const [userEmail, setUserEmail] = useState<string|null>(null)
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [authErr, setAuthErr] = useState('')
  const [authOk, setAuthOk] = useState('')
  const [authLoad, setAuthLoad] = useState(false)
  const [chat, setChat] = useState<Msg[]>([])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [ruta, setRuta] = useState<Ruta|null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user?.email ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserEmail(session?.user?.email ?? null)
      if (session) setAuthModal(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function login() {
    setAuthLoad(true); setAuthErr(''); setAuthOk('')
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass })
    if (error) setAuthErr('Email o contraseña incorrectos')
    setAuthLoad(false)
  }

  async function registro() {
    setAuthLoad(true); setAuthErr(''); setAuthOk('')
    const { error } = await supabase.auth.signUp({ email, password: pass })
    if (error) setAuthErr('Error al registrarse. Intenta con otro email.')
    else setAuthOk('Revisa tu email para confirmar tu cuenta ✅')
    setAuthLoad(false)
  }

  async function logout() {
    await supabase.auth.signOut()
  }

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

  if (authModal) return (
    <div style={wrap}>
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => { setAuthModal(null); setAuthErr(''); setAuthOk('') }} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6b7280' }}>←</button>
        <span style={{ fontWeight: 700, fontSize: 16 }}>{authModal === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</span>
        <div style={{ width: 32 }} />
      </header>
      <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
        <div style={{ textAlign: 'center', paddingBottom: 8 }}>
          <div style={{ fontSize: 52 }}>{authModal === 'login' ? '👋' : '🎉'}</div>
          <p style={{ fontWeight: 800, fontSize: 20, margin: '8px 0 4px', color: '#111' }}>{authModal === 'login' ? 'Bienvenido de nuevo' : 'Únete gratis'}</p>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{authModal === 'login' ? 'Accede a tu cuenta' : 'Guarda tu progreso y accede desde cualquier dispositivo'}</p>
        </div>
        {authErr && <div style={{ fontSize: 13, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>{authErr}</div>}
        {authOk && <div style={{ fontSize: 13, color: '#166534', background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>{authOk}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" style={inp} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Contraseña</label>
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Mínimo 6 caracteres" style={inp}
            onKeyDown={e => e.key === 'Enter' && (authModal === 'login' ? login() : registro())} />
        </div>
        <button onClick={authModal === 'login' ? login : registro} disabled={authLoad} style={{ ...btn, opacity: authLoad ? 0.7 : 1 }}>
          {authLoad ? 'Cargando...' : authModal === 'login' ? 'Entrar' : 'Crear cuenta gratis'}
        </button>
        <button onClick={() => { setAuthModal(authModal === 'login' ? 'registro' : 'login'); setAuthErr(''); setAuthOk('') }} style={btnOut}>
          {authModal === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
        <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', margin: 0 }}>100% gratuito · Sin tarjeta de crédito</p>
      </div>
    </div>
  )

  return (
    <div style={wrap}>
      <header style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, background: '#1B4FCC', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>U</span>
          </div>
          <span style={{ fontWeight: 700, color: '#111', fontSize: 16 }}>UnidosPorTi</span>
        </div>
        {userEmail
          ? <button onClick={logout} style={{ fontSize: 12, background: '#f3f4f6', border: 'none', borderRadius: 20, padding: '6px 12px', cursor: 'pointer', color: '#374151', fontFamily: 'inherit' }}>👤 Salir</button>
          : <button onClick={() => setAuthModal('login')} style={{ fontSize: 12, background: '#1B4FCC', color: '#fff', border: 'none', borderRadius: 20, padding: '6px 14px', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>Entrar</button>
        }
      </header>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 72 }}>
        {pantalla === 'inicio' && (
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {userEmail && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>👤</span>
              <div><p style={{ fontSize: 13, fontWeight: 700, color: '#166534', margin: 0 }}>Sesión activa</p><p style={{ fontSize: 12, color: '#4b5563', margin: 0 }}>{userEmail}</p></div>
            </div>}
            <div style={{ background: 'linear-gradient(135deg, #1B4FCC, #2563eb)', borderRadius: 20, padding: 24, color: '#fff' }}>
              <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>Bienvenido a</p>
              <h1 style={{ fontSize: 26, fontWeight: 800, margin: '4px 0' }}>UnidosPorTi</h1>
              <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>Tu guía gratuita para regularizarte en España</p>
            </div>
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 16, padding: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#92400e', margin: '0 0 12px' }}>⚠️ ¿Cuál es tu situación?</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(Object.keys(RUTAS) as Ruta[]).map(key => (
                  <button key={key} onClick={() => { setRuta(key); setPantalla('tramites') }}
                    style={{ background: '#fff', border: '1px solid #fde68a', borderRadius: 12, padding: '12px 16px', textAlign: 'left', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>
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
            {!userEmail && <button onClick={() => setAuthModal('registro')} style={{ ...btn, background: '#111' }}>🚀 Crear cuenta gratis</button>}
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
                  {['¿Qué es el arraigo social?', '¿Cómo consigo un precontrato?', '¿Puedo trabajar sin papeles?'].map(q => (
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
                <input value={msg} onChange={e => setMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Escribe tu pregunta..."
                  style={{ flex: 1, border: '1px solid #d1d5db', borderRadius: 24, padding: '10px 16px', fontSize: 14, outline: 'none', fontFamily: 'inherit' }} />
                <button onClick={send} disabled={loading} style={{ width: 44, height: 44, background: '#1B4FCC', border: 'none', borderRadius: '50%', color: '#fff', fontSize: 18, cursor: 'pointer', flexShrink: 0, opacity: loading ? 0.5 : 1 }}>➤</button>
              </div>
            </div>
          </div>
        )}

        {pantalla === 'empleo' && (
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0, color: '#111' }}>💼 Ofertas de Empleo</h2>
            <p style={{ fontSize: 13, color: '#1d4ed8', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: 12, margin: 0 }}>✅ Empresas que aceptan migrantes y firman precontratos</p>
            {[{ empresa: 'Fincas Martínez', sector: '🌱 Agricultura', ciudad: 'Murcia', salario: '1.200€/mes' }, { empresa: 'Construcciones Levante', sector: '🔨 Construcción', ciudad: 'Murcia', salario: '1.400€/mes' }, { empresa: 'Hostal Los Pinos', sector: '🏨 Hostelería', ciudad: 'Cartagena', salario: '1.100€/mes' }].map((o, i) => (
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
        {[{ id: 'inicio', icon: '🏠', label: 'Inicio' }, { id: 'chat', icon: '💬', label: 'Chat IA' }, { id: 'empleo', icon: '💼', label: 'Empleo' }, { id: 'tramites', icon: '📋', label: 'Trámites' }].map(({ id, icon, label }) => (
          <button key={id} onClick={() => setPantalla(id)} style={{ flex: 1, padding: '10px 0 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', borderTop: pantalla === id ? '2px solid #1B4FCC' : '2px solid transparent', fontFamily: 'inherit' }}>
            <span style={{ fontSize: 22 }}>{icon}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: pantalla === id ? '#1B4FCC' : '#9ca3af' }}>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
