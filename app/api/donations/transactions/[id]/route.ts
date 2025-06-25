import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateTransactionSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  adminNotes: z.string().optional(),
  amount: z.number().positive().optional(),
  paymentMethod: z.string().optional(),
  transferProof: z.string().optional(),
  notes: z.string().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const transaction = await prisma.donationTransaction.findUnique({
      where: { id: params.id },
      include: {
        alumni: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true
          }
        },
        program: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            targetAmount: true,
            isActive: true
          }
        }
      }
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error fetching donation transaction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateTransactionSchema.parse(body)

    // Check if transaction exists
    const existingTransaction = await prisma.donationTransaction.findUnique({
      where: { id: params.id },
      include: {
        alumni: true,
        program: true
      }
    })

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check permissions - only admin can update status, alumni can update their own transaction details
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin'
    const isOwner = existingTransaction.alumniId === session.user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Tidak memiliki izin untuk mengubah transaksi ini' },
        { status: 403 }
      )
    }

    // Only admin can change status
    if (validatedData.status && !isAdmin) {
      return NextResponse.json(
        { error: 'Hanya admin yang dapat mengubah status transaksi' },
        { status: 403 }
      )
    }

    // Alumni can only update their pending transactions
    if (isOwner && !isAdmin && existingTransaction.status !== 'pending') {
      return NextResponse.json(
        { error: 'Hanya transaksi dengan status pending yang dapat diubah' },
        { status: 400 }
      )
    }

    const updateData: any = {}

    if (isAdmin) {
      // Admin can update all fields
      if (validatedData.status !== undefined) updateData.status = validatedData.status
      if (validatedData.adminNotes !== undefined) updateData.adminNotes = validatedData.adminNotes
    }

    if (isOwner || isAdmin) {
      // Owner and admin can update transaction details
      if (validatedData.amount !== undefined) updateData.amount = validatedData.amount
      if (validatedData.paymentMethod !== undefined) updateData.paymentMethod = validatedData.paymentMethod
      if (validatedData.transferProof !== undefined) updateData.transferProof = validatedData.transferProof
      if (validatedData.notes !== undefined) updateData.notes = validatedData.notes
    }

    const transaction = await prisma.donationTransaction.update({
      where: { id: params.id },
      data: updateData,
      include: {
        alumni: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true
          }
        },
        program: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            targetAmount: true,
            isActive: true
          }
        }
      }
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error updating donation transaction:', error)
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if transaction exists
    const existingTransaction = await prisma.donationTransaction.findUnique({
      where: { id: params.id }
    })

    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check permissions - only admin or owner can delete
    const isAdmin = session.user.role === 'admin' || session.user.role === 'super_admin'
    const isOwner = existingTransaction.alumniId === session.user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Tidak memiliki izin untuk menghapus transaksi ini' },
        { status: 403 }
      )
    }

    // Only pending transactions can be deleted
    if (existingTransaction.status !== 'pending') {
      return NextResponse.json(
        { error: 'Hanya transaksi dengan status pending yang dapat dihapus' },
        { status: 400 }
      )
    }

    await prisma.donationTransaction.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Transaksi berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting donation transaction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}