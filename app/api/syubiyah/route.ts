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
  kabupatenId: z.string().min(1, 'ID Kabupaten harus ada')
})

// GET - Ambil semua syubiyah
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeAlumniCount = searchParams.get('includeAlumniCount') === 'true'
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const sortBy = searchParams.get('sortBy') || 'name'
    const order = searchParams.get('order') || 'asc'

    let orderBy: any = {}
    
    if (sortBy === 'alumniCount') {
      // Sort by alumni count
      orderBy = {
        alumni: {
          _count: order as 'asc' | 'desc'
        }
      }
    } else {
      orderBy = {
        [sortBy]: order as 'asc' | 'desc'
      }
    }

    const syubiyahs = await prisma.syubiyah.findMany({
      include: includeAlumniCount ? {
        _count: {
          select: {
            alumni: true
          }
        }
      } : undefined,
      orderBy,
      take: limit
    })

    // If sorting by alumni count, we need to sort manually since Prisma doesn't support this directly
    let sortedSyubiyahs = syubiyahs
    if (sortBy === 'alumniCount' && includeAlumniCount) {
      sortedSyubiyahs = syubiyahs.sort((a, b) => {
        const aCount = (a as any)._count?.alumni || 0
        const bCount = (b as any)._count?.alumni || 0
        return order === 'desc' ? bCount - aCount : aCount - bCount
      })
    }

    return NextResponse.json({ syubiyah: sortedSyubiyahs })
  } catch (error) {
    console.error('Error fetching syubiyahs:', error)
    return NextResponse.json(
      { message: 'Gagal mengambil data syubiyah' },
      { status: 500 }
    )
  }
}

// POST - Tambah syubiyah baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validasi data
    const validatedData = syubiyahSchema.parse(body)

    // Cek apakah nama syubiyah sudah ada
    const existingSyubiyah = await prisma.syubiyah.findFirst({
      where: {
        name: {
          equals: validatedData.name,
          mode: 'insensitive'
        }
      }
    })

    if (existingSyubiyah) {
      return NextResponse.json(
        { message: 'Nama syubiyah sudah ada' },
        { status: 400 }
      )
    }

    // Buat syubiyah baru
    const syubiyah = await prisma.syubiyah.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
        provinsi: validatedData.provinsi,
        kabupaten: validatedData.kabupaten,
        provinsiId: validatedData.provinsiId,
        kabupatenId: validatedData.kabupatenId
      },
      include: {
        _count: {
          select: {
            alumni: true
          }
        }
      }
    })

    return NextResponse.json(syubiyah, { status: 201 })
  } catch (error) {
    console.error('Error creating syubiyah:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Data tidak valid', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Gagal membuat syubiyah' },
      { status: 500 }
    )
  }
}