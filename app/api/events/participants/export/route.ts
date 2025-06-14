import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const status = searchParams.get('status');
    const formatType = searchParams.get('format') || 'csv';

    // Build where clause
    const where: any = {};
    if (eventId) {
      where.eventId = eventId;
    }
    if (status) {
      where.status = status;
    }

    // Fetch participants
    const participants = await prisma.eventParticipant.findMany({
      where,
      include: {
        event: {
          select: {
            title: true,
            startDate: true,
            endDate: true,
            location: true
          }
        },
        alumni: {
          select: {
            name: true,
            email: true,
            phone: true,
            angkatan: true
          }
        },
        syubiyah: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        registeredAt: 'desc'
      }
    });

    if (formatType === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'Nama',
        'Email',
        'Telepon',
        'Angkatan',
        'Syubiyah',
        'Event',
        'Tanggal Event',
        'Lokasi',
        'Status',
        'Status Pembayaran',
        'Tanggal Daftar',
        'Kontak Darurat',
        'Telepon Darurat',
        'Catatan'
      ];

      const csvRows = participants.map(participant => [
        participant.alumni.name,
        participant.alumni.email,
        participant.alumni.phone || '',
        participant.alumni.angkatan || '',
        participant.syubiyah.name,
        participant.event.title,
        format(new Date(participant.event.startDate), 'dd/MM/yyyy HH:mm', { locale: id }),
        participant.event.location || '',
        participant.status,
        participant.paymentStatus,
        format(new Date(participant.registeredAt), 'dd/MM/yyyy HH:mm', { locale: id }),
        participant.emergencyContact || '',
        participant.emergencyPhone || '',
        participant.notes || ''
      ]);

      // Escape CSV values
      const escapeCsvValue = (value: string) => {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      };

      const csvContent = [
        csvHeaders.map(escapeCsvValue).join(','),
        ...csvRows.map(row => row.map(cell => escapeCsvValue(String(cell))).join(','))
      ].join('\n');

      // Add BOM for proper UTF-8 encoding in Excel
      const bom = '\uFEFF';
      const csvWithBom = bom + csvContent;

      return new NextResponse(csvWithBom, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="event-participants-${format(new Date(), 'yyyy-MM-dd')}.csv"`
        }
      });
    }

    // Return JSON format
    return NextResponse.json({ participants });
  } catch (error) {
    console.error('Error exporting participants:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}