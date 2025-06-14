import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/products/alumni/[id] - Ambil semua produk dari alumni tertentu
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'newest'; // newest, oldest, name, price
    const activeOnly = searchParams.get('activeOnly') !== 'false'; // default true

    const skip = (page - 1) * limit;

    // Cek apakah alumni ada dan terverifikasi
    const alumni = await prisma.alumni.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        profilePhoto: true,
        phone: true,
        email: true,
        isVerified: true,
        status: true,
        syubiyah: {
          select: {
            name: true
          }
        }
      }
    });

    if (!alumni) {
      return NextResponse.json(
        { error: 'Alumni tidak ditemukan' },
        { status: 404 }
      );
    }

    if (!alumni.isVerified || alumni.status !== 'VERIFIED') {
      return NextResponse.json(
        { error: 'Alumni belum terverifikasi' },
        { status: 404 }
      );
    }

    // Build where clause
    const whereClause: any = {
      alumniId: id,
      ...(activeOnly && { isActive: true, isApproved: true }),
      ...(category && { categoryId: category }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { businessName: { contains: search, mode: 'insensitive' } },
          { tags: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' };
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'name':
        orderBy = { name: 'asc' };
        break;
      case 'price':
        orderBy = { price: 'asc' };
        break;
      case 'popular':
        orderBy = { viewCount: 'desc' };
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

    // Calculate average rating for each product
    const productsWithRating = products.map(product => {
      const ratings = product.reviews.map(r => r.rating);
      const avgRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
        : 0;
      
      return {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: ratings.length
      };
    });

    // Get categories for filtering
    const categories = await prisma.productCategory.findMany({
      where: {
        isActive: true,
        products: {
          some: {
            alumniId: id,
            ...(activeOnly && { isActive: true, isApproved: true })
          }
        }
      },
      include: {
        _count: {
          select: {
            products: {
              where: {
                alumniId: id,
                ...(activeOnly && { isActive: true, isApproved: true })
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      alumni,
      products: productsWithRating,
      categories: categories.map(cat => ({
        ...cat,
        productCount: cat._count.products
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching alumni products:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data produk alumni' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}