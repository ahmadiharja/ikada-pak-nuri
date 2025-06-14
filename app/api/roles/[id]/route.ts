import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Schema untuk validasi update role
const updateRoleSchema = z.object({
  name: z.string().min(1, 'Nama role harus diisi').optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional()
})

// GET /api/roles/[id] - Mengambil role berdasarkan ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            rolePermissions: true,
            userRoles: true
          }
        }
      }
    })
    
    if (!role) {
      return NextResponse.json(
        { message: 'Role tidak ditemukan' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      role
    })
  } catch (error) {
    console.error('Error fetching role:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat mengambil data role' },
      { status: 500 }
    )
  }
}

// PUT /api/roles/[id] - Update role
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const validatedData = updateRoleSchema.parse(body)
    
    // Cek apakah role exists
    const existingRole = await prisma.role.findUnique({
      where: { id }
    })
    
    if (!existingRole) {
      return NextResponse.json(
        { message: 'Role tidak ditemukan' },
        { status: 404 }
      )
    }
    
    // Validasi nama role jika diubah
    if (validatedData.name && validatedData.name !== existingRole.name) {
      const nameExists = await prisma.role.findUnique({
        where: { name: validatedData.name }
      })
      
      if (nameExists) {
        return NextResponse.json(
          { message: 'Nama role sudah digunakan' },
          { status: 400 }
        )
      }
    }
    
    // Update role
    const role = await prisma.role.update({
      where: { id },
      data: validatedData,
      include: {
        _count: {
          select: {
            rolePermissions: true,
            userRoles: true
          }
        }
      }
    })
    
    return NextResponse.json({
      message: 'Role berhasil diperbarui',
      role
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      )
    }
    
    console.error('Error updating role:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat memperbarui role' },
      { status: 500 }
    )
  }
}

// DELETE /api/roles/[id] - Hapus role
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // Cek apakah role exists
    const existingRole = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            rolePermissions: true,
            userRoles: true
          }
        }
      }
    })
    
    if (!existingRole) {
      return NextResponse.json(
        { message: 'Role tidak ditemukan' },
        { status: 404 }
      )
    }
    
    // Cek apakah role masih digunakan
    if (existingRole._count.userRoles > 0) {
      return NextResponse.json(
        { message: 'Tidak dapat menghapus role yang masih digunakan oleh pengguna' },
        { status: 400 }
      )
    }
    
    // Hapus semua permission yang terkait dengan role ini
    await prisma.rolePermission.deleteMany({
      where: { roleId: id }
    })
    
    // Hapus role
    await prisma.role.delete({
      where: { id }
    })
    
    return NextResponse.json({
      message: 'Role berhasil dihapus'
    })
  } catch (error) {
    console.error('Error deleting role:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat menghapus role' },
      { status: 500 }
    )
  }
}