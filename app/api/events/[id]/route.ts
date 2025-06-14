import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Fetch single event by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    
    const event = await prisma.event.findUnique({
      where: { id: eventId },
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
          include: {
            alumni: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
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
          }
        },
        sessions: {
          orderBy: {
            startTime: 'asc'
          }
        }
      }
    });
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    const eventWithStats = {
      ...event,
      participantCount: event.participants.length,
      confirmedParticipants: event.participants.filter(p => p.status === 'CONFIRMED').length,
      attendedParticipants: event.participants.filter(p => p.status === 'ATTENDED').length,
      sessionCount: event.sessions.length
    };
    
    return NextResponse.json({ event: eventWithStats });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

// PUT - Update event
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const eventId = params.id;
    
    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId }
    });
    
    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Check if user is the organizer or admin
    if (existingEvent.organizerId !== session.user.id && session.user.role !== 'PUSAT') {
      return NextResponse.json(
        { error: 'Forbidden - You can only edit your own events' },
        { status: 403 }
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
    
    // Update event
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        title: title || existingEvent.title,
        description: description || existingEvent.description,
        excerpt: excerpt !== undefined ? excerpt : existingEvent.excerpt,
        imageUrl: imageUrl !== undefined ? imageUrl : existingEvent.imageUrl,
        location: location !== undefined ? location : existingEvent.location,
        locationDetail: locationDetail !== undefined ? locationDetail : existingEvent.locationDetail,
        startDate: startDate ? new Date(startDate) : existingEvent.startDate,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : existingEvent.endDate,
        registrationStart: registrationStart !== undefined ? (registrationStart ? new Date(registrationStart) : null) : existingEvent.registrationStart,
        registrationEnd: registrationEnd !== undefined ? (registrationEnd ? new Date(registrationEnd) : null) : existingEvent.registrationEnd,
        maxParticipants: maxParticipants !== undefined ? maxParticipants : existingEvent.maxParticipants,
        eventType: eventType || existingEvent.eventType,
        recurrencePattern: recurrencePattern !== undefined ? recurrencePattern : existingEvent.recurrencePattern,
        status: status || existingEvent.status,
        visibility: visibility || existingEvent.visibility,
        targetSyubiyahIds: targetSyubiyahIds !== undefined ? targetSyubiyahIds : existingEvent.targetSyubiyahIds,
        categoryId: categoryId !== undefined ? categoryId : existingEvent.categoryId,
        registrationFee: registrationFee !== undefined ? (registrationFee ? parseFloat(registrationFee) : null) : existingEvent.registrationFee,
        isOnline: isOnline !== undefined ? isOnline : existingEvent.isOnline,
        onlineLink: onlineLink !== undefined ? onlineLink : existingEvent.onlineLink,
        requirements: requirements !== undefined ? requirements : existingEvent.requirements,
        benefits: benefits !== undefined ? benefits : existingEvent.benefits,
        contactPerson: contactPerson !== undefined ? contactPerson : existingEvent.contactPerson,
        contactPhone: contactPhone !== undefined ? contactPhone : existingEvent.contactPhone,
        contactEmail: contactEmail !== undefined ? contactEmail : existingEvent.contactEmail
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
    
    // Update sessions if provided
    if (sessions !== undefined) {
      // Delete existing sessions
      await prisma.eventSession.deleteMany({
        where: { eventId }
      });
      
      // Create new sessions
      if (sessions.length > 0) {
        await prisma.eventSession.createMany({
          data: sessions.map((session: any) => ({
            eventId,
            title: session.title,
            description: session.description || null,
            startTime: new Date(session.startTime),
            endTime: new Date(session.endTime),
            speaker: session.speaker || null,
            location: session.location || null
          }))
        });
      }
    }
    
    return NextResponse.json({
      message: 'Event updated successfully',
      event: updatedEvent
    });
    
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE - Delete event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const eventId = params.id;
    
    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId }
    });
    
    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    // Check if user is the organizer or admin
    if (existingEvent.organizerId !== session.user.id && session.user.role !== 'PUSAT') {
      return NextResponse.json(
        { error: 'Forbidden - You can only delete your own events' },
        { status: 403 }
      );
    }
    
    // Delete event (cascade will handle related records)
    await prisma.event.delete({
      where: { id: eventId }
    });
    
    return NextResponse.json({
      message: 'Event deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}