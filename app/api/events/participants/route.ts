import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Fetch event participants
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (eventId) {
      where.eventId = eventId;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        {
          alumni: {
            name: { contains: search, mode: 'insensitive' }
          }
        },
        {
          alumni: {
            email: { contains: search, mode: 'insensitive' }
          }
        },
        {
          alumni: {
            phone: { contains: search, mode: 'insensitive' }
          }
        }
      ];
    }
    
    const [participants, total] = await Promise.all([
      prisma.eventParticipant.findMany({
        where,
        include: {
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
              endDate: true,
              location: true
            }
          },
          alumni: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              angkatan: true
            }
          },
          syubiyah: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          registeredAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.eventParticipant.count({ where })
    ]);
    
    return NextResponse.json({
      participants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching event participants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event participants' },
      { status: 500 }
    );
  }
}

// POST - Register for event
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { eventId, notes, emergencyContact, emergencyPhone } = body;
    
    // Validate required fields
    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }
    
    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        participants: true
      }
    });
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Check if registration is still open
    const now = new Date();
    if (event.registrationEnd && now > event.registrationEnd) {
      return NextResponse.json(
        { error: 'Registration period has ended' },
        { status: 400 }
      );
    }
    
    if (event.registrationStart && now < event.registrationStart) {
      return NextResponse.json(
        { error: 'Registration has not started yet' },
        { status: 400 }
      );
    }
    
    // Check if event is full
    if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
      return NextResponse.json(
        { error: 'Event is full' },
        { status: 400 }
      );
    }
    
    // Get user's alumni data
    const alumni = await prisma.alumni.findUnique({
      where: { userId: session.user.id }
    });
    
    if (!alumni) {
      return NextResponse.json(
        { error: 'Alumni profile not found' },
        { status: 400 }
      );
    }
    
    // Check if already registered
    const existingRegistration = await prisma.eventParticipant.findFirst({
      where: {
        eventId,
        alumniId: alumni.id
      }
    });
    
    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Already registered for this event' },
        { status: 400 }
      );
    }
    
    // Check visibility restrictions
    if (event.visibility === 'SPECIFIC_SYUBIYAH') {
      if (!event.targetSyubiyahIds.includes(alumni.syubiyahId)) {
        return NextResponse.json(
          { error: 'This event is not available for your syubiyah' },
          { status: 403 }
        );
      }
    }
    
    // Create registration
    const registration = await prisma.eventParticipant.create({
      data: {
        eventId,
        alumniId: alumni.id,
        syubiyahId: alumni.syubiyahId,
        status: 'REGISTERED',
        paymentStatus: event.registrationFee ? 'PENDING' : 'NOT_REQUIRED',
        notes: notes || null,
        emergencyContact: emergencyContact || null,
        emergencyPhone: emergencyPhone || null
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            location: true
          }
        },
        alumni: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    return NextResponse.json({
      message: 'Successfully registered for event',
      registration
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error registering for event:', error);
    return NextResponse.json(
      { error: 'Failed to register for event' },
      { status: 500 }
    );
  }
}