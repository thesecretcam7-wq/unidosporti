import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { texto } = await req.json()
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        system: `Eres un experto en derecho laboral español especializado en proteger los derechos de los trabajadores migrantes. Analiza el contrato de trabajo que te envíen y: 1) Identifica cláusulas ABUSIVAS o ILEGALES según la legislación española. 2) Señala partes CONFUSAS. 3) Destaca los puntos POSITIVOS. 4) Da una RECOMENDACIÓN final. Usa emojis: 🔴 cláusulas problemáticas, 🟡 requieren atención, 🟢 correctas, 📋 info general. Responde en español de forma clara para personas sin formación jurídica.`,
        messages: [{ role: 'user', content: `Analiza este contrato:\n\n${texto}` }]
      })
    })
    const data = await response.json()
    return NextResponse.json({ content: data.content?.[0]?.text || 'Error al analizar.' })
  } catch {
    return NextResponse.json({ content: 'Error al conectar.' }, { status: 500 })
  }
}
