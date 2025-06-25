import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

// GET - Export registrations to CSV
export async function GET(
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
    
    // Get event with registrations
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
        registrations: {
          include: {
            alumni: {
              select: {
                name: true,
                email: true,
                phone: true,
                syubiyah: {
                  select: {
                    name: true
                  }
                }
              }
            },
            answers: {
              include: {
                formField: true
              },
              orderBy: {
                formField: {
                  order: 'asc'
                }
              }
            }
          },
          orderBy: {
            registeredAt: 'desc'
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

    // Build CSV headers
    const headers = [
      'No',
      'Nama',
      'Email',
      'Telepon',
      'Syubiyah',
      'Tanggal Daftar',
      ...event.formFields.map(field => field.label)
    ]

    // Build CSV rows
    const rows = event.registrations.map((registration, index) => {
      const baseData = [
        (index + 1).toString(),
        registration.alumni.name || '',
        registration.alumni.email || '',
        registration.alumni.phone || '',
        registration.alumni.syubiyah?.name || '',
        registration.registeredAt.toLocaleDateString('id-ID')
      ]

      // Add form field answers
      const answers = event.formFields.map(field => {
        const answer = registration.answers.find(a => a.formFieldId === field.id)
        return answer ? answer.value : ''
      })

      return [...baseData, ...answers]
    })

    // Convert to CSV format
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(cell => 
          // Escape commas and quotes in cell content
          `"${cell.toString().replace(/"/g, '""')}"`
        ).join(',')
      )
    ].join('\n')

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="registrasi-${event.title.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.csv"`,
        'Cache-Control': 'no-cache'
      }
    })
  } catch (error) {
    console.error('Error exporting registrations:', error)
    return NextResponse.json(
      { error: 'Gagal mengekspor data registrasi' },
      { status: 500 }
    )
  }
}