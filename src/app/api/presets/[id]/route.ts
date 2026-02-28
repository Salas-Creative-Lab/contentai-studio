import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/presets/[id] - Get a single preset
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const preset = await db.preset.findUnique({
      where: { id },
      include: {
        client: true
      }
    })

    if (!preset) {
      return NextResponse.json({ error: 'Preset not found' }, { status: 404 })
    }

    return NextResponse.json(preset)
  } catch (error) {
    console.error('Error fetching preset:', error)
    return NextResponse.json({ error: 'Failed to fetch preset' }, { status: 500 })
  }
}

// PUT /api/presets/[id] - Update a preset
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // If setting as default, remove default from other presets
    if (body.isDefault) {
      const preset = await db.preset.findUnique({ where: { id }, select: { clientId: true } })
      if (preset) {
        await db.preset.updateMany({
          where: { clientId: preset.clientId, isDefault: true },
          data: { isDefault: false }
        })
      }
    }
    
    const preset = await db.preset.update({
      where: { id },
      data: body
    })

    return NextResponse.json(preset)
  } catch (error) {
    console.error('Error updating preset:', error)
    return NextResponse.json({ error: 'Failed to update preset' }, { status: 500 })
  }
}

// DELETE /api/presets/[id] - Delete a preset
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.preset.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting preset:', error)
    return NextResponse.json({ error: 'Failed to delete preset' }, { status: 500 })
  }
}
