import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'
import { existsSync } from 'fs'

const prisma = new PrismaClient()

// GET - Fetch single mustahiq
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const mustahiq = await prisma.mustahiq.findUnique({
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

    if (!mustahiq) {
      return NextResponse.json(
        { error: 'Mustahiq tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json(mustahiq)
  } catch (error) {
    console.error('Error fetching mustahiq:', error)
    return NextResponse.json(
      { error: 'Gagal memuat data mustahiq' },
      { status: 500 }
    )
  }
}

// PUT - Update mustahiq
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if mustahiq exists
    const existingMustahiq = await prisma.mustahiq.findUnique({
      where: { id: params.id }
    })

    if (!existingMustahiq) {
      return NextResponse.json(
        { error: 'Mustahiq tidak ditemukan' },
        { status: 404 }
      )
    }

    const formData = await request.formData()
    
    // Extract form fields
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const provinsi = formData.get('provinsi') as string
    const kabupaten = formData.get('kabupaten') as string
    const kecamatan = formData.get('kecamatan') as string
    const desa = formData.get('desa') as string
    const provinsiId = formData.get('provinsiId') as string
    const kabupatenId = formData.get('kabupatenId') as string
    const kecamatanId = formData.get('kecamatanId') as string
    const desaId = formData.get('desaId') as string
    const namaJalan = formData.get('namaJalan') as string
    const rt = formData.get('rt') as string
    const rw = formData.get('rw') as string
    const bidangKeahlian = formData.get('bidangKeahlian') as string
    const profilePhoto = formData.get('profilePhoto') as File

    // Validate required fields
    if (!name || !provinsi || !kabupaten) {
      return NextResponse.json(
        { error: 'Nama, provinsi, dan kabupaten wajib diisi' },
        { status: 400 }
      )
    }

    let profilePhotoUrl = existingMustahiq.profilePhoto

    // Handle photo upload if provided
    if (profilePhoto && profilePhoto.size > 0) {
      try {
        // Create upload directory if it doesn't exist
        const uploadDir = join(process.cwd(), 'public', 'foto_mustahiq')
        await mkdir(uploadDir, { recursive: true })

        // Generate filename based on mustahiq name
        const fileExtension = profilePhoto.name.split('.').pop() || 'jpg'
        // Clean the name for filename (remove special characters and spaces)
        const cleanName = name.toLowerCase()
          .replace(/[^a-z0-9]/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '')
        const fileName = `${cleanName}.${fileExtension}`
        const filePath = join(uploadDir, fileName)

        // If name changed, delete old photo with different name
        if (existingMustahiq.profilePhoto) {
          const oldCleanName = existingMustahiq.name.toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '')
          const oldFileName = `${oldCleanName}.${existingMustahiq.profilePhoto.split('.').pop()}`
          
          // Only delete if the filename will be different (name changed)
          if (fileName !== oldFileName) {
            const oldPhotoPath = join(process.cwd(), 'public', existingMustahiq.profilePhoto)
            if (existsSync(oldPhotoPath)) {
              await unlink(oldPhotoPath)
            }
          }
        }

        // Convert file to buffer
        const bytes = await profilePhoto.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Compress image using Sharp
        const compressedBuffer = await sharp(buffer)
          .resize(800, 800, { 
            fit: 'inside',
            withoutEnlargement: true 
          })
          .jpeg({ 
            quality: 80,
            progressive: true 
          })
          .toBuffer()

        // Check if compressed size is still too large
        if (compressedBuffer.length > 300 * 1024) {
          // Further compress if still over 300KB
          const furtherCompressed = await sharp(buffer)
            .resize(600, 600, { 
              fit: 'inside',
              withoutEnlargement: true 
            })
            .jpeg({ 
              quality: 60,
              progressive: true 
            })
            .toBuffer()
          
          await writeFile(filePath, furtherCompressed)
        } else {
          await writeFile(filePath, compressedBuffer)
        }

        profilePhotoUrl = `/foto_mustahiq/${fileName}`
      } catch (photoError) {
        console.error('Error processing photo:', photoError)
        return NextResponse.json(
          { error: 'Gagal memproses foto' },
          { status: 500 }
        )
      }
    }

    // Update mustahiq in database
    const mustahiq = await prisma.mustahiq.update({
      where: {
        id: params.id
      },
      data: {
        name,
        email: email || null,
        phone: phone || null,
        provinsi,
        kabupaten,
        kecamatan: kecamatan || null,
        desa: desa || null,
        provinsiId: provinsiId || null,
        kabupatenId: kabupatenId || null,
        kecamatanId: kecamatanId || null,
        desaId: desaId || null,
        namaJalan: namaJalan || null,
        rt: rt || null,
        rw: rw || null,
        bidangKeahlian: bidangKeahlian || null,
        profilePhoto: profilePhotoUrl
      },
      include: {
        _count: {
          select: {
            alumni: true
          }
        }
      }
    })

    return NextResponse.json(mustahiq)
  } catch (error) {
    console.error('Error updating mustahiq:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui mustahiq' },
      { status: 500 }
    )
  }
}

// DELETE - Delete mustahiq
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if mustahiq exists
    const existingMustahiq = await prisma.mustahiq.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            alumni: true
          }
        }
      }
    })

    if (!existingMustahiq) {
      return NextResponse.json(
        { error: 'Mustahiq tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if mustahiq has associated alumni
    if (existingMustahiq._count.alumni > 0) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus mustahiq yang memiliki alumni terkait' },
        { status: 400 }
      )
    }

    // Delete photo file if exists
    if (existingMustahiq.profilePhoto) {
      const photoPath = join(process.cwd(), 'public', existingMustahiq.profilePhoto)
      if (existsSync(photoPath)) {
        try {
          await unlink(photoPath)
        } catch (photoError) {
          console.error('Error deleting photo file:', photoError)
          // Continue with deletion even if photo deletion fails
        }
      }
    }

    // Delete mustahiq from database
    await prisma.mustahiq.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ message: 'Mustahiq berhasil dihapus' })
  } catch (error) {
    console.error('Error deleting mustahiq:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus mustahiq' },
      { status: 500 }
    )
  }
}