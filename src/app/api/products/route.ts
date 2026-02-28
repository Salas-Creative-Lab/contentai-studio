import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Listar productos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const status = searchParams.get('status')
    
    const where: Record<string, unknown> = {}
    if (clientId) where.clientId = clientId
    if (status) where.status = status
    
    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        type: true,
        contents: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      }
    })
    
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 })
  }
}

// POST - Crear nuevo producto
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const product = await prisma.product.create({
      data: {
        clientId: data.clientId,
        title: data.title,
        description: data.description || null,
        price: data.price || null,
        currency: data.currency || 'ARS',
        sku: data.sku || null,
        detectedType: data.detectedType || null,
        typeId: data.typeId || null,
        detectionScore: data.detectionScore || null,
        isCorrectlyDetected: data.isCorrectlyDetected ?? true,
        manualCorrection: data.manualCorrection || null,
        attributes: data.attributes ? JSON.stringify(data.attributes) : null,
        variants: data.variants ? JSON.stringify(data.variants) : null,
        originalImage: data.originalImage || null,
        processedImage: data.processedImage || null,
        noBackgroundImage: data.noBackgroundImage || null,
        enhancedImage: data.enhancedImage || null,
        status: data.status || 'draft',
      },
      include: {
        type: true
      }
    })
    
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 })
  }
}

// PUT - Actualizar producto
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data
    
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...updateData,
        attributes: updateData.attributes ? JSON.stringify(updateData.attributes) : undefined,
        variants: updateData.variants ? JSON.stringify(updateData.variants) : undefined,
      },
      include: {
        type: true
      }
    })
    
    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ error: 'Error al actualizar producto' }, { status: 500 })
  }
}

// DELETE - Eliminar producto
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }
    
    await prisma.product.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ error: 'Error al eliminar producto' }, { status: 500 })
  }
}
