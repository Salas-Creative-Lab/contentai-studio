import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { slugify } from '@/lib/utils'

const prisma = new PrismaClient()

// GET - Listar todos los clientes
export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { presets: true, products: true }
        }
      }
    })
    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ error: 'Error al obtener clientes' }, { status: 500 })
  }
}

// POST - Crear nuevo cliente
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const client = await prisma.client.create({
      data: {
        name: data.name,
        slug: slugify(data.name),
        logo: data.logo || null,
        isotipo: data.isotipo || null,
        primaryColor: data.primaryColor || '#3B82F6',
        secondaryColor: data.secondaryColor || '#1E40AF',
        accentColor: data.accentColor || '#F59E0B',
        headingFont: data.headingFont || 'Inter',
        bodyFont: data.bodyFont || 'Inter',
        rubro: data.rubro || null,
        description: data.description || null,
        website: data.website || null,
        aiTone: data.aiTone || 'professional',
        aiLanguage: data.aiLanguage || 'es',
        operationMode: data.operationMode || 'manual',
        settings: data.settings ? JSON.stringify(data.settings) : null,
      }
    })
    
    return NextResponse.json(client)
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json({ error: 'Error al crear cliente' }, { status: 500 })
  }
}

// PUT - Actualizar cliente
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updateData } = data
    
    const client = await prisma.client.update({
      where: { id },
      data: {
        ...updateData,
        slug: updateData.name ? slugify(updateData.name) : undefined,
        settings: updateData.settings ? JSON.stringify(updateData.settings) : undefined,
      }
    })
    
    return NextResponse.json(client)
  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json({ error: 'Error al actualizar cliente' }, { status: 500 })
  }
}

// DELETE - Eliminar cliente
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }
    
    await prisma.client.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json({ error: 'Error al eliminar cliente' }, { status: 500 })
  }
}
