import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PATCH - Verify or reject alumni
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json()
    const { id } = params

    // Validate status
    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Status tidak valid' },
        { status: 400 }
      )
    }

    // Check if alumni exists
    const existingAlumni = await prisma.alumni.findUnique({
      where: { id }
    })

    if (!existingAlumni) {
      return NextResponse.json(
        { error: 'Alumni tidak ditemukan' },
        { status: 404 }
      )
    }

    // Update alumni status and verification
    const updatedAlumni = await prisma.alumni.update({
      where: { id },
      data: {
        status,
        isVerified: status === 'VERIFIED'
      }
    })

    return NextResponse.json({
      message: `Alumni berhasil ${status === 'VERIFIED' ? 'diverifikasi' : 'ditolak'}`,
      alumni: updatedAlumni
    })
  } catch (error) {
    console.error('Error verifying alumni:', error)
    return NextResponse.json(
      { error: 'Gagal memverifikasi alumni' },
      { status: 500 }
    )
  }
}