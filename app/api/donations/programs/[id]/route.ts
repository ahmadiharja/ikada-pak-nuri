import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/donations/programs/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const program = await prisma.donationProgram.findUnique({
      where: { id: params.id },
      include: {
        transactions: {
          include: {
            alumni: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            transactions: true
          }
        }
      }
    })

    if (!program) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      )
    }

    // Calculate currentAmount from approved transactions
    const approvedTransactions = program.transactions.filter((t: any) => t.status === 'approved')
    const currentAmount = approvedTransactions.reduce((sum: number, transaction: any) => sum + transaction.amount, 0)

    // Add currentAmount to the response
    const programWithCurrentAmount = {
      ...program,
      currentAmount
    }

    return NextResponse.json(programWithCurrentAmount)
  } catch (error) {
    console.error('Error fetching donation program:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/donations/programs/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const program = await prisma.donationProgram.update({
      where: { id: params.id },
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

    return NextResponse.json(program)
  } catch (error) {
    console.error('Error updating donation program:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/donations/programs/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if program has transactions
    const transactionCount = await prisma.donationTransaction.count({
      where: { programId: params.id }
    })

    if (transactionCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete program with existing transactions' },
        { status: 400 }
      )
    }

    await prisma.donationProgram.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Program deleted successfully' })
  } catch (error) {
    console.error('Error deleting donation program:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}