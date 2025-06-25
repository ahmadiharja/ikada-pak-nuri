import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// POST - Alumni login with phone or username
export async function POST(request: NextRequest) {
  try {
    const { loginField, password } = await request.json()

    // Validate required fields
    if (!loginField || !password) {
      return NextResponse.json(
        { error: 'No HP/Username dan password wajib diisi' },
        { status: 400 }
      )
    }

    // Find alumni by phone or username
    const alumni = await prisma.alumni.findFirst({
      where: {
        OR: [
          { phone: loginField.trim() },
          { username: loginField.trim() }
        ]
      },
      include: {
        syubiyah: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!alumni) {
      return NextResponse.json(
        { error: 'No HP/Username tidak ditemukan' },
        { status: 401 }
      )
    }

    // Check if alumni is verified
    if (!alumni.isVerified || alumni.status !== 'VERIFIED') {
      return NextResponse.json(
        { error: 'Akun alumni belum diverifikasi oleh admin' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, alumni.password)
    if (!isPasswordValid) {
      // Increment login attempts
      await prisma.alumni.update({
        where: { id: alumni.id },
        data: {
          loginAttempts: alumni.loginAttempts + 1,
          ...(alumni.loginAttempts + 1 >= 5 && {
            lockedUntil: new Date(Date.now() + 30 * 60 * 1000) // Lock for 30 minutes
          })
        }
      })

      return NextResponse.json(
        { error: 'Password salah' },
        { status: 401 }
      )
    }

    // Check if account is locked
    if (alumni.lockedUntil && new Date() < alumni.lockedUntil) {
      return NextResponse.json(
        { error: 'Akun terkunci karena terlalu banyak percobaan login gagal. Coba lagi nanti.' },
        { status: 401 }
      )
    }

    // Reset login attempts and update last login
    await prisma.alumni.update({
      where: { id: alumni.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date()
      }
    })

    // Generate JWT token
    const token = jwt.sign(
      {
        id: alumni.id,
        email: alumni.email,
        fullName: alumni.fullName,
        type: 'alumni'
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    // Return success response with token and alumni data
    const alumniData = {
      id: alumni.id,
      fullName: alumni.fullName,
      email: alumni.email,
      phone: alumni.phone,
      username: alumni.username,
      profilePhoto: alumni.profilePhoto ? `/foto_alumni/${alumni.profilePhoto}` : null,
      syubiyah: alumni.syubiyah,
      tahunMasuk: alumni.tahunMasuk,
      tahunKeluar: alumni.tahunKeluar,
      pendidikanTerakhir: alumni.pendidikanTerakhir,
      pekerjaan: alumni.pekerjaan,
      statusPernikahan: alumni.statusPernikahan,
      penghasilanBulan: alumni.penghasilanBulan
    }

    return NextResponse.json({
      message: 'Login berhasil',
      token,
      alumni: alumniData
    })
  } catch (error) {
    console.error('Alumni login error:', error)
    return NextResponse.json(
      { error: 'Gagal melakukan login' },
      { status: 500 }
    )
  }
}