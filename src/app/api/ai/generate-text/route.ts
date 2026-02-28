import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

interface TextGenerationRequest {
  productTitle: string
  productDescription?: string
  productType?: string
  price?: number
  currency?: string
  tone?: string
  language?: string
  textLength?: 'short' | 'medium' | 'long'
  targetType?: 'social' | 'ecommerce' | 'reel' | 'all'
  brandName?: string
  styleHints?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const data: TextGenerationRequest = await request.json()
    
    const zai = await ZAI.create()
    
    const {
      productTitle,
      productDescription,
      productType,
      price,
      currency = 'ARS',
      tone = 'professional',
      language = 'es',
      textLength = 'medium',
      targetType = 'all',
      brandName,
      styleHints
    } = data
    
    const toneDescriptions: Record<string, string> = {
      professional: 'profesional, confiable y experto',
      casual: 'casual, amigable y cercano',
      energetic: 'energético, motivador y dinámico',
      elegant: 'elegante, sofisticado y premium',
      playful: 'juguetón, divertido y creativo',
      minimal: 'minimalista, directo y conciso',
    }
    
    const lengthGuide: Record<string, string> = {
      short: 'textos muy breves (1-3 palabras para títulos, 5-10 palabras para descripciones)',
      medium: 'textos moderados (3-6 palabras para títulos, 15-30 palabras para descripciones)',
      long: 'textos más extensos (5-10 palabras para títulos, 40-80 palabras para descripciones)',
    }
    
    const prompt = `Eres un experto copywriter especializado en marketing deportivo y de moda. Genera textos de marketing para el siguiente producto.

INFORMACIÓN DEL PRODUCTO:
- Título: ${productTitle}
- Descripción: ${productDescription || 'No proporcionada'}
- Tipo: ${productType || 'Producto'}
- Precio: ${price ? `${currency} ${price}` : 'No especificado'}
${brandName ? `- Marca: ${brandName}` : ''}

ESTILO REQUERIDO:
- Tono: ${toneDescriptions[tone] || tone}
- Longitud: ${lengthGuide[textLength] || lengthGuide['medium']}
- Idioma: ${language === 'es' ? 'Español' : language}
${styleHints?.length ? `- Pistas de estilo adicionales: ${styleHints.join(', ')}` : ''}

Genera los siguientes textos en formato JSON (responde SOLO con el JSON, sin markdown):

{
  "title": "Título principal atractivo para el producto",
  "subtitle": "Subtítulo complementario",
  "benefits": [
    "Beneficio 1 del producto",
    "Beneficio 2 del producto",
    "Beneficio 3 del producto"
  ],
  "claims": [
    "Claim o afirmación 1",
    "Claim o afirmación 2"
  ],
  "callToAction": "Llamado a la acción corto y convincente",
  "shortText": "Texto muy breve para reels/stories (máximo 15 palabras)",
  "longText": "Texto más extenso para publicaciones de redes sociales (30-60 palabras)",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

IMPORTANTE:
- Los textos deben ser originales y creativos
- Adapta el tono según lo especificado
- Usa el idioma especificado
- No repitas información del título directamente
- Los beneficios deben ser específicos y creíbles
- Los claims deben ser persuasivos pero honestos`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Eres un copywriter experto en marketing deportivo y de moda. Responde SOLO con JSON válido, sin markdown ni explicaciones.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
    })

    const responseText = completion.choices[0]?.message?.content || ''
    
    // Limpiar la respuesta
    let cleanResponse = responseText.trim()
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.slice(7)
    }
    if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.slice(3)
    }
    if (cleanResponse.endsWith('```')) {
      cleanResponse = cleanResponse.slice(0, -3)
    }
    cleanResponse = cleanResponse.trim()
    
    let generatedTexts
    try {
      generatedTexts = JSON.parse(cleanResponse)
    } catch {
      // Valores por defecto si falla el parsing
      generatedTexts = {
        title: productTitle,
        subtitle: `El mejor ${productType || 'producto'} para ti`,
        benefits: ['Calidad premium', 'Diseño exclusivo', 'Máximo rendimiento'],
        claims: ['Líder en el mercado', 'Garantía de satisfacción'],
        callToAction: '¡Consíguelo ahora!',
        shortText: `${productTitle} - Disponible ahora`,
        longText: `Descubre ${productTitle}, diseñado para ofrecerte lo mejor en ${productType || 'productos'}. Calidad premium y rendimiento excepcional.`,
        hashtags: [productType || 'producto', 'moda', 'deportes', 'estilo', 'calidad'],
        keywords: [productTitle, productType || 'producto', 'premium']
      }
    }
    
    return NextResponse.json({
      success: true,
      texts: generatedTexts
    })
  } catch (error) {
    console.error('Error generating texts:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al generar textos'
    }, { status: 500 })
  }
}
