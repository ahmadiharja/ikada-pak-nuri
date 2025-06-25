import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { verifyAlumniToken } from '@/lib/alumni-auth'
import { z } from 'zod'

const createTransactionSchema = z.object({
  programId: z.string().nullable().optional(),
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  transferProof: z.string().optional()
})

const querySchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  programId: z.string().optional(),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  export: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = querySchema.parse({
      status: searchParams.get('status') || undefined,
      programId: searchParams.get('programId') || undefined,
      search: searchParams.get('search') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      export: searchParams.get('export') || undefined
    })

    const where: any = {}

    if (query.status) {
      where.status = query.status
    }

    if (query.programId) {
      where.programId = query.programId
    }

    if (query.search) {
      where.alumni = {
        OR: [
          { fullName: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } }
        ]
      }
    }

    if (query.dateFrom || query.dateTo) {
      where.createdAt = {}
      if (query.dateFrom) {
        where.createdAt.gte = new Date(query.dateFrom)
      }
      if (query.dateTo) {
        where.createdAt.lte = new Date(query.dateTo + 'T23:59:59.999Z')
      }
    }

    if (query.export === 'true') {
      // Export as CSV
      const transactions = await prisma.donationTransaction.findMany({
        where,
        include: {
          alumni: {
            select: {
              name: true,
              email: true
            }
          },
          program: {
            select: {
              title: true,
              type: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      const csvHeaders = [
        'Tanggal',
        'Alumni',
        'Email',
        'Program',
        'Tipe',
        'Jumlah',
        'Status',
        'Metode Pembayaran',
        'Catatan'
      ]

      const csvRows = transactions.map(transaction => [
        new Date(transaction.createdAt).toLocaleDateString('id-ID'),
        transaction.alumni.name,
        transaction.alumni.email,
        transaction.program?.title || 'Donasi Sukarela',
        transaction.program?.type || '-',
        transaction.amount,
        transaction.status,
        transaction.paymentMethod,
        ''
      ])

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="transaksi-donasi-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    const transactions = await prisma.donationTransaction.findMany({
      where,
      include: {
        alumni: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        program: {
          select: {
            id: true,
            title: true,
            type: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching donation transactions:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verifikasi token alumni
    const authResult = await verifyAlumniToken(request);
    if (authResult.error || !authResult.alumni) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    const { alumni } = authResult;

    const body = await request.json()
    const validatedData = createTransactionSchema.parse(body)

    // Check if program exists (only if programId is provided)
    if (validatedData.programId) {
    const program = await prisma.donationProgram.findUnique({
      where: { id: validatedData.programId }
    })

    if (!program) {
      return NextResponse.json(
        { error: 'Program donasi tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if program is active
      if (program.status !== 'aktif') {
      return NextResponse.json(
        { error: 'Program donasi tidak aktif' },
        { status: 400 }
      )
    }

    // Check if program has ended
    if (program.endDate && new Date() > program.endDate) {
      return NextResponse.json(
        { error: 'Program donasi telah berakhir' },
        { status: 400 }
      )
    }

    // Check if program has reached target (for campaign type)
    if (program.type === 'program' && program.targetAmount) {
      const totalDonations = await prisma.donationTransaction.aggregate({
        where: {
          programId: validatedData.programId,
          status: 'approved'
        },
        _sum: {
          amount: true
        }
      })

        const currentAmount = totalDonations._sum?.amount || 0
      if (currentAmount >= program.targetAmount) {
        return NextResponse.json(
          { error: 'Program donasi telah mencapai target' },
          { status: 400 }
        )
        }
      }
    }

    const transaction = await prisma.donationTransaction.create({
      data: {
        programId: validatedData.programId || null,
        amount: validatedData.amount,
        paymentMethod: validatedData.paymentMethod,
        transferProof: validatedData.transferProof || null,
        alumniId: alumni.id,
        status: 'pending'
      },
      include: {
        alumni: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        program: {
          select: {
            id: true,
            title: true,
            type: true
          }
        }
      }
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Error creating donation transaction:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}