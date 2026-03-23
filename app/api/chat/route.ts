import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1024, system: 'Eres el asistente legal de UnidosPorTi para migrantes en España. Responde en español.', messages })
    })
    const data = await response.json()
    return NextResponse.json({ content: data.content?.[0]?.text || 'Error' })
  } catch {
    return NextResponse.json({ content: 'Error.' }, { status: 500 })
  }
}
