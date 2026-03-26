import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { datos } = await req.json()

    const prompt = `Genera un currículum vitae profesional en español para buscar trabajo en España.
Usa el siguiente formato estándar europeo (Europass adaptado). Redacta en tercera persona o primera persona, de forma profesional.

DATOS DEL CANDIDATO:
Nombre: ${datos.nombre}
Ciudad: ${datos.ciudad}
País de origen: ${datos.pais}
Email: ${datos.email}
Teléfono: ${datos.telefono || 'No indicado'}
LinkedIn: ${datos.linkedin || 'No indicado'}

OBJETIVO PROFESIONAL:
${datos.objetivo || 'No indicado'}

EXPERIENCIA LABORAL:
${datos.experiencias.length > 0 ? datos.experiencias.map((e: { cargo: string; empresa: string; desde: string; hasta: string; descripcion: string }) => `- ${e.cargo} en ${e.empresa} (${e.desde} - ${e.hasta}): ${e.descripcion}`).join('\n') : 'Sin experiencia previa indicada'}

FORMACIÓN ACADÉMICA:
${datos.educacion.length > 0 ? datos.educacion.map((e: { titulo: string; institucion: string; desde: string; hasta: string }) => `- ${e.titulo} en ${e.institucion} (${e.desde} - ${e.hasta})`).join('\n') : 'Sin formación indicada'}

IDIOMAS:
${datos.idiomas.map((i: { idioma: string; nivel: string }) => `- ${i.idioma}: ${i.nivel}`).join('\n')}

HABILIDADES Y COMPETENCIAS:
${datos.habilidades || 'No indicadas'}

INFORMACIÓN ADICIONAL:
${datos.otros || 'Ninguna'}

---
Genera el CV completo, bien estructurado, con secciones claramente separadas con líneas de guiones (---).
Hazlo apropiado para el mercado laboral español. Si el candidato tiene experiencia en otro país, adáptala al formato español.
Añade una nota al final si el candidato puede necesitar el NIE o documentación para trabajar en España.
El resultado debe ser texto plano, fácil de copiar y pegar en Word.`

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
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const data = await response.json()
    return NextResponse.json({ content: data.content?.[0]?.text || 'Error al generar el CV' })
  } catch {
    return NextResponse.json({ content: 'Error al generar el CV.' }, { status: 500 })
  }
}
