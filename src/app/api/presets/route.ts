import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { slugify } from '@/lib/utils'

const prisma = new PrismaClient()

// GET - Listar presets (por cliente o todos)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    
    const where = clientId ? { clientId } : {}
    
    const presets = await prisma.preset.findMany({
      where,
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ],
    })
    
    return NextResponse.json(presets)
  } catch (error) {
    console.error('Error fetching presets:', error)
    return NextResponse.json({ error: 'Error al obtener presets' }, { status: 500 })
  }
}

// POST - Crear nuevo preset
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const preset = await prisma.preset.create({
      data: {
        clientId: data.clientId,
        name: data.name,
        slug: slugify(data.name),
        description: data.description || null,
        styleType: data.styleType || 'template',
        templateId: data.templateId || null,
        primaryColor: data.primaryColor || '#3B82F6',
        secondaryColor: data.secondaryColor || '#1E40AF',
        accentColor: data.accentColor || '#F59E0B',
        backgroundColor: data.backgroundColor || '#FFFFFF',
        headingFont: data.headingFont || 'Inter',
        bodyFont: data.bodyFont || 'Inter',
        textLayout: data.textLayout || 'center',
        titlePosition: data.titlePosition || 'top',
        textAlignment: data.textAlignment || 'center',
        backgroundStyle: data.backgroundStyle || 'solid',
        gradientDirection: data.gradientDirection || 'to-r',
        backgroundPattern: data.backgroundPattern || null,
        compositionStyle: data.compositionStyle || 'standard',
        imageSize: data.imageSize || 'large',
        imagePosition: data.imagePosition || 'center',
        padding: data.padding || 20,
        reelStyle: data.reelStyle || 'fade',
        reelDuration: data.reelDuration || 3,
        reelTransition: data.reelTransition || 'smooth',
        textTone: data.textTone || 'professional',
        textLength: data.textLength || 'medium',
        exportFormat: data.exportFormat || 'jpg',
        exportSizes: data.exportSizes || '1080x1080,1080x1920,1200x628',
        exportPath: data.exportPath || null,
        socialNetworks: data.socialNetworks ? JSON.stringify(data.socialNetworks) : null,
        isDefault: data.isDefault || false,
      }
    })
    
    return NextResponse.json(preset)
  } catch (error) {
    console.error('Error creating preset:', error)
    return NextResponse.json({ error: 'Error al crear preset' }, { status: 500 })
  }
}

// PUT - Actualizar preset
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data
    
    const preset = await prisma.preset.update({
      where: { id },
      data: {
        ...updateData,
        slug: updateData.name ? slugify(updateData.name) : undefined,
        socialNetworks: updateData.socialNetworks ? JSON.stringify(updateData.socialNetworks) : undefined,
      }
    })
    
    return NextResponse.json(preset)
  } catch (error) {
    console.error('Error updating preset:', error)
    return NextResponse.json({ error: 'Error al actualizar preset' }, { status: 500 })
  }
}

// DELETE - Eliminar preset
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }
    
    await prisma.preset.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting preset:', error)
    return NextResponse.json({ error: 'Error al eliminar preset' }, { status: 500 })
  }
}
