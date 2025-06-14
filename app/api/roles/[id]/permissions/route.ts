import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Schema untuk validasi input permission
const permissionSchema = z.object({
  permissionId: z.string().min(1, 'Permission ID harus diisi')
})

// GET /api/roles/[id]/permissions - Mengambil semua permission role
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // Cek apakah role exists
    const role = await prisma.role.findUnique({
      where: { id }
    })
    
    if (!role) {
      return NextResponse.json(
        { message: 'Role tidak ditemukan' },
        { status: 404 }
      )
    }
    
    // Ambil semua permission role
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId: id },
      include: {
        permission: {
          select: {
            id: true,
            name: true,
            description: true,
            module: true,
            action: true
          }
        }
      },
      orderBy: {
        permission: {
          module: 'asc'
        }
      }
    })
    
    return NextResponse.json({
      rolePermissions
    })
  } catch (error) {
    console.error('Error fetching role permissions:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat mengambil permission role' },
      { status: 500 }
    )
  }
}

// POST /api/roles/[id]/permissions - Menambah permission ke role
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { permissionId } = permissionSchema.parse(body)
    
    // Cek apakah role exists
    const role = await prisma.role.findUnique({
      where: { id }
    })
    
    if (!role) {
      return NextResponse.json(
        { message: 'Role tidak ditemukan' },
        { status: 404 }
      )
    }
    
    // Cek apakah permission exists
    const permission = await prisma.permission.findUnique({
      where: { id: permissionId }
    })
    
    if (!permission) {
      return NextResponse.json(
        { message: 'Permission tidak ditemukan' },
        { status: 404 }
      )
    }
    
    // Cek apakah role sudah memiliki permission ini
    const existingRolePermission = await prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId: id,
          permissionId: permissionId
        }
      }
    })
    
    if (existingRolePermission) {
      return NextResponse.json(
        { message: 'Role sudah memiliki permission ini' },
        { status: 400 }
      )
    }
    
    // Tambah permission ke role
    const rolePermission = await prisma.rolePermission.create({
      data: {
        roleId: id,
        permissionId: permissionId
      },
      include: {
        permission: {
          select: {
            id: true,
            name: true,
            description: true,
            module: true,
            action: true
          }
        }
      }
    })
    
    return NextResponse.json(
      {
        message: 'Permission berhasil ditambahkan ke role',
        rolePermission
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
    
    console.error('Error adding permission to role:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat menambahkan permission' },
      { status: 500 }
    )
  }
}

// DELETE /api/roles/[id]/permissions - Menghapus permission dari role
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { permissionId } = permissionSchema.parse(body)
    
    // Cek apakah role exists
    const role = await prisma.role.findUnique({
      where: { id }
    })
    
    if (!role) {
      return NextResponse.json(
        { message: 'Role tidak ditemukan' },
        { status: 404 }
      )
    }
    
    // Cek apakah role memiliki permission ini
    const existingRolePermission = await prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId: id,
          permissionId: permissionId
        }
      }
    })
    
    if (!existingRolePermission) {
      return NextResponse.json(
        { message: 'Role tidak memiliki permission ini' },
        { status: 404 }
      )
    }
    
    // Hapus permission dari role
    await prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId: id,
          permissionId: permissionId
        }
      }
    })
    
    return NextResponse.json({
      message: 'Permission berhasil dihapus dari role'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      )
    }
    
    console.error('Error removing permission from role:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat menghapus permission' },
      { status: 500 }
    )
  }
}