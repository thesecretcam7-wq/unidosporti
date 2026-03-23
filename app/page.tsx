'use client'
import { useState } from 'react'

type Ruta = 'arraigo_social' | 'arraigo_laboral' | 'arraigo_familiar'
type Msg = { role: string; content: string }

const RUTAS = {
  arraigo_social: { nombre: 'Arraigo Social', tiempo: '6-9 meses', docs: ['3 años en España', 'Precontrato de trabajo', 'Sin antecedentes penales'] },
  arraigo_laboral: { nombre: 'Arraigo Laboral', tiempo: '6-12 meses', docs: ['6 meses de trabajo demostrable', 'Informe vida laboral', 'Sin antecedentes penales'] },
  arraigo_familiar: { nombre: 'Arraigo Familiar', tiempo: '2-4 meses', docs: ['Familiar español o residente', 'Certificado de parentesco', 'Sin antecedentes penales'] },
} as const

export default function Home() {
  const [pantalla, setPantalla] = useState('inicio')
  const [chat, setChat] = useState<Msg[]>([])
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)
  const [ruta, setRuta] = useState<Ruta | null>(null)

  async function enviarMensaje() {
    if (!mensaje.trim() || cargando) return
    const nuevoChat = [...chat, { role: 'user', content: mensaje }]
    setChat(nuevoChat)
    setMensaje('')
    setCargando(true)
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nuevoChat })
      })
      const data = await r.json()
      setChat([...nuevoChat, { role: 'assistant', content: data.content }])
    } catch {
      setChat([...nuevoChat, { role: 'assistant', content: 'Error al conectar. Intenta de nuevo.' }])
    }
    setCargando(false)
  }

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', height: '100vh', display: 'flex', flexDirection: 'column', background: '#F5F7FF', position: 'relative' }}>

      {/* HEADER */}
      <div style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, background: '#1B4FCC', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>U</span>
          </div>
          <span style={{ fontWeight: 'bold', color: '#111827' }}>UnidosPorTi</span>
        </div>
        <span style={{ fontSize: 12, background: '#D1FAE5', color: '#065F46', padding: '4px 10px', borderRadius: 20, fontWeight: 600 }}>Gratis</span>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 80 }}>

        {/* INICIO */}
        {pantalla === 'inicio' && (
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'linear-gradient(135deg, #1B4FCC, #3B6FEC)', borderRadius: 20, padding: 20, color: 'white' }}>
              <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>Bienvenido a</p>
              <h1 style={{ fontSize: 26, fontWeight: 'bold', margin: '4px 0' }}>UnidosPorTi</h1>
              <p style={{ fontSize: 13, opacity: 0.9, margin: 0 }}>Tu guía gratuita para regularizarte en España 🇪🇸</p>
            </div>

            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 16, padding: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#92400E', margin: '0 0 12px 0' }}>⚠️ ¿Cuál es tu situación?</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(Object.keys(RUTAS) as Ruta[]).map((key) => (
                  <button key={key} onClick={() => { setRuta(key); setPantalla('tramites') }}
                    style={{ background: 'white', border: '1px solid #FDE68A', borderRadius: 12, padding: 12, textAlign: 'left', cursor: 'pointer', fontSize: 14 }}>
                    <span style={{ fontWeight: 600, color: '#111827' }}>{RUTAS[key].nombre}</span>
                    <span style={{ color: '#6B7280', marginLeft: 8 }}>· {RUTAS[key].tiempo}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button onClick={() => setPantalla('chat')}
                style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 16, padding: 16, textAlign: 'left', cursor: 'pointer' }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>💬</div>
                <p style={{ fontWeight: 600, color: '#111827', fontSize: 14, margin: 0 }}>Chat IA</p>
                <p style={{ color: '#6B7280', fontSize: 12, margin: 0 }}>Resuelve tus dudas</p>
              </button>
              <button onClick={() => setPantalla('empleo')}
                style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 16, padding: 16, textAlign: 'left', cursor: 'pointer' }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>💼</div>
                <p style={{ fontWeight: 600, color: '#111827', fontSize: 14, margin: 0 }}>Empleo</p>
                <p style={{ color: '#6B7280', fontSize: 12, margin: 0 }}>Encuentra trabajo</p>
              </button>
            </div>
          </div>
        )}

        {/* CHAT */}
        {pantalla === 'chat' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {chat.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
                  <p style={{ fontWeight: 600, color: '#111827', margin: '0 0 4px 0' }}>Asistente Legal IA</p>
                  <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 16px 0' }}>Pregúntame sobre trámites, documentos y derechos</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {['¿Qué es el arraigo social?','¿Cómo consigo un precontrato?','¿Puedo trabajar sin papeles?'].map(q => (
                      <button key={q} onClick={() => setMensaje(q)}
                        style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: '10px 14px', textAlign: 'left', cursor: 'pointer', fontSize: 13, color: '#1D4ED8' }}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {chat.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ maxWidth: '80%', borderRadius: 18, padding: '10px 16px', fontSize: 14, background: m.role === 'user' ? '#1B4FCC' : 'white', color: m.role === 'user' ? 'white' : '#111827', border: m.role === 'user' ? 'none' : '1px solid #E5E7EB' }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {cargando && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 18, padding: '10px 16px', fontSize: 14, color: '#9CA3AF' }}>Escribiendo...</div>
                </div>
              )}
            </div>
            <div style={{ padding: 16, background: 'white', borderTop: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={mensaje} onChange={e => setMensaje(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && enviarMensaje()}
                  placeholder="Escribe tu pregunta..."
                  style={{ flex: 1, border: '1px solid #D1D5DB', borderRadius: 24, padding: '10px 16px', fontSize: 14, outline: 'none' }} />
                <button onClick={enviarMensaje} disabled={cargando}
                  style={{ width: 44, height: 44, background: '#1B4FCC', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: 18, opacity: cargando ? 0.5 : 1 }}>
                  ➤
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EMPLEO */}
        {pantalla === 'empleo' && (
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', margin: 0 }}>Ofertas de Empleo</h2>
            <p style={{ fontSize: 13, color: '#1D4ED8', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: 12, margin: 0 }}>
              ✅ Empresas que aceptan migrantes y firman precontratos
            </p>
            {[
              { empresa: 'Fincas Martínez', sector: '🌱 Agricultura', ciudad: 'Murcia', salario: '1.200€/mes' },
              { empresa: 'Construcciones Levante', sector: '🔨 Construcción', ciudad: 'Murcia', salario: '1.400€/mes' },
              { empresa: 'Hostal Los Pinos', sector: '🏨 Hostelería', ciudad: 'Cartagena', salario: '1.100€/mes' },
            ].map((o, i) => (
              <div key={i} style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 16, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <p style={{ fontWeight: 600, color: '#111827', margin: 0 }}>{o.empresa}</p>
                    <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>{o.sector} · {o.ciudad}</p>
                  </div>
                  <span style={{ fontWeight: 600, color: '#059669', fontSize: 14 }}>{o.salario}</span>
                </div>
                <span style={{ fontSize: 12, background: '#D1FAE5', color: '#065F46', padding: '3px 10px', borderRadius: 20 }}>✓ Firma precontratos</span>
                <button onClick={() => setPantalla('chat')}
                  style={{ marginTop: 12, width: '100%', background: '#1B4FCC', color: 'white', border: 'none', borderRadius: 12, padding: '10px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                  Consultar via Chat IA
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TRAMITES */}
        {pantalla === 'tramites' && (
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', margin: 0 }}>Mis Trámites</h2>
            {ruta ? (
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 16, padding: 16 }}>
                <p style={{ fontWeight: 600, color: '#1E3A8A', margin: '0 0 4px 0' }}>{RUTAS[ruta].nombre}</p>
                <p style={{ fontSize: 13, color: '#1D4ED8', margin: '0 0 12px 0' }}>⏱ Tiempo: {RUTAS[ruta].tiempo}</p>
                {RUTAS[ruta].docs.map((doc, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, background: 'white', borderRadius: 12, padding: 12 }}>
                    <span style={{ width: 24, height: 24, background: '#1B4FCC', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'bold', flexShrink: 0 }}>{i+1}</span>
                    <span style={{ fontSize: 14, color: '#374151' }}>{doc}</span>
                  </div>
                ))}
                <button onClick={() => setPantalla('chat')}
                  style={{ marginTop: 8, width: '100%', background: '#1B4FCC', color: 'white', border: 'none', borderRadius: 12, padding: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                  Preguntar al Chat IA
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <p style={{ fontSize: 40, margin: '0 0 12px 0' }}>📋</p>
                <p style={{ color: '#6B7280', fontSize: 14, margin: '0 0 16px 0' }}>Selecciona tu situación desde el inicio</p>
                <button onClick={() => setPantalla('inicio')}
                  style={{ background: '#1B4FCC', color: 'white', border: 'none', borderRadius: 12, padding: '10px 24px', cursor: 'pointer', fontSize: 14 }}>
                  Ir al inicio
                </button>
              </div>
            )}
            <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 16, padding: 16 }}>
              <p style={{ fontWeight: 600, color: '#111827', margin: '0 0 8px 0' }}>🛠 Recursos</p>
              {['Calculadora de arraigo','Análisis de contrato IA','Guía de vivienda','Calculadora de nómina'].map(r => (
                <button key={r} onClick={() => setPantalla('chat')}
                  style={{ width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #F3F4F6', background: 'none', border: 'none', borderBottom: '1px solid #F3F4F6', cursor: 'pointer', fontSize: 14, color: '#374151' }}>
                  {r} <span style={{ color: '#9CA3AF' }}>→</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM NAV - fijo abajo */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: 'white', borderTop: '1px solid #E5E7EB', display: 'flex', zIndex: 100 }}>
        {[
          { id: 'inicio', icon: '🏠', label: 'Inicio' },
          { id: 'chat', icon: '💬', label: 'Chat IA' },
          { id: 'empleo', icon: '💼', label: 'Empleo' },
          { id: 'tramites', icon: '📋', label: 'Trámites' },
        ].map(({ id, icon, label }) => (
          <button key={id} onClick={() => setPantalla(id)}
            style={{ flex: 1, padding: '10px 0 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'none', border: 'none', cursor: 'pointer', borderTop: pantalla === id ? '2px solid #1B4FCC' : '2px solid transparent' }}>
            <span style={{ fontSize: 22 }}>{icon}</span>
            <span style={{ fontSize: 11, fontWeight: 500, color: pantalla === id ? '#1B4FCC' : '#9CA3AF' }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
      }
