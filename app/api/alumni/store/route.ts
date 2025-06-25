import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// POST - Create new alumni store
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const alumniId = decoded.id;
    if (!alumniId) {
      return NextResponse.json({ error: 'Alumni ID not found in token' }, { status: 401 });
    }

    const existingStore = await prisma.alumniStore.findUnique({
      where: { alumniId },
    });

    if (existingStore) {
      return NextResponse.json(
        { error: 'Alumni already has a store' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, address, whatsappNumber, websiteUrl, instagramUrl, facebookUrl, isActive } = body;

    if (!name || !description || !address || !whatsappNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, address, whatsappNumber' },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    const newStore = await prisma.alumniStore.create({
      data: {
        name,
        slug,
        description,
        address,
        whatsappNumber,
        websiteUrl,
        instagramUrl,
        facebookUrl,
        isActive: isActive !== undefined ? isActive : true,
        alumni: {
          connect: { id: alumniId },
        },
      },
    });

    return NextResponse.json({ store: newStore }, { status: 201 });
  } catch (error) {
    console.error('Error creating store:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// GET - Get alumni store
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let decoded: any
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    } catch (error) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      )
    }

    const alumniId = decoded.id

    // Get alumni store
    const store = await prisma.alumniStore.findUnique({
      where: { alumniId: alumniId }
    })

    if (!store) {
      return NextResponse.json(
        { error: 'Etalase toko tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      store: {
        id: store.id,
        name: store.name,
        description: store.description,
        address: store.address,
        phone: store.phone,
        isActive: store.isActive
      }
    })

  } catch (error) {
    console.error('Error fetching store:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// PUT - Update alumni store
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    let decoded: any
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    } catch (error) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      )
    }

    const alumniId = decoded.id

    // Check if store exists
    const existingStore = await prisma.alumniStore.findUnique({
      where: { alumniId: alumniId }
    })

    if (!existingStore) {
      return NextResponse.json(
        { error: 'Etalase toko tidak ditemukan' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { name, description, address, phone, isActive } = body

    // Validate required fields
    if (!name || !description || !address || !phone) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      )
    }

    // Validate phone format
    if (!/^[0-9+\-\s()]+$/.test(phone)) {
      return NextResponse.json(
        { error: 'Format nomor telepon tidak valid' },
        { status: 400 }
      )
    }

    // Update the store
    const store = await prisma.alumniStore.update({
      where: { alumniId: alumniId },
      data: {
        name: name.trim(),
        description: description.trim(),
        address: address.trim(),
        phone: phone.trim(),
        isActive: isActive !== undefined ? isActive : existingStore.isActive
      }
    })

    return NextResponse.json({
      message: 'Etalase toko berhasil diperbarui',
      store: {
        id: store.id,
        name: store.name,
        description: store.description,
        address: store.address,
        phone: store.phone,
        isActive: store.isActive
      }
    })

  } catch (error) {
    console.error('Error updating store:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}