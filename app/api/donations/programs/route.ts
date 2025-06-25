import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/donations/programs
export async function GET() {
  try {
    // Session check removed for public access
    const programs = await prisma.donationProgram.findMany({
      include: {
        _count: {
          select: {
            transactions: true
          }
        },
        transactions: {
          where: {
            status: 'approved'
          },
          select: {
            amount: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate currentAmount for each program
    const programsWithCurrentAmount = programs.map(program => {
      const currentAmount = program.transactions.reduce((sum, transaction) => sum + transaction.amount, 0)
      return {
        ...program,
        currentAmount,
        transactions: undefined // Remove transactions from response
      }
    })

    return NextResponse.json(programsWithCurrentAmount)
  } catch (error) {
    console.error('Error fetching donation programs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/donations/programs
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      type,
      targetAmount,
      deadline,
      startDate,
      endDate,
      status,
      visible,
      thumbnail
    } = body

    // Validation
    if (!title || !description || !type || !startDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['wajib', 'sukarela', 'program'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid donation type' },
        { status: 400 }
      )
    }

    if (!['draft', 'aktif', 'selesai'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const program = await prisma.donationProgram.create({
      data: {
        title,
        description,
        type,
        targetAmount: targetAmount ? parseInt(targetAmount) : null,
        deadline: deadline ? new Date(deadline) : null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status,
        visible: visible ?? true,
        thumbnail: thumbnail || null
      }
    })

    return NextResponse.json(program, { status: 201 })
  } catch (error) {
    console.error('Error creating donation program:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}