import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST - Validate unique phone and username
export async function POST(request: NextRequest) {
  try {
    const { phone, username, excludeId } = await request.json()

    // Check if phone already exists
    if (phone && phone.trim() !== '') {
      const existingPhoneAlumni = await prisma.alumni.findFirst({
        where: {
          phone: phone.trim(),
          ...(excludeId && { id: { not: excludeId } })
        }
      })

      if (existingPhoneAlumni) {
        return NextResponse.json(
          { error: 'Nomor HP sudah digunakan oleh alumni lain' },
          { status: 400 }
        )
      }
    }

    // Check if username already exists
    if (username && username.trim() !== '') {
      const existingUsernameAlumni = await prisma.alumni.findFirst({
        where: {
          username: username.trim(),
          ...(excludeId && { id: { not: excludeId } })
        }
      })

      if (existingUsernameAlumni) {
        return NextResponse.json(
          { error: 'Username sudah digunakan oleh alumni lain' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json({ message: 'Validasi berhasil' })
  } catch (error) {
    console.error('Error validating alumni fields:', error)
    return NextResponse.json(
      { error: 'Gagal memvalidasi data' },
      { status: 500 }
    )
  }
}