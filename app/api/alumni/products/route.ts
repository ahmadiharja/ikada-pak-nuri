import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// GET /api/alumni/products - Ambil produk milik alumni yang login
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'newest';
    
    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      storeId: alumni.store?.id
    };

    if (!alumni.store?.id) {
      return NextResponse.json({
        products: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limit,
          hasNextPage: false,
          hasPrevPage: false
        },
        stats: {
          totalProducts: 0,
          averagePrice: 0
        }
      });
    }

    if (category) {
      whereClause.categoryId = parseInt(category);
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (status) {
      whereClause.status = status;
    }

    // Build order by clause
    let orderBy: any;
    switch (sortBy) {
      case 'name':
        orderBy = { name: 'asc' };
        break;
      case 'price_low':
        orderBy = { price: 'asc' };
        break;
      case 'price_high':
        orderBy = { price: 'desc' };
        break;
      case 'popular':
        orderBy = { clickCount: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Get products with pagination
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: {
          category: true,
          reviews: {
            where: { 
              isApproved: true,
              isPublic: true 
            },
            select: {
              rating: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.product.count({ where: whereClause })
    ]);

    // Calculate statistics
    const stats = await prisma.product.aggregate({
      where: { storeId: alumni.store.id },
      _count: {
        id: true
      },
      _avg: {
        price: true
      }
    });

    // Calculate average rating for each product
    const productsWithRating = products.map(product => {
      const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = product.reviews.length > 0 ? totalRating / product.reviews.length : 0;
      
      return {
        ...product,
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: product.reviews.length,
        reviews: undefined // Remove reviews from response
      };
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      products: productsWithRating,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      stats: {
        totalProducts: stats._count.id,
        averagePrice: stats._avg.price || 0
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data produk' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/alumni/products - Buat produk baru
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

    if (!alumni.store) {
      return NextResponse.json(
        { error: 'Alumni belum memiliki toko. Silakan buat toko terlebih dahulu.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      categoryId,
      images,
      specifications,
      tags,
      isActive = true,
      stock,
      sku,
      weight,
      dimensions
    } = body;

    // Validasi input
    if (!name || !description || !price || !categoryId) {
      return NextResponse.json(
        { error: 'Nama, deskripsi, harga, dan kategori wajib diisi' },
        { status: 400 }
      );
    }

    // Validasi kategori exists
    const category = await prisma.productCategory.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Kategori tidak ditemukan' },
        { status: 400 }
      );
    }

    // Generate slug
    const baseSlug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
    
    let slug = baseSlug;
    let counter = 1;
    
    // Pastikan slug unik
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: price ? parseFloat(price.toString()) : null,
        unit: body.unit || null,
        categoryId,
        storeId: alumni.store.id,
        shopeeUrl: body.shopeeUrl || null,
        tokopediaUrl: body.tokopediaUrl || null,
        tiktokUrl: body.tiktokUrl || null,
        images: images || [],
        thumbnailImage: images?.[0] || null,
        shippedFromCity: body.shippedFromCity || null,
        isActive
      },
      include: {
        category: true,
        store: {
          include: {
            alumni: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Produk berhasil dibuat',
      product
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Gagal membuat produk' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}