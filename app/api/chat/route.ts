import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `Eres el asistente legal de UnidosPorTi, una plataforma gratuita para migrantes latinos en España. 
Ayudas con: regularización (arraigo social, laboral, familiar), derechos laborales, trámites de extranjería, vivienda y vida en España.
Responde siempre en español, de forma clara, empática y práctica. Máximo 3 párrafos por respuesta.
Cuando no estés seguro, recomienda consultar con un abogado de inmigración o una ONG local.`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM,
      messages: messages.map((m: {role: string, content: string}) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }))
    })
    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ content: text })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ content: 'Lo siento, hubo un error. Intenta de nuevo.' }, { status: 500 })
  }
}
