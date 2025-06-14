import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// Schema untuk validasi input user
const createUserSchema = z.object({
  name: z.string().min(1, 'Nama harus diisi'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  role: z.enum(['PUSAT', 'SYUBIYAH'], {
    errorMap: () => ({ message: 'Role harus PUSAT atau SYUBIYAH' })
  }),
  syubiyah_id: z.string().optional()
})

const updateUserSchema = z.object({
  name: z.string().min(1, 'Nama harus diisi').optional(),
  email: z.string().email('Format email tidak valid').optional(),
  password: z.string().min(6, 'Password minimal 6 karakter').optional(),
  role: z.enum(['PUSAT', 'SYUBIYAH'], {
    errorMap: () => ({ message: 'Role harus PUSAT atau SYUBIYAH' })
  }).optional(),
  syubiyah_id: z.string().optional()
})

// GET /api/users - Mengambil semua users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role')
    
    const skip = (page - 1) * limit
    
    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (role && ['PUSAT', 'SYUBIYAH'].includes(role)) {
      where.role = role
    }
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          syubiyah: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              userRoles: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ])
    
    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat mengambil data pengguna' },
      { status: 500 }
    )
  }
}

// POST /api/users - Membuat user baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createUserSchema.parse(body)
    
    // Validasi syubiyah_id jika role adalah SYUBIYAH
    if (validatedData.role === 'SYUBIYAH') {
      if (!validatedData.syubiyah_id) {
        return NextResponse.json(
          { message: 'Syubiyah harus dipilih untuk admin syubiyah' },
          { status: 400 }
        )
      }
      
      // Cek apakah syubiyah exists
      const syubiyah = await prisma.syubiyah.findUnique({
        where: { id: validatedData.syubiyah_id }
      })
      
      if (!syubiyah) {
        return NextResponse.json(
          { message: 'Syubiyah tidak ditemukan' },
          { status: 400 }
        )
      }
    }
    
    // Cek apakah email sudah digunakan
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email sudah digunakan' },
        { status: 400 }
      )
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)
    
    // Buat user baru
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
        syubiyah_id: validatedData.role === 'SYUBIYAH' ? validatedData.syubiyah_id : null,
        isVerified: true // Auto verify untuk admin
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
    
    // Remove password dari response
    const { password, ...userWithoutPassword } = user
    
    return NextResponse.json(
      {
        message: 'Pengguna berhasil dibuat',
        user: userWithoutPassword
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      )
    }
    
    console.error('Error creating user:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat membuat pengguna' },
      { status: 500 }
    )
  }
}