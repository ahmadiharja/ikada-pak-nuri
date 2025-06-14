import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Schema untuk validasi input role
const roleSchema = z.object({
  roleId: z.string().min(1, 'Role ID harus diisi')
})

// GET /api/users/[id]/roles - Mengambil semua role user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // Cek apakah user exists
    const user = await prisma.user.findUnique({
      where: { id }
    })
    
    if (!user) {
      return NextResponse.json(
        { message: 'Pengguna tidak ditemukan' },
        { status: 404 }
      )
    }
    
    // Ambil semua role user
    const userRoles = await prisma.userRole.findMany({
      where: { userId: id },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
            isActive: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json({
      userRoles
    })
  } catch (error) {
    console.error('Error fetching user roles:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat mengambil role pengguna' },
      { status: 500 }
    )
  }
}

// POST /api/users/[id]/roles - Menambah role ke user
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { roleId } = roleSchema.parse(body)
    
    // Cek apakah user exists
    const user = await prisma.user.findUnique({
      where: { id }
    })
    
    if (!user) {
      return NextResponse.json(
        { message: 'Pengguna tidak ditemukan' },
        { status: 404 }
      )
    }
    
    // Cek apakah role exists dan aktif
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    })
    
    if (!role) {
      return NextResponse.json(
        { message: 'Role tidak ditemukan' },
        { status: 404 }
      )
    }
    
    if (!role.isActive) {
      return NextResponse.json(
        { message: 'Role tidak aktif' },
        { status: 400 }
      )
    }
    
    // Cek apakah user sudah memiliki role ini
    const existingUserRole = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId: id,
          roleId: roleId
        }
      }
    })
    
    if (existingUserRole) {
      return NextResponse.json(
        { message: 'Pengguna sudah memiliki role ini' },
        { status: 400 }
      )
    }
    
    // Tambah role ke user
    const userRole = await prisma.userRole.create({
      data: {
        userId: id,
        roleId: roleId
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
            isActive: true
          }
        }
      }
    })
    
    return NextResponse.json(
      {
        message: 'Role berhasil ditambahkan ke pengguna',
        userRole
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
    
    console.error('Error adding role to user:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat menambahkan role' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id]/roles - Menghapus role dari user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { roleId } = roleSchema.parse(body)
    
    // Cek apakah user exists
    const user = await prisma.user.findUnique({
      where: { id }
    })
    
    if (!user) {
      return NextResponse.json(
        { message: 'Pengguna tidak ditemukan' },
        { status: 404 }
      )
    }
    
    // Cek apakah user memiliki role ini
    const existingUserRole = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId: id,
          roleId: roleId
        }
      }
    })
    
    if (!existingUserRole) {
      return NextResponse.json(
        { message: 'Pengguna tidak memiliki role ini' },
        { status: 404 }
      )
    }
    
    // Hapus role dari user
    await prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId: id,
          roleId: roleId
        }
      }
    })
    
    return NextResponse.json({
      message: 'Role berhasil dihapus dari pengguna'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      )
    }
    
    console.error('Error removing role from user:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat menghapus role' },
      { status: 500 }
    )
  }
}