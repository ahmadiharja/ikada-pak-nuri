import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

// GET - Fetch all mustahiqs
export async function GET() {
  try {
    const mustahiqs = await prisma.mustahiq.findMany({
      include: {
        _count: {
          select: {
            alumni: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(mustahiqs)
  } catch (error) {
    console.error('Error fetching mustahiqs:', error)
    return NextResponse.json(
      { error: 'Gagal memuat data mustahiq' },
      { status: 500 }
    )
  }
}

// POST - Create new mustahiq
export async function POST(request: NextRequest) {
  try {
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

    let profilePhotoUrl = null

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

    // Create mustahiq in database
    const mustahiq = await prisma.mustahiq.create({
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

    return NextResponse.json(mustahiq, { status: 201 })
  } catch (error) {
    console.error('Error creating mustahiq:', error)
    return NextResponse.json(
      { error: 'Gagal membuat mustahiq baru' },
      { status: 500 }
    )
  }
}