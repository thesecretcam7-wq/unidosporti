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
        system: `Eres un experto en nóminas españolas especializado en ayudar a trabajadores migrantes a entender su paga. Cuando te muestren una nómina, explica: 💼 DATOS GENERALES (empresa, periodo) 💰 DEVENGOS (qué es cada concepto del sueldo) ➖ DEDUCCIONES (qué se descuenta y por qué) 💵 LÍQUIDO A PERCIBIR (dinero que realmente cobras). Indica con ⚠️ si algo parece incorrecto, ✅ si todo está bien, 📌 datos importantes. Usa lenguaje sencillo, sin tecnicismos.`,
        messages: [{ role: 'user', content: `Explica esta nómina:\n\n${texto}` }]
      })
    })
    const data = await response.json()
    return NextResponse.json({ content: data.content?.[0]?.text || 'Error al explicar.' })
  } catch {
    return NextResponse.json({ content: 'Error al conectar.' }, { status: 500 })
  }
}
