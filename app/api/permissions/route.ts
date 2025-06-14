import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Schema untuk validasi input permission
const createPermissionSchema = z.object({
  name: z.string().min(1, 'Nama permission harus diisi'),
  description: z.string().optional(),
  module: z.string().min(1, 'Module harus diisi'),
  action: z.string().min(1, 'Action harus diisi')
})

// GET /api/permissions - Mengambil semua permissions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const module = searchParams.get('module')
    
    const skip = (page - 1) * limit
    
    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { module: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (module) {
      where.module = module
    }
    
    const [permissions, total] = await Promise.all([
      prisma.permission.findMany({
        where,
        include: {
          _count: {
            select: {
              rolePermissions: true
            }
          }
        },
        orderBy: [
          { module: 'asc' },
          { action: 'asc' },
          { name: 'asc' }
        ],
        skip,
        take: limit
      }),
      prisma.permission.count({ where })
    ])
    
    // Group permissions by module
    const groupedPermissions = permissions.reduce((acc, permission) => {
      const module = permission.module
      if (!acc[module]) {
        acc[module] = []
      }
      acc[module].push(permission)
      return acc
    }, {} as Record<string, typeof permissions>)
    
    return NextResponse.json({
      permissions,
      groupedPermissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat mengambil data permission' },
      { status: 500 }
    )
  }
}

// POST /api/permissions - Membuat permission baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createPermissionSchema.parse(body)
    
    // Cek apakah nama permission sudah digunakan
    const existingPermission = await prisma.permission.findUnique({
      where: { name: validatedData.name }
    })
    
    if (existingPermission) {
      return NextResponse.json(
        { message: 'Nama permission sudah digunakan' },
        { status: 400 }
      )
    }
    
    // Buat permission baru
    const permission = await prisma.permission.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        module: validatedData.module,
        action: validatedData.action
      },
      include: {
        _count: {
          select: {
            rolePermissions: true
          }
        }
      }
    })
    
    return NextResponse.json(
      {
        message: 'Permission berhasil dibuat',
        permission
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
    
    console.error('Error creating permission:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat membuat permission' },
      { status: 500 }
    )
  }
}