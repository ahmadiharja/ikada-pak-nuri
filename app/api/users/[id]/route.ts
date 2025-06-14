import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// Schema untuk validasi update user
const updateUserSchema = z.object({
  name: z.string().min(1, 'Nama harus diisi').optional(),
  email: z.string().email('Format email tidak valid').optional(),
  password: z.string().min(6, 'Password minimal 6 karakter').optional(),
  role: z.enum(['PUSAT', 'SYUBIYAH'], {
    errorMap: () => ({ message: 'Role harus PUSAT atau SYUBIYAH' })
  }).optional(),
  syubiyah_id: z.string().optional()
})

// GET /api/users/[id] - Mengambil user berdasarkan ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const user = await prisma.user.findUnique({
      where: { id },
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
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { message: 'Pengguna tidak ditemukan' },
        { status: 404 }
      )
    }
    
    // Remove password dari response
    const { password, ...userWithoutPassword } = user
    
    return NextResponse.json({
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat mengambil data pengguna' },
      { status: 500 }
    )
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)
    
    // Cek apakah user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })
    
    if (!existingUser) {
      return NextResponse.json(
        { message: 'Pengguna tidak ditemukan' },
        { status: 404 }
      )
    }
    
    // Validasi email jika diubah
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validatedData.email }
      })
      
      if (emailExists) {
        return NextResponse.json(
          { message: 'Email sudah digunakan' },
          { status: 400 }
        )
      }
    }
    
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
    
    // Prepare update data
    const updateData: any = {}
    
    if (validatedData.name) updateData.name = validatedData.name
    if (validatedData.email) updateData.email = validatedData.email
    if (validatedData.role) {
      updateData.role = validatedData.role
      // Reset syubiyah_id jika role berubah ke PUSAT
      if (validatedData.role === 'PUSAT') {
        updateData.syubiyah_id = null
      } else if (validatedData.syubiyah_id) {
        updateData.syubiyah_id = validatedData.syubiyah_id
      }
    }
    
    // Hash password jika diubah
    if (validatedData.password) {
      updateData.password = await bcrypt.hash(validatedData.password, 12)
    }
    
    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
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
    
    return NextResponse.json({
      message: 'Pengguna berhasil diperbarui',
      user: userWithoutPassword
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      )
    }
    
    console.error('Error updating user:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat memperbarui pengguna' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - Hapus user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // Cek apakah user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            userRoles: true
          }
        }
      }
    })
    
    if (!existingUser) {
      return NextResponse.json(
        { message: 'Pengguna tidak ditemukan' },
        { status: 404 }
      )
    }
    
    // Cek apakah user memiliki role yang masih aktif
    if (existingUser._count.userRoles > 0) {
      return NextResponse.json(
        { message: 'Tidak dapat menghapus pengguna yang masih memiliki role aktif' },
        { status: 400 }
      )
    }
    
    // Hapus user
    await prisma.user.delete({
      where: { id }
    })
    
    return NextResponse.json({
      message: 'Pengguna berhasil dihapus'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat menghapus pengguna' },
      { status: 500 }
    )
  }
}