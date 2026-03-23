'use client'
import { useState } from 'react'

type Ruta = 'arraigo_social' | 'arraigo_laboral' | 'arraigo_familiar'
type Msg = { role: string; content: string }

const RUTAS = {
  arraigo_social: { nombre: 'Arraigo Social', tiempo: '6-9 meses', docs: ['3 años en España', 'Precontrato de trabajo', 'Sin antecedentes'] },
  arraigo_laboral: { nombre: 'Arraigo Laboral', tiempo: '6-12 meses', docs: ['6 meses de trabajo demostrable', 'Informe vida laboral', 'Sin antecedentes'] },
  arraigo_familiar: { nombre: 'Arraigo Familiar', tiempo: '2-4 meses', docs: ['Familiar español o residente', 'Certificado de parentesco', 'Sin antecedentes'] },
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
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">U</span>
          </div>
          <span className="font-bold text-gray-900">UnidosPorTi</span>
        </div>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Gratis</span>
      </header>

      <nav className="bg-white border-b flex sticky top-14 z-10">
        {(['inicio','chat','empleo','tramites'] as const).map((id) => {
          const labels: Record<string,string> = {inicio:'🏠 Inicio',chat:'💬 Chat IA',empleo:'💼 Empleo',tramites:'📋 Trámites'}
          return (
            <button key={id} onClick={() => setPantalla(id)}
              className={`flex-1 py-3 text-xs font-medium transition-colors ${pantalla === id ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-500'}`}>
              {labels[id]}
            </button>
          )
        })}
      </nav>

      <div className="max-w-lg mx-auto">
        {pantalla === 'inicio' && (
          <div className="p-4 space-y-4">
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-2xl p-5 text-white">
              <p className="text-sm opacity-80">Bienvenido a</p>
              <h1 className="text-2xl font-bold">UnidosPorTi</h1>
              <p className="text-sm opacity-90 mt-1">Tu guía gratuita para regularizarte en España</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-amber-800">⚠️ ¿Cuál es tu situación?</p>
              <div className="mt-3 space-y-2">
                {(Object.keys(RUTAS) as Ruta[]).map((key) => (
                  <button key={key} onClick={() => { setRuta(key); setPantalla('tramites') }}
                    className="w-full text-left bg-white border border-amber-200 rounded-lg p-3 text-sm hover:bg-amber-50">
                    <span className="font-medium text-gray-900">{RUTAS[key].nombre}</span>
                    <span className="text-gray-500 ml-2">· {RUTAS[key].tiempo}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setPantalla('chat')} className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left">
                <div className="text-2xl mb-1">💬</div>
                <p className="font-semibold text-gray-900 text-sm">Chat IA</p>
                <p className="text-xs text-gray-500">Resuelve tus dudas</p>
              </button>
              <button onClick={() => setPantalla('empleo')} className="bg-green-50 border border-green-200 rounded-xl p-4 text-left">
                <div className="text-2xl mb-1">💼</div>
                <p className="font-semibold text-gray-900 text-sm">Empleo</p>
                <p className="text-xs text-gray-500">Encuentra trabajo</p>
              </button>
            </div>
          </div>
        )}

        {pantalla === 'chat' && (
          <div className="flex flex-col h-[calc(100vh-112px)]">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chat.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🤖</div>
                  <p className="font-semibold text-gray-900">Asistente Legal IA</p>
                  <p className="text-sm text-gray-500 mt-1">Pregúntame sobre trámites, documentos y derechos</p>
                  <div className="mt-4 space-y-2">
                    {['¿Qué es el arraigo social?','¿Cómo consigo un precontrato?','¿Puedo trabajar sin papeles?'].map(q => (
                      <button key={q} onClick={() => setMensaje(q)}
                        className="block w-full text-left bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-sm text-blue-700">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {chat.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${m.role === 'user' ? 'bg-blue-700 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {cargando && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-500">
                    Escribiendo...
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 bg-white border-t">
              <div className="flex gap-2">
                <input value={mensaje} onChange={e => setMensaje(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && enviarMensaje()}
                  placeholder="Escribe tu pregunta..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm outline-none focus:border-blue-500" />
                <button onClick={enviarMensaje} disabled={cargando}
                  className="bg-blue-700 text-white rounded-full w-10 h-10 flex items-center justify-center disabled:opacity-50">
                  ➤
                </button>
              </div>
            </div>
          </div>
        )}

        {pantalla === 'empleo' && (
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Ofertas de Empleo</h2>
            <p className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-xl p-3">
              ✅ Empresas que aceptan migrantes y firman precontratos
            </p>
            {[
              { empresa: 'Fincas Martínez', sector: '🌱 Agricultura', ciudad: 'Murcia', salario: '1.200€/mes' },
              { empresa: 'Construcciones Levante', sector: '🔨 Construcción', ciudad: 'Murcia', salario: '1.400€/mes' },
              { empresa: 'Hostal Los Pinos', sector: '🏨 Hostelería', ciudad: 'Cartagena', salario: '1.100€/mes' },
            ].map((o, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">{o.empresa}</p>
                    <p className="text-sm text-gray-500">{o.sector} · {o.ciudad}</p>
                  </div>
                  <span className="text-sm font-semibold text-green-700">{o.salario}</span>
                </div>
                <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">✓ Firma precontratos</span>
                <button onClick={() => setPantalla('chat')} className="mt-3 w-full bg-blue-700 text-white rounded-lg py-2 text-sm font-medium">
                  Consultar via Chat IA
                </button>
              </div>
            ))}
          </div>
        )}

        {pantalla === 'tramites' && (
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Mis Trámites</h2>
            {ruta && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="font-semibold text-blue-900">{RUTAS[ruta].nombre}</p>
                <p className="text-sm text-blue-700 mt-1">Tiempo estimado: {RUTAS[ruta].tiempo}</p>
                <div className="mt-3 space-y-2">
                  {RUTAS[ruta].docs.map((doc, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-5 h-5 rounded-full border-2 border-blue-400 flex items-center justify-center text-xs text-blue-600 shrink-0">{i+1}</span>
                      {doc}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!ruta && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">Selecciona tu situación desde el inicio</p>
                <button onClick={() => setPantalla('inicio')} className="mt-4 bg-blue-700 text-white rounded-lg px-6 py-2 text-sm">
                  Ir al inicio
                </button>
              </div>
            )}
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="font-semibold text-gray-900 mb-3">Recursos</p>
              {['Calculadora de arraigo','Análisis de contrato IA','Guía de vivienda','Calculadora de nómina'].map(r => (
                <button key={r} onClick={() => setPantalla('chat')}
                  className="w-full text-left flex items-center justify-between py-2 border-b border-gray-100 last:border-0 text-sm text-gray-700 hover:text-blue-700">
                  {r} <span>→</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
