import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// GET - Fetch all alumni
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const order = searchParams.get('order') || 'desc'

    // Ambil semua filter
    const search = searchParams.get('search') || ''
    const abjad = searchParams.get('abjad') || ''
    const syubiyahId = searchParams.get('syubiyahId') || ''
    const mustahiqId = searchParams.get('mustahiqId') || ''
    const provinsiId = searchParams.get('provinsiId') || ''
    const kabupatenId = searchParams.get('kabupatenId') || ''
    const kecamatanId = searchParams.get('kecamatanId') || ''
    const desaId = searchParams.get('desaId') || ''
    const tahunMasuk = searchParams.get('tahunMasuk') || ''
    const tahunKeluar = searchParams.get('tahunKeluar') || ''
    const isVerified = searchParams.get('isVerified')
    const status = searchParams.get('status') || ''
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1

    // Build where clause
    const where: any = {}
    if (search) {
      where.fullName = { contains: search, mode: 'insensitive' }
    }
    if (abjad && abjad !== 'ALL') {
      where.fullName = Object.assign(where.fullName || {}, { 
        startsWith: abjad,
        mode: 'insensitive'
      })
    }
    if (syubiyahId && syubiyahId !== 'ALL') {
      where.syubiyahId = syubiyahId
    }
    if (mustahiqId && mustahiqId !== 'ALL') {
      where.mustahiqId = mustahiqId
    }
    if (provinsiId) {
      where.provinsiId = provinsiId
    }
    if (kabupatenId) {
      where.kabupatenId = kabupatenId
    }
    if (kecamatanId) {
      where.kecamatanId = kecamatanId
    }
    if (desaId) {
      where.desaId = desaId
    }
    if (tahunMasuk && tahunMasuk !== 'ALL') {
      where.tahunMasuk = parseInt(tahunMasuk)
    }
    if (tahunKeluar && tahunKeluar !== 'ALL') {
      where.tahunKeluar = parseInt(tahunKeluar)
    }
    if (isVerified !== null && isVerified !== '') {
      where.isVerified = isVerified === 'true'
    }
    if (status) {
      where.status = status
    }

    const skip = limit ? (page - 1) * limit : undefined

    // Query alumni
    const [alumni, total] = await Promise.all([
      prisma.alumni.findMany({
        where,
        include: {
          syubiyah: { select: { id: true, name: true } },
          mustahiq: { select: { id: true, name: true } }
        },
        orderBy: { [sortBy]: order as 'asc' | 'desc' },
        take: limit,
        skip
      }),
      prisma.alumni.count({ where })
    ])

    // Add full photo URL to each alumni
    const alumniWithPhotoUrls = alumni.map(alumniData => ({
      ...alumniData,
      profilePhoto: alumniData.profilePhoto ? `/foto_alumni/${alumniData.profilePhoto}` : null
    }))

    return NextResponse.json({ alumni: alumniWithPhotoUrls, total })
  } catch (error) {
    console.error('Error fetching alumni:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data alumni' },
      { status: 500 }
    )
  }
}

// POST - Create new alumni
export async function POST(request: NextRequest) {
  try {
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
    const username = formData.get('username') as string
    const profilePhoto = formData.get('profilePhoto') as File | null

    // Validate required fields
    if (!fullName || !email || !password || !provinsi || !kabupaten) {
      return NextResponse.json(
        { error: 'Nama lengkap, email, password, provinsi, dan kabupaten wajib diisi' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingAlumni = await prisma.alumni.findUnique({
      where: { email }
    })

    if (existingAlumni) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // Check if phone already exists
    if (phone && phone.trim() !== '') {
      const existingPhoneAlumni = await prisma.alumni.findFirst({
        where: { phone: phone.trim() }
      })

      if (existingPhoneAlumni) {
        return NextResponse.json(
          { error: 'Nomor HP sudah digunakan oleh alumni lain' },
          { status: 400 }
        )
      }
    }

    // Check if username already exists
    if (username && username.trim() !== '') {
      const existingUsernameAlumni = await prisma.alumni.findFirst({
        where: { username: username.trim() }
      })

      if (existingUsernameAlumni) {
        return NextResponse.json(
          { error: 'Username sudah digunakan oleh alumni lain' },
          { status: 400 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Handle photo upload
    let photoFilename = null
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
      
      photoFilename = `${cleanName}.jpg`
      const photoPath = path.join(uploadDir, photoFilename)

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
    }

    // Parse pekerjaan array
    const pekerjaanArray = pekerjaan ? pekerjaan.split(',').map(p => p.trim()).filter(p => p) : []

    // Generate username from phone if not provided
    const finalUsername = username && username.trim() !== '' ? username : (phone ? phone.replace(/[^0-9]/g, '').slice(-10) : null)

    // Validate enum values
    const validMaritalStatus = ['MENIKAH', 'LAJANG', 'DUDA', 'JANDA', 'BELUM_MENIKAH']
    const validIncomeRange = ['KURANG_1_JUTA', 'SATU_3_JUTA', 'TIGA_5_JUTA', 'LIMA_10_JUTA', 'LEBIH_10_JUTA']
    
    const validatedStatusPernikahan = statusPernikahan && validMaritalStatus.includes(statusPernikahan) ? statusPernikahan as any : undefined;
    const validatedPenghasilanBulan = penghasilanBulan && validIncomeRange.includes(penghasilanBulan) ? penghasilanBulan as any : undefined;

    // Create alumni
    const newAlumni = await prisma.alumni.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        profilePhoto: photoFilename,
        tahunMasuk: tahunMasuk ? parseInt(tahunMasuk) : undefined,
        tahunKeluar: tahunKeluar ? parseInt(tahunKeluar) : undefined,
        asalDaerah: asalDaerah || undefined,
        syubiyahId: syubiyahId || undefined,
        mustahiqId: mustahiqId || undefined,
        tempatLahir: tempatLahir || undefined,
        tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : undefined,
        statusPernikahan: validatedStatusPernikahan,
        jumlahAnak: jumlahAnak ? parseInt(jumlahAnak) : undefined,
        pendidikanTerakhir: pendidikanTerakhir || undefined,
        pekerjaan: pekerjaanArray,
        phone: phone || undefined,
        penghasilanBulan: validatedPenghasilanBulan,
        provinsi,
        provinsiId: provinsiId || undefined,
        kabupaten,
        kabupatenId: kabupatenId || undefined,
        kecamatan: kecamatan || undefined,
        kecamatanId: kecamatanId || undefined,
        desa: desa || undefined,
        desaId: desaId || undefined,
        namaJalan: namaJalan || undefined,
        rt: rt || undefined,
        rw: rw || undefined,
        username: finalUsername || undefined,
        isVerified: false,
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      message: 'Alumni berhasil ditambahkan',
      alumni: {
        ...newAlumni,
        profilePhoto: newAlumni.profilePhoto ? `/foto_alumni/${newAlumni.profilePhoto}` : null
      }
    })
  } catch (error) {
    console.error('Error creating alumni:', error)
    return NextResponse.json(
      { error: 'Gagal menambahkan alumni' },
      { status: 500 }
    )
  }
}