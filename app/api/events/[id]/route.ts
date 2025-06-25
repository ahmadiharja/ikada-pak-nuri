import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// GET - Fetch single event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const event = await prisma.event.findUnique({
      where: {
        id: resolvedParams.id
      },
      include: {
        formFields: {
          orderBy: {
            order: 'asc'
          }
        },
        _count: {
          select: {
            registrations: true
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Gagal memuat data event' },
      { status: 500 }
    )
  }
}

// PUT - Update event
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
    const {
      title,
      description,
      type,
      eventType,
      onlineLink,
      date,
      location,
      imageUrl,
      maxParticipants,
      status
    } = body

    // Validation
    if (!title || !description || !type || !date) {
      return NextResponse.json(
        { error: 'Field wajib tidak boleh kosong' },
        { status: 400 }
      )
    }

    const event = await prisma.event.update({
      where: {
        id: resolvedParams.id
      },
      data: {
        title,
        description,
        type,
        eventType: eventType || 'OFFLINE',
        onlineLink: onlineLink || null,
        date: new Date(date),
        location: location || null,
        imageUrl: imageUrl || null,
        maxParticipants: maxParticipants || null,
        status: status || 'DRAFT'
      },
      include: {
        _count: {
          select: {
            registrations: true
          }
        }
      }
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui event' },
      { status: 500 }
    )
  }
}

// DELETE - Delete event
export async function DELETE(
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

    // Delete event (cascade will handle related records)
    await prisma.event.delete({
      where: {
        id: resolvedParams.id
      }
    })

    return NextResponse.json({ message: 'Event berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus event' },
      { status: 500 }
    )
  }
}