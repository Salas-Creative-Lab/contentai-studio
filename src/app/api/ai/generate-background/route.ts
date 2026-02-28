import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const {
      prompt,
      style = 'modern',
      primaryColor,
      secondaryColor,
      productType,
      size = '1024x1024'
    } = data
    
    // Crear directorio si no existe
    const downloadDir = join(process.cwd(), 'public', 'generated')
    if (!existsSync(downloadDir)) {
      mkdirSync(downloadDir, { recursive: true })
    }
    
    // Construir prompt mejorado
    const styleDescriptions: Record<string, string> = {
      modern: 'limpio, minimalista, con espacios negativos, estilo moderno y profesional',
      urban: 'urbano, callejero, texturas de concreto y graffiti, estilo street',
      sport: 'deportivo, dinámico, líneas de movimiento, colores vibrantes',
      elegant: 'elegante, sofisticado, tonos neutros, estilo premium',
      natural: 'natural, orgánico, texturas de madera y plantas, ambiente relajado',
      gradient: 'gradiente suave, colores fluidos, estilo contemporáneo',
      geometric: 'patrones geométricos, formas abstractas, estilo moderno',
    }
    
    const enhancedPrompt = `Fondo de estudio profesional para fotografía de producto ${productType || ''}.
    
Estilo: ${styleDescriptions[style] || style}
${primaryColor ? `Color primario: ${primaryColor}` : ''}
${secondaryColor ? `Color secundario: ${secondaryColor}` : ''}

Requisitos:
- Fondo limpio y profesional para e-commerce
- Iluminación suave y difusa
- Sin distracciones
- Espacio central reservado para el producto
- Alta calidad, 4K
- No incluir texto ni logos

Prompt adicional del usuario: ${prompt || 'Fondo profesional para producto'}`

    const zai = await ZAI.create()
    
    const response = await zai.images.generations.create({
      prompt: enhancedPrompt,
      size: size as '1024x1024' | '768x1344' | '864x1152' | '1344x768' | '1152x864' | '1440x720' | '720x1440'
    })
    
    const imageBase64 = response.data[0]?.base64
    
    if (!imageBase64) {
      throw new Error('No se pudo generar la imagen')
    }
    
    // Guardar imagen
    const fileName = `bg-${Date.now()}.png`
    const filePath = join(downloadDir, fileName)
    const imageBuffer = Buffer.from(imageBase64, 'base64')
    await writeFile(filePath, imageBuffer)
    
    return NextResponse.json({
      success: true,
      imageUrl: `/generated/${fileName}`,
      prompt: enhancedPrompt
    })
  } catch (error) {
    console.error('Error generating background:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al generar fondo'
    }, { status: 500 })
  }
}
