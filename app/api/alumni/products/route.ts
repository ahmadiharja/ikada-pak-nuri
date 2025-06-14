import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/alumni/products - Ambil produk milik alumni yang login
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Cari alumni berdasarkan email
    const alumni = await prisma.alumni.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        fullName: true,
        isVerified: true,
        status: true
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
    const status = searchParams.get('status'); // active, inactive, all
    const sortBy = searchParams.get('sortBy') || 'newest';

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = {
      alumniId: alumni.id,
      ...(category && { categoryId: category }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { businessName: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    // Filter by status
    if (status === 'active') {
      whereClause.isActive = true;
    } else if (status === 'inactive') {
      whereClause.isActive = false;
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' };
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'name':
        orderBy = { name: 'asc' };
        break;
      case 'views':
        orderBy = { viewCount: 'desc' };
        break;
      case 'clicks':
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
      where: { alumniId: alumni.id },
      _count: {
        id: true
      },
      _sum: {
        viewCount: true,
        clickCount: true
      }
    });

    const activeCount = await prisma.product.count({
      where: { 
        alumniId: alumni.id,
        isActive: true 
      }
    });

    const inactiveCount = await prisma.product.count({
      where: { 
        alumniId: alumni.id,
        isActive: false 
      }
    });

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
            alumniId: alumni.id
          }
        }
      },
      include: {
        _count: {
          select: {
            products: {
              where: {
                alumniId: alumni.id
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      products: productsWithRating,
      categories: categories.map(cat => ({
        ...cat,
        productCount: cat._count.products
      })),
      stats: {
        total: stats._count.id || 0,
        active: activeCount,
        inactive: inactiveCount,
        totalViews: stats._sum.viewCount || 0,
        totalClicks: stats._sum.clickCount || 0
      },
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
      { error: 'Gagal mengambil data produk' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}