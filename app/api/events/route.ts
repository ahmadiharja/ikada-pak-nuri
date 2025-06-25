import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// GET - Fetch all events
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        _count: {
          select: {
            registrations: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Gagal memuat data event' },
      { status: 500 }
    )
  }
}
// POST - Create new event
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Received body:', body)
    
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
      console.log('Validation failed:', { title, description, type, date })
      return NextResponse.json(
        { error: 'Field wajib tidak boleh kosong' },
        { status: 400 }
      )
    }

    const event = await prisma.event.create({
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

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Gagal membuat event' },
      { status: 500 }
    )
  }
}