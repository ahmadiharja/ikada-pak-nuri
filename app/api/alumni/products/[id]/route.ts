import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// GET /api/alumni/products/[id] - Ambil detail produk milik alumni
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Cari alumni berdasarkan ID
    const alumni = await prisma.alumni.findUnique({
      where: { id: alumniId },
      include: {
        store: true
      }
    });

    if (!alumni) {
      return NextResponse.json(
        { error: 'Data alumni tidak ditemukan' },
        { status: 404 }
      );
    }

    if (!alumni.isVerified || alumni.status !== 'VERIFIED') {
      return NextResponse.json(
        { error: 'Alumni belum terverifikasi. Silakan hubungi admin.' },
        { status: 403 }
      );
    }

    if (!alumni.store?.id) {
      return NextResponse.json(
        { error: 'Alumni belum memiliki toko' },
        { status: 404 }
      );
    }

    const productId = (await params).id;

    // Ambil detail produk
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        storeId: alumni.store.id // Pastikan produk milik alumni yang login
      },
      include: {
        category: true,
        store: {
          include: {
            alumni: {
              select: {
                fullName: true,
                tahunKeluar: true
              }
            }
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan atau Anda tidak memiliki akses' },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.product.update({
      where: { id: productId },
      data: {
        viewCount: {
          increment: 1
        }
      }
    });

    return NextResponse.json({
      product: product
    });

  } catch (error) {
    console.error('Error fetching product detail:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil detail produk' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/alumni/products/[id] - Update produk
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Cari alumni berdasarkan ID
    const alumni = await prisma.alumni.findUnique({
      where: { id: alumniId },
      include: {
        store: true
      }
    });

    if (!alumni || !alumni.store?.id) {
      return NextResponse.json(
        { error: 'Alumni atau toko tidak ditemukan' },
        { status: 404 }
      );
    }

    const productId = (await params).id;
    const body = await request.json();

    // Pastikan produk milik alumni yang login
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        storeId: alumni.store.id
      }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan atau Anda tidak memiliki akses' },
        { status: 404 }
      );
    }

    // Update produk
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: body.name,
        description: body.description,
        shortDescription: body.shortDescription,
        categoryId: body.categoryId,
        price: body.price,
        priceMin: body.priceMin,
        priceMax: body.priceMax,
        priceText: body.priceText,
        businessName: body.businessName,
        businessType: body.businessType,
        location: body.location,
        images: body.images,
        thumbnailImage: body.thumbnailImage,
        shopeeUrl: body.shopeeUrl,
        tokopediaUrl: body.tokopediaUrl,
        tiktokUrl: body.tiktokUrl,
        bukalapakUrl: body.bukalapakUrl,
        lazadaUrl: body.lazadaUrl,
        blibliUrl: body.blibliUrl,
        whatsappNumber: body.whatsappNumber,
        instagramUrl: body.instagramUrl,
        facebookUrl: body.facebookUrl,
        websiteUrl: body.websiteUrl,
        shippingInfo: body.shippingInfo,
        tags: body.tags,
        isActive: body.isActive,
        updatedAt: new Date()
      },
      include: {
        category: true
      }
    });

    return NextResponse.json({
      message: 'Produk berhasil diperbarui',
      product: updatedProduct
    });

  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui produk' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/alumni/products/[id] - Hapus produk
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Cari alumni berdasarkan ID
    const alumni = await prisma.alumni.findUnique({
      where: { id: alumniId },
      include: {
        store: true
      }
    });

    if (!alumni || !alumni.store?.id) {
      return NextResponse.json(
        { error: 'Alumni atau toko tidak ditemukan' },
        { status: 404 }
      );
    }

    const productId = params.id;

    // Pastikan produk milik alumni yang login
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        storeId: alumni.store.id
      }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan atau Anda tidak memiliki akses' },
        { status: 404 }
      );
    }

    // Hapus produk
    await prisma.product.delete({
      where: { id: productId }
    });

    return NextResponse.json({
      message: 'Produk berhasil dihapus'
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus produk' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}