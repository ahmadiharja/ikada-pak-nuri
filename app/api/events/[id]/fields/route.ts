import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// GET - Fetch event form fields
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const formFields = await prisma.eventFormField.findMany({
      where: {
        eventId: resolvedParams.id
      },
      orderBy: {
        order: 'asc'
      }
    })

    return NextResponse.json(formFields)
  } catch (error) {
    console.error('Error fetching form fields:', error)
    return NextResponse.json(
      { error: 'Gagal memuat form fields' },
      { status: 500 }
    )
  }
}

// POST - Create form field
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: {
        id: resolvedParams.id
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event tidak ditemukan' },
        { status: 404 }
      )
    }

    const formField = await prisma.eventFormField.create({
      data: {
        eventId: resolvedParams.id,
        label,
        type,
        required: required || false,
        options: options || null,
        order: order || 0
      }
    })

    return NextResponse.json(formField)
  } catch (error) {
    console.error('Error creating form field:', error)
    return NextResponse.json(
      { error: 'Gagal membuat form field' },
      { status: 500 }
    )
  }
}

// PUT - Update form fields order
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const { fields } = body

    if (!Array.isArray(fields)) {
      return NextResponse.json(
        { error: 'Fields harus berupa array' },
        { status: 400 }
      )
    }

    // Update order for each field
    const updatePromises = fields.map((field: any) => 
      prisma.eventFormField.update({
        where: {
          id: field.id
        },
        data: {
          order: field.order
        }
      })
    )

    await Promise.all(updatePromises)

    return NextResponse.json({ message: 'Urutan field berhasil diperbarui' })
  } catch (error) {
    console.error('Error updating field order:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui urutan field' },
      { status: 500 }
    )
  }
}