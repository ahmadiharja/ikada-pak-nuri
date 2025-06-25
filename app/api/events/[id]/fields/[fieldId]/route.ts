import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// GET - Fetch single form field
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fieldId: string }> }
) {
  try {
    const resolvedParams = await params
    const formField = await prisma.eventFormField.findUnique({
      where: {
        id: resolvedParams.fieldId,
        eventId: resolvedParams.id
      }
    })

    if (!formField) {
      return NextResponse.json(
        { error: 'Form field tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(formField)
  } catch (error) {
    console.error('Error fetching form field:', error)
    return NextResponse.json(
      { error: 'Gagal memuat form field' },
      { status: 500 }
    )
  }
}

// PUT - Update form field
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fieldId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const body = await request.json()
    const {
      label,
      type,
      required,
      options,
      order
    } = body

    // Validation
    if (!label || !type) {
      return NextResponse.json(
        { error: 'Label dan tipe field wajib diisi' },
        { status: 400 }
      )
    }

    const formField = await prisma.eventFormField.update({
      where: {
        id: resolvedParams.fieldId,
        eventId: resolvedParams.id
      },
      data: {
        label,
        type,
        required: required || false,
        options: options || null,
        order: order || 0
      }
    })

    return NextResponse.json(formField)
  } catch (error) {
    console.error('Error updating form field:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui form field' },
      { status: 500 }
    )
  }
}

// DELETE - Delete form field
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fieldId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    
    // Check if form field exists
    const formField = await prisma.eventFormField.findUnique({
      where: {
        id: resolvedParams.fieldId,
        eventId: resolvedParams.id
      }
    })

    if (!formField) {
      return NextResponse.json(
        { error: 'Form field tidak ditemukan' },
        { status: 404 }
      )
    }

    // Delete form field
    await prisma.eventFormField.delete({
      where: {
        id: resolvedParams.fieldId
      }
    })

    return NextResponse.json({ message: 'Form field berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting form field:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus form field' },
      { status: 500 }
    )
  }
}