import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// Tipos de productos que el sistema puede detectar
const PRODUCT_TYPES = [
  { id: 'zapatillas', name: 'Zapatillas', category: 'calzado', keywords: ['zapatilla', 'zapatillas', 'sneaker', 'sneakers', 'running', 'deportivo', 'zapato'] },
  { id: 'remera', name: 'Remera', category: 'indumentaria', keywords: ['remera', 'remeras', 't-shirt', 'tshirt', 'camiseta', 'shirt', 'polera'] },
  { id: 'pantalon', name: 'Pantalón', category: 'indumentaria', keywords: ['pantalón', 'pantalon', 'pant', 'jean', 'jeans', 'trouser'] },
  { id: 'campera', name: 'Campera', category: 'indumentaria', keywords: ['campera', 'camperas', 'jacket', 'chaqueta', 'buzo', 'hoodie', 'sweater'] },
  { id: 'pelota', name: 'Pelota', category: 'equipamiento', keywords: ['pelota', 'pelotas', 'ball', 'fútbol', 'futbol', 'football', 'soccer', 'basketball', 'volleyball'] },
  { id: 'mochila', name: 'Mochila', category: 'accesorios', keywords: ['mochila', 'mochilas', 'backpack', 'bag', 'bolsa'] },
  { id: 'gorra', name: 'Gorra', category: 'accesorios', keywords: ['gorra', 'gorras', 'cap', 'hat', 'sombrero'] },
  { id: 'bolso', name: 'Bolso', category: 'accesorios', keywords: ['bolso', 'bolsos', 'bag', 'duffle', 'equipaje', 'maleta'] },
  { id: 'medias', name: 'Medias', category: 'calzado', keywords: ['medias', 'socks', 'calcetines', 'sock'] },
  { id: 'shorts', name: 'Shorts', category: 'indumentaria', keywords: ['shorts', 'short', 'bermuda', 'pantalon corto'] },
  { id: 'top', name: 'Top', category: 'indumentaria', keywords: ['top', 'top deportivo', 'sports bra', 'corpiño'] },
  { id: 'accesorio', name: 'Accesorio', category: 'accesorios', keywords: ['accesorio', 'accesorios', 'accessory'] },
  { id: 'equipo', name: 'Equipo Deportivo', category: 'equipamiento', keywords: ['equipo', 'equipo deportivo', 'sports equipment', 'gear'] },
]

export async function POST(request: NextRequest) {
  try {
    const { image, productName, description } = await request.json()
    
    // Usar IA para detectar el tipo de producto
    const zai = await ZAI.create()
    
    const prompt = `Analiza la siguiente información de un producto y determina su tipo.
    
Nombre del producto: ${productName || 'No proporcionado'}
Descripción: ${description || 'No proporcionada'}

Tipos de productos disponibles:
${PRODUCT_TYPES.map(t => `- ${t.name} (${t.category}): ${t.keywords.join(', ')}`).join('\n')}

Responde SOLO con un JSON válido con el siguiente formato (sin markdown, sin explicaciones):
{
  "detectedType": "nombre del tipo detectado",
  "typeId": "id del tipo detectado",
  "category": "categoría del tipo",
  "confidence": 0.95,
  "suggestedKeywords": ["keyword1", "keyword2"]
}

Si no puedes determinar el tipo con confianza, usa "accesorio" como valor por defecto.`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en clasificación de productos deportivos y de moda. Responde SOLO con JSON válido, sin markdown ni explicaciones.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
    })

    const responseText = completion.choices[0]?.message?.content || ''
    
    // Limpiar la respuesta de posibles caracteres de markdown
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
    
    try {
      const detection = JSON.parse(cleanResponse)
      
      // Buscar el tipo correspondiente en nuestra lista
      const matchedType = PRODUCT_TYPES.find(t => 
        t.id === detection.typeId || 
        t.name.toLowerCase() === detection.detectedType?.toLowerCase()
      )
      
      return NextResponse.json({
        success: true,
        detection: {
          detectedType: matchedType?.name || detection.detectedType || 'Accesorio',
          typeId: matchedType?.id || 'accesorio',
          category: matchedType?.category || detection.category || 'accesorios',
          confidence: detection.confidence || 0.8,
          suggestedKeywords: detection.suggestedKeywords || matchedType?.keywords || [],
        }
      })
    } catch {
      // Si falla el parsing, usar detección básica por keywords
      const textToAnalyze = `${productName} ${description}`.toLowerCase()
      let bestMatch = PRODUCT_TYPES[PRODUCT_TYPES.length - 1] // accesorio por defecto
      let bestScore = 0
      
      for (const type of PRODUCT_TYPES) {
        const score = type.keywords.reduce((acc, keyword) => {
          return acc + (textToAnalyze.includes(keyword.toLowerCase()) ? 1 : 0)
        }, 0)
        if (score > bestScore) {
          bestScore = score
          bestMatch = type
        }
      }
      
      return NextResponse.json({
        success: true,
        detection: {
          detectedType: bestMatch.name,
          typeId: bestMatch.id,
          category: bestMatch.category,
          confidence: bestScore > 0 ? 0.7 : 0.5,
          suggestedKeywords: bestMatch.keywords,
        }
      })
    }
  } catch (error) {
    console.error('Error detecting product type:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al detectar tipo de producto',
      detection: {
        detectedType: 'Accesorio',
        typeId: 'accesorio',
        category: 'accesorios',
        confidence: 0.5,
        suggestedKeywords: [],
      }
    }, { status: 500 })
  }
}
