import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const {
      fullName,
      email,
      password,
      phone,
      username
    } = await request.json()

    if (!fullName || !email || !password || (!phone && !username)) {
      return NextResponse.json({ error: 'Nama, email, password, dan no HP/username wajib diisi.' }, { status: 400 })
    }

    // Cek email sudah terdaftar
    const existingEmail = await prisma.alumni.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json({ error: 'Email sudah terdaftar.' }, { status: 400 })
    }

    // Cek phone sudah terdaftar
    if (phone) {
      const existingPhone = await prisma.alumni.findFirst({ where: { phone } })
      if (existingPhone) {
        return NextResponse.json({ error: 'No HP sudah terdaftar.' }, { status: 400 })
      }
    }

    // Cek username sudah terdaftar
    if (username) {
      const existingUsername = await prisma.alumni.findFirst({ where: { username } })
      if (existingUsername) {
        return NextResponse.json({ error: 'Username sudah terdaftar.' }, { status: 400 })
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Simpan alumni baru
    const newAlumni = await prisma.alumni.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        phone: phone || null,
        username: username || null,
        isVerified: false,
        status: 'PENDING',
      }
    })

    return NextResponse.json({ message: 'Pendaftaran alumni berhasil. Tunggu verifikasi admin.' })
  } catch (error) {
    console.error('Error register alumni:', error)
    return NextResponse.json({ error: 'Gagal mendaftar alumni.' }, { status: 500 })
  }
} 