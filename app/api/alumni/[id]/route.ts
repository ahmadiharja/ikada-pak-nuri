import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// GET - Fetch single alumni by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const alumni = await prisma.alumni.findUnique({
      where: {
        id: params.id
      },
      include: {
        syubiyah: {
          select: {
            id: true,
            name: true
          }
        },
        mustahiq: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!alumni) {
      return NextResponse.json(
        { error: 'Alumni tidak ditemukan' },
        { status: 404 }
      )
    }

    // Return alumni data with existing photo URL
    const alumniWithPhotoUrl = {
      ...alumni,
      profilePhoto: alumni.profilePhoto || null
    }

    return NextResponse.json(alumniWithPhotoUrl)
  } catch (error) {
    console.error('Error fetching alumni:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data alumni' },
      { status: 500 }
    )
  }
}

// PUT - Update alumni
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if alumni exists
    const existingAlumni = await prisma.alumni.findUnique({
      where: { id: params.id }
    })

    if (!existingAlumni) {
      return NextResponse.json(
        { error: 'Alumni tidak ditemukan' },
        { status: 404 }
      )
    }

    const formData = await request.formData()
    
    // Extract form fields
    const fullName = formData.get('fullName') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const tahunMasuk = formData.get('tahunMasuk') as string
    const tahunKeluar = formData.get('tahunKeluar') as string
    const asalDaerah = formData.get('asalDaerah') as string
    const syubiyahId = formData.get('syubiyahId') as string
    const mustahiqId = formData.get('mustahiqId') as string
    const tempatLahir = formData.get('tempatLahir') as string
    const tanggalLahir = formData.get('tanggalLahir') as string
    const statusPernikahan = formData.get('statusPernikahan') as string
    const jumlahAnak = formData.get('jumlahAnak') as string
    const pendidikanTerakhir = formData.get('pendidikanTerakhir') as string
    const pekerjaan = formData.get('pekerjaan') as string
    const phone = formData.get('phone') as string
    const penghasilanBulan = formData.get('penghasilanBulan') as string
    const provinsi = formData.get('provinsi') as string
    const provinsiId = formData.get('provinsiId') as string
    const kabupaten = formData.get('kabupaten') as string
    const kabupatenId = formData.get('kabupatenId') as string
    const kecamatan = formData.get('kecamatan') as string
    const kecamatanId = formData.get('kecamatanId') as string
    const desa = formData.get('desa') as string
    const desaId = formData.get('desaId') as string
    const namaJalan = formData.get('namaJalan') as string
    const rt = formData.get('rt') as string
    const rw = formData.get('rw') as string
    const profilePhoto = formData.get('profilePhoto') as File | null

    // Validate required fields
    if (!fullName || !email || !provinsi || !kabupaten) {
      return NextResponse.json(
        { error: 'Nama lengkap, email, provinsi, dan kabupaten wajib diisi' },
        { status: 400 }
      )
    }

    // Check if email already exists (excluding current alumni)
    if (email !== existingAlumni.email) {
      const emailExists = await prisma.alumni.findUnique({
        where: { email }
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'Email sudah terdaftar' },
          { status: 400 }
        )
      }
    }

    // Handle photo upload
    let photoFilename = existingAlumni.profilePhoto
    if (profilePhoto && profilePhoto.size > 0) {
      // Create upload directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'public', 'foto_alumni')
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }

      // Generate filename based on alumni name
      const cleanName = fullName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .trim()
      
      const newPhotoFilename = `${cleanName}.jpg`
      const photoPath = path.join(uploadDir, newPhotoFilename)

      // If name changed, delete old photo file
      if (existingAlumni.profilePhoto && existingAlumni.fullName !== fullName) {
        const oldCleanName = existingAlumni.fullName
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '_')
          .trim()
        const oldPhotoPath = path.join(uploadDir, `${oldCleanName}.jpg`)
        
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath)
        }
      }

      // Convert file to buffer
      const buffer = Buffer.from(await profilePhoto.arrayBuffer())

      // Compress and save image
      await sharp(buffer)
        .resize(800, 800, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ 
          quality: 80,
          progressive: true 
        })
        .toFile(photoPath)

      photoFilename = newPhotoFilename
    } else if (existingAlumni.fullName !== fullName && existingAlumni.profilePhoto) {
      // If name changed but no new photo uploaded, rename existing photo file
      const uploadDir = path.join(process.cwd(), 'public', 'foto_alumni')
      const oldCleanName = existingAlumni.fullName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .trim()
      const newCleanName = fullName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .trim()
      
      const oldPhotoPath = path.join(uploadDir, `${oldCleanName}.jpg`)
      const newPhotoPath = path.join(uploadDir, `${newCleanName}.jpg`)
      
      if (fs.existsSync(oldPhotoPath)) {
        fs.renameSync(oldPhotoPath, newPhotoPath)
        photoFilename = `${newCleanName}.jpg`
      }
    }

    // Parse pekerjaan array
    const pekerjaanArray = pekerjaan ? pekerjaan.split(',').map(p => p.trim()).filter(p => p) : []

    // Validate enum values
    const validMaritalStatus = ['MENIKAH', 'LAJANG', 'DUDA', 'JANDA', 'BELUM_MENIKAH']
    const validIncomeRange = ['RANGE_1_5', 'RANGE_5_10', 'RANGE_10_30', 'ABOVE_30']
    
    const validatedStatusPernikahan = statusPernikahan && validMaritalStatus.includes(statusPernikahan) ? statusPernikahan : null
    const validatedPenghasilanBulan = penghasilanBulan && validIncomeRange.includes(penghasilanBulan) ? penghasilanBulan : null

    // Prepare update data
    const updateData: any = {
      fullName,
      email,
      profilePhoto: photoFilename,
      tahunMasuk: tahunMasuk ? parseInt(tahunMasuk) : null,
      tahunKeluar: tahunKeluar ? parseInt(tahunKeluar) : null,
      asalDaerah: asalDaerah || null,
      syubiyahId: syubiyahId || null,
      mustahiqId: mustahiqId || null,
      tempatLahir: tempatLahir || null,
      tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
      statusPernikahan: validatedStatusPernikahan,
      jumlahAnak: jumlahAnak ? parseInt(jumlahAnak) : null,
      pendidikanTerakhir: pendidikanTerakhir || null,
      pekerjaan: pekerjaanArray,
      phone: phone || null,
      penghasilanBulan: validatedPenghasilanBulan,
      provinsi,
      provinsiId: provinsiId || null,
      kabupaten,
      kabupatenId: kabupatenId || null,
      kecamatan: kecamatan || null,
      kecamatanId: kecamatanId || null,
      desa: desa || null,
      desaId: desaId || null,
      namaJalan: namaJalan || null,
      rt: rt || null,
      rw: rw || null
    }

    // Hash password if provided
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 12)
    }

    // Update alumni
    const updatedAlumni = await prisma.alumni.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json({
      message: 'Alumni berhasil diperbarui',
      alumni: {
        ...updatedAlumni,
        profilePhoto: updatedAlumni.profilePhoto || null
      }
    })
  } catch (error) {
    console.error('Error updating alumni:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui alumni' },
      { status: 500 }
    )
  }
}

// DELETE - Delete alumni
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if alumni exists
    const existingAlumni = await prisma.alumni.findUnique({
      where: { id: params.id }
    })

    if (!existingAlumni) {
      return NextResponse.json(
        { error: 'Alumni tidak ditemukan' },
        { status: 404 }
      )
    }

    // Delete photo file if exists
    if (existingAlumni.profilePhoto) {
      const photoPath = path.join(
        process.cwd(), 
        'public', 
        'foto_alumni', 
        existingAlumni.profilePhoto
      )
      
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath)
      }
    }

    // Delete alumni from database
    await prisma.alumni.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: 'Alumni berhasil dihapus'
    })
  } catch (error) {
    console.error('Error deleting alumni:', error)
    return NextResponse.json(
      { error: 'Gagal menghapus alumni' },
      { status: 500 }
    )
  }
}