import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Fetch all events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const status = searchParams.get('status') || '';
    const eventType = searchParams.get('eventType') || '';
    const visibility = searchParams.get('visibility') || '';
    const organizerId = searchParams.get('organizerId') || '';
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (eventType) {
      where.eventType = eventType;
    }
    
    if (visibility) {
      where.visibility = visibility;
    }
    
    if (organizerId) {
      where.organizerId = organizerId;
    }
    
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              color: true
            }
          },
          participants: {
            select: {
              id: true,
              status: true
            }
          },
          sessions: {
            select: {
              id: true,
              title: true,
              startTime: true,
              endTime: true
            },
            orderBy: {
              startTime: 'asc'
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.event.count({ where })
    ]);
    
    const eventsWithStats = events.map(event => ({
      ...event,
      participantCount: event.participants.length,
      confirmedParticipants: event.participants.filter(p => p.status === 'CONFIRMED').length,
      attendedParticipants: event.participants.filter(p => p.status === 'ATTENDED').length,
      sessionCount: event.sessions.length,
      participants: undefined // Remove detailed participants from list response
    }));
    
    return NextResponse.json({
      events: eventsWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST - Create new event
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
    const {
      title,
      description,
      excerpt,
      imageUrl,
      location,
      locationDetail,
      startDate,
      endDate,
      registrationStart,
      registrationEnd,
      maxParticipants,
      eventType,
      recurrencePattern,
      status,
      visibility,
      targetSyubiyahIds,
      categoryId,
      registrationFee,
      isOnline,
      onlineLink,
      requirements,
      benefits,
      contactPerson,
      contactPhone,
      contactEmail,
      sessions
    } = body;
    
    // Validate required fields
    if (!title || !description || !startDate) {
      return NextResponse.json(
        { error: 'Title, description, and start date are required' },
        { status: 400 }
      );
    }
    
    // Create new event
    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        excerpt: excerpt || null,
        imageUrl: imageUrl || null,
        location: location || null,
        locationDetail: locationDetail || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        registrationStart: registrationStart ? new Date(registrationStart) : null,
        registrationEnd: registrationEnd ? new Date(registrationEnd) : null,
        maxParticipants: maxParticipants || null,
        eventType: eventType || 'SINGLE',
        recurrencePattern: recurrencePattern || null,
        status: status || 'PENDING',
        visibility: visibility || 'ALL_SYUBIYAH',
        targetSyubiyahIds: targetSyubiyahIds || [],
        categoryId: categoryId || null,
        organizerId: session.user.id,
        registrationFee: registrationFee ? parseFloat(registrationFee) : null,
        isOnline: isOnline || false,
        onlineLink: onlineLink || null,
        requirements: requirements || [],
        benefits: benefits || [],
        contactPerson: contactPerson || null,
        contactPhone: contactPhone || null,
        contactEmail: contactEmail || null
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            color: true
          }
        }
      }
    });
    
    // Create sessions if provided
    if (sessions && sessions.length > 0) {
      await prisma.eventSession.createMany({
        data: sessions.map((session: any) => ({
          eventId: newEvent.id,
          title: session.title,
          description: session.description || null,
          startTime: new Date(session.startTime),
          endTime: new Date(session.endTime),
          speaker: session.speaker || null,
          location: session.location || null
        }))
      });
    }
    
    return NextResponse.json({
      message: 'Event created successfully',
      event: newEvent
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}