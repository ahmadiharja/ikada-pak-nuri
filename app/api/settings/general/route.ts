import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Ambil konfigurasi umum (singleton)
export async function GET() {
  try {
    let config = await prisma.generalConfig.findFirst();
    if (!config) {
      return NextResponse.json({
        id: '',
        websiteTitle: '',
        favicon: '',
        heroImages: [],
        heroAutoplay: true,
        heroInterval: 4000,
        footerCopyright: '',
        footerLinks: [],
        footerSocial: { instagram: '', facebook: '', youtube: '' },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    return NextResponse.json(config);
  } catch (e) {
    console.error('GeneralConfig API GET error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST/PUT: Simpan konfigurasi umum (upsert)
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    let config = await prisma.generalConfig.findFirst();
    if (config) {
      // Update
      config = await prisma.generalConfig.update({
        where: { id: config.id },
        data,
      });
    } else {
      // Create
      config = await prisma.generalConfig.create({ data });
    }
    return NextResponse.json(config);
  } catch (e) {
    console.error('GeneralConfig API POST error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  return POST(req);
} 