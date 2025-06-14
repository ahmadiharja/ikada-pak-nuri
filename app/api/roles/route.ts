import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Schema untuk validasi input role
const createRoleSchema = z.object({
  name: z.string().min(1, 'Nama role harus diisi'),
  description: z.string().optional(),
  isActive: z.boolean().default(true)
})

// GET /api/roles - Mengambil semua roles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const isActive = searchParams.get('isActive')
    
    const skip = (page - 1) * limit
    
    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }
    
    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where,
        include: {
          _count: {
            select: {
              rolePermissions: true,
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
      prisma.role.count({ where })
    ])
    
    return NextResponse.json({
      roles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat mengambil data role' },
      { status: 500 }
    )
  }
}

// POST /api/roles - Membuat role baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createRoleSchema.parse(body)
    
    // Cek apakah nama role sudah digunakan
    const existingRole = await prisma.role.findUnique({
      where: { name: validatedData.name }
    })
    
    if (existingRole) {
      return NextResponse.json(
        { message: 'Nama role sudah digunakan' },
        { status: 400 }
      )
    }
    
    // Buat role baru
    const role = await prisma.role.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        isActive: validatedData.isActive
      },
      include: {
        _count: {
          select: {
            rolePermissions: true,
            userRoles: true
          }
        }
      }
    })
    
    return NextResponse.json(
      {
        message: 'Role berhasil dibuat',
        role
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
    
    console.error('Error creating role:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat membuat role' },
      { status: 500 }
    )
  }
}