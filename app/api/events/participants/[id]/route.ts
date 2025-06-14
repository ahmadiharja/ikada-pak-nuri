import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateParticipantSchema = z.object({
  status: z.enum(['REGISTERED', 'CONFIRMED', 'ATTENDED', 'CANCELLED', 'NO_SHOW']).optional(),
  paymentStatus: z.enum(['NOT_REQUIRED', 'PENDING', 'PAID', 'FAILED']).optional(),
  notes: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const participant = await prisma.eventParticipant.findUnique({
      where: { id: params.id },
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
      }
    });

    if (!participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    return NextResponse.json({ participant });
  } catch (error) {
    console.error('Error fetching participant:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateParticipantSchema.parse(body);

    // Check if participant exists
    const existingParticipant = await prisma.eventParticipant.findUnique({
      where: { id: params.id },
      include: {
        event: {
          select: {
            organizerId: true
          }
        }
      }
    });

    if (!existingParticipant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    // Check authorization - only event organizer or PUSAT role can update
    const userRole = session.user.role;
    const isOrganizer = existingParticipant.event.organizerId === session.user.id;
    
    if (userRole !== 'PUSAT' && !isOrganizer) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedParticipant = await prisma.eventParticipant.update({
      where: { id: params.id },
      data: validatedData,
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
      }
    });

    return NextResponse.json({ participant: updatedParticipant });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating participant:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if participant exists
    const existingParticipant = await prisma.eventParticipant.findUnique({
      where: { id: params.id },
      include: {
        event: {
          select: {
            organizerId: true
          }
        }
      }
    });

    if (!existingParticipant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    // Check authorization - only event organizer or PUSAT role can delete
    const userRole = session.user.role;
    const isOrganizer = existingParticipant.event.organizerId === session.user.id;
    
    if (userRole !== 'PUSAT' && !isOrganizer) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.eventParticipant.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Participant deleted successfully' });
  } catch (error) {
    console.error('Error deleting participant:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}