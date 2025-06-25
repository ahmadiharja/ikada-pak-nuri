import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

// GET - Check if alumni is already registered for an event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    let decoded: any
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const eventId = resolvedParams.id
    const alumniId = decoded.id

    // Check if alumni is already registered for this event
    const existingRegistration = await prisma.eventRegistration.findFirst({
      where: {
        eventId: eventId,
        alumniId: alumniId
      }
    })

    return NextResponse.json({
      isRegistered: !!existingRegistration,
      registrationId: existingRegistration?.id || null
    })

  } catch (error) {
    console.error('Error checking registration status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}