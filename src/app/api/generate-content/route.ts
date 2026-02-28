import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import ZAI from 'z-ai-web-dev-sdk'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

const prisma = new PrismaClient()

interface GenerateContentRequest {
  clientId: string
  productId?: string
  presetId?: string
  productData: {
    title: string
    description?: string
    price?: number
    originalImage?: string
    productType?: string
  }
  mode: 'manual' | 'automatic'
  options?: {
    generateReel?: boolean
    generateEcommerce?: boolean
    generateSocial?: boolean
    exportToDrive?: boolean
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: GenerateContentRequest = await request.json()
    const startTime = Date.now()
    
    // Crear directorio de salida
    const downloadDir = join(process.cwd(), 'public', 'generated')
    if (!existsSync(downloadDir)) {
      mkdirSync(downloadDir, { recursive: true })
    }
    
    // 1. Obtener cliente y preset
    const client = await prisma.client.findUnique({
      where: { id: data.clientId }
    })
    
    if (!client) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }
    
    let preset = null
    if (data.presetId) {
      preset = await prisma.preset.findUnique({
        where: { id: data.presetId }
      })
    } else if (data.mode === 'automatic') {
      // Buscar preset por defecto del cliente
      preset = await prisma.preset.findFirst({
        where: { clientId: data.clientId, isDefault: true }
      })
    }
    
    // 2. Crear o obtener producto
    let product = null
    if (data.productId) {
      product = await prisma.product.findUnique({
        where: { id: data.productId }
      })
    } else {
      product = await prisma.product.create({
        data: {
          clientId: data.clientId,
          title: data.productData.title,
          description: data.productData.description || null,
          price: data.productData.price || null,
          originalImage: data.productData.originalImage || null,
          detectedType: data.productData.productType || null,
          status: 'processing',
        }
      })
    }
    
    // 3. Generar textos con IA
    const zai = await ZAI.create()
    
    const textPrompt = `Genera textos de marketing para: ${data.productData.title}
Descripción: ${data.productData.description || 'N/A'}
Tipo: ${data.productData.productType || 'Producto'}
Tono: ${client.aiTone}
Marca: ${client.name}`

    const textCompletion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Eres un copywriter experto. Responde solo con JSON: {title, subtitle, benefits:[], claims:[], callToAction, shortText, longText, hashtags:[]}'
        },
        {
          role: 'user',
          content: textPrompt
        }
      ],
      temperature: 0.8
    })
    
    let generatedTexts
    try {
      let textResponse = textCompletion.choices[0]?.message?.content || '{}'
      textResponse = textResponse.replace(/```json\n?|\n?```/g, '').trim()
      generatedTexts = JSON.parse(textResponse)
    } catch {
      generatedTexts = {
        title: data.productData.title,
        subtitle: `El mejor ${data.productData.productType || 'producto'}`,
        benefits: ['Calidad premium', 'Diseño único', 'Garantía total'],
        claims: ['#1 en el mercado'],
        callToAction: '¡Comprar ahora!',
        shortText: data.productData.title,
        longText: `Descubre ${data.productData.title}, calidad premium para ti.`,
        hashtags: ['moda', 'estilo', 'calidad']
      }
    }
    
    // 4. Generar imagen de fondo si es necesario
    let backgroundUrl = null
    if (preset?.backgroundStyle === 'gradient' || !preset) {
      const bgPrompt = `Fondo profesional para ${data.productData.productType || 'producto'}, estilo ${preset?.compositionStyle || 'modern'}, colores ${client.primaryColor} y ${client.secondaryColor}`
      
      try {
        const bgResponse = await zai.images.generations.create({
          prompt: bgPrompt,
          size: '1024x1024'
        })
        
        if (bgResponse.data[0]?.base64) {
          const bgFileName = `bg-${Date.now()}.png`
          const bgFilePath = join(downloadDir, bgFileName)
          await writeFile(bgFilePath, Buffer.from(bgResponse.data[0].base64, 'base64'))
          backgroundUrl = `/generated/${bgFileName}`
        }
      } catch (bgError) {
        console.error('Error generating background:', bgError)
      }
    }
    
    // 5. Crear registro de contenido generado
    const content = await prisma.generatedContent.create({
      data: {
        clientId: data.clientId,
        productId: product?.id,
        presetId: preset?.id,
        title: generatedTexts.title,
        subtitle: generatedTexts.subtitle,
        benefits: JSON.stringify(generatedTexts.benefits),
        claims: JSON.stringify(generatedTexts.claims),
        callToAction: generatedTexts.callToAction,
        shortText: generatedTexts.shortText,
        longText: generatedTexts.longText,
        composedImage: backgroundUrl,
        generationPrompt: textPrompt,
        aiModel: 'gpt-4',
        generationTime: (Date.now() - startTime) / 1000,
        status: 'completed',
      }
    })
    
    // 6. Actualizar estado del producto
    if (product) {
      await prisma.product.update({
        where: { id: product.id },
        data: { status: 'processed' }
      })
    }
    
    // 7. Incrementar uso del preset
    if (preset) {
      await prisma.preset.update({
        where: { id: preset.id },
        data: { usageCount: { increment: 1 } }
      })
    }
    
    return NextResponse.json({
      success: true,
      content: {
        id: content.id,
        texts: generatedTexts,
        backgroundImage: backgroundUrl,
        product: product ? {
          id: product.id,
          title: product.title
        } : null,
        preset: preset ? {
          id: preset.id,
          name: preset.name
        } : null,
        generationTime: content.generationTime
      }
    })
    
  } catch (error) {
    console.error('Error in generate-content:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al generar contenido'
    }, { status: 500 })
  }
}
