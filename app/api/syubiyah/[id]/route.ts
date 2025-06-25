import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema validasi untuk syubiyah
const syubiyahSchema = z.object({
  name: z.string().min(1, 'Nama syubiyah harus diisi'),
  description: z.string().optional(),
  provinsi: z.string().min(1, 'Provinsi harus dipilih'),
  kabupaten: z.string().min(1, 'Kabupaten/Kota harus dipilih'),
  provinsiId: z.string().min(1, 'ID Provinsi harus ada'),
  kabupatenId: z.string().min(1, 'ID Kabupaten harus ada'),
  penanggungJawab: z.string().optional(),
  noHpPenanggungJawab: z.string().optional()
})

// GET - Ambil syubiyah berdasarkan ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const syubiyah = await prisma.syubiyah.findUnique({
      where: {
        id: params.id
      },
      include: {
        _count: {
          select: {
            alumni: true
          }
        },
        alumni: {
          select: {
            id: true,
            name: true,
            email: true,
            graduationYear: true
          },
          take: 10 // Ambil 10 alumni pertama untuk preview
        }
      }
    })

    if (!syubiyah) {
      return NextResponse.json(
        { message: 'Syubiyah tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(syubiyah)
  } catch (error) {
    console.error('Error fetching syubiyah:', error)
    return NextResponse.json(
      { message: 'Gagal mengambil data syubiyah' },
      { status: 500 }
    )
  }
}

// PUT - Update syubiyah
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Validasi data
    const validatedData = syubiyahSchema.parse(body)

    // Cek apakah syubiyah ada
    const existingSyubiyah = await prisma.syubiyah.findUnique({
      where: {
        id: params.id
      }
    })

    if (!existingSyubiyah) {
      return NextResponse.json(
        { message: 'Syubiyah tidak ditemukan' },
        { status: 404 }
      )
    }

    // Cek apakah nama syubiyah sudah ada (kecuali untuk syubiyah yang sedang diedit)
    const duplicateSyubiyah = await prisma.syubiyah.findFirst({
      where: {
        name: {
          equals: validatedData.name,
          mode: 'insensitive'
        },
        id: {
          not: params.id
        }
      }
    })

    if (duplicateSyubiyah) {
      return NextResponse.json(
        { message: 'Nama syubiyah sudah ada' },
        { status: 400 }
      )
    }

    // Update syubiyah
    const updatedSyubiyah = await prisma.syubiyah.update({
      where: {
        id: params.id
      },
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        provinsi: validatedData.provinsi,
        kabupaten: validatedData.kabupaten,
        provinsiId: validatedData.provinsiId,
        kabupatenId: validatedData.kabupatenId,
        penanggungJawab: validatedData.penanggungJawab || null,
        noHpPenanggungJawab: validatedData.noHpPenanggungJawab || null
      },
      include: {
        _count: {
          select: {
            alumni: true
          }
        }
      }
    })

    return NextResponse.json(updatedSyubiyah)
  } catch (error) {
    console.error('Error updating syubiyah:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Data tidak valid', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Gagal memperbarui syubiyah' },
      { status: 500 }
    )
  }
}

// DELETE - Hapus syubiyah
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Cek apakah syubiyah ada
    const existingSyubiyah = await prisma.syubiyah.findUnique({
      where: {
        id: params.id
      },
      include: {
        _count: {
          select: {
            alumni: true
          }
        }
      }
    })

    if (!existingSyubiyah) {
      return NextResponse.json(
        { message: 'Syubiyah tidak ditemukan' },
        { status: 404 }
      )
    }

    // Cek apakah masih ada alumni yang terkait
    if (existingSyubiyah._count.alumni > 0) {
      return NextResponse.json(
        { 
          message: `Tidak dapat menghapus syubiyah karena masih ada ${existingSyubiyah._count.alumni} alumni yang terkait. Silakan pindahkan atau hapus alumni terlebih dahulu.` 
        },
        { status: 400 }
      )
    }

    // Hapus syubiyah
    await prisma.syubiyah.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json(
      { message: 'Syubiyah berhasil dihapus' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting syubiyah:', error)
    return NextResponse.json(
      { message: 'Gagal menghapus syubiyah' },
      { status: 500 }
    )
  }
}