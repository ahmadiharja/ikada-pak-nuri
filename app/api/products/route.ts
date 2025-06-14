import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/products - Ambil semua produk dengan filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const slug = searchParams.get('slug');
    const alumniId = searchParams.get('alumniId');
    const featured = searchParams.get('featured');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const incrementView = searchParams.get('view') === 'true';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive: true,
      isApproved: true,
    };

    if (slug) {
      where.slug = slug;
    }

    if (category) {
      where.category = {
        slug: category
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
        { businessName: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (alumniId) {
      where.alumniId = alumniId;
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    // Build orderBy
    const orderBy: any = {};
    if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else if (sortBy === 'price') {
      orderBy.price = sortOrder;
    } else if (sortBy === 'views') {
      orderBy.viewCount = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          alumni: {
            select: {
              id: true,
              fullName: true,
              profilePhoto: true,
              phone: true,
              syubiyah: {
                select: {
                  name: true
                }
              }
            }
          },
          reviews: {
            where: { 
              isApproved: true,
              isPublic: true 
            },
            orderBy: { createdAt: 'desc' },
            take: slug ? 10 : 0 // Include reviews only for single product
          }
        },
        orderBy,
        skip: slug ? 0 : skip, // No pagination for single product
        take: slug ? 1 : limit, // Take only 1 for single product
      }),
      slug ? 1 : prisma.product.count({ where }) // No count needed for single product
    ]);

    // Increment view count if requested and single product
    if (incrementView && slug && products.length > 0) {
      await prisma.product.update({
        where: { id: products[0].id },
        data: {
          viewCount: {
            increment: 1
          }
        }
      });
    }

    // Calculate average rating for each product
    const productsWithRating = products.map(product => {
      const ratings = product.reviews.map(r => r.rating);
      const avgRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
        : 0;
      
      const result = {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: ratings.length,
      };

      // Include reviews only for single product detail
      if (!slug) {
        result.reviews = undefined;
      }

      return result;
    });

    // For single product, get related products
    if (slug && products.length > 0) {
      const currentProduct = products[0];
      const relatedProducts = await prisma.product.findMany({
        where: {
          categoryId: currentProduct.categoryId,
          id: { not: currentProduct.id },
          isActive: true,
          isApproved: true
        },
        include: {
          category: true,
          alumni: {
            select: {
              id: true,
              fullName: true,
              profilePhoto: true
            }
          },
          reviews: {
            where: { isApproved: true },
            select: {
              rating: true
            }
          }
        },
        take: 4,
        orderBy: {
          viewCount: 'desc'
        }
      });

      // Calculate rating for related products
      const relatedWithRating = relatedProducts.map(product => {
        const ratings = product.reviews.map(r => r.rating);
        const avgRating = ratings.length > 0 
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
          : 0;
        
        return {
          ...product,
          avgRating: Math.round(avgRating * 10) / 10,
          reviewCount: ratings.length,
          reviews: undefined
        };
      });

      productsWithRating[0].relatedProducts = relatedWithRating;
    }

    // Return different response format for single product vs list
    if (slug) {
      if (productsWithRating.length === 0) {
        return NextResponse.json(
          { error: 'Produk tidak ditemukan' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        products: productsWithRating
      });
    }

    return NextResponse.json({
      products: productsWithRating,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
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

// POST /api/products - Buat produk baru (hanya alumni verified)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Cek apakah user adalah alumni verified
    const alumni = await prisma.alumni.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        isVerified: true,
        status: true
      }
    });

    if (!alumni || !alumni.isVerified || alumni.status !== 'VERIFIED') {
      return NextResponse.json(
        { error: 'Hanya alumni yang terverifikasi yang dapat menambah produk' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      shortDescription,
      price,
      priceMin,
      priceMax,
      priceText,
      categoryId,
      images,
      thumbnailImage,
      videoUrl,
      location,
      shippingInfo,
      shopeeUrl,
      tokopediaUrl,
      tiktokUrl,
      bukalapakUrl,
      lazadaUrl,
      blibliUrl,
      whatsappNumber,
      instagramUrl,
      facebookUrl,
      websiteUrl,
      businessName,
      businessType,
      tags,
      metaTitle,
      metaDescription
    } = body;

    // Validasi required fields
    if (!name || !description || !categoryId) {
      return NextResponse.json(
        { error: 'Nama produk, deskripsi, dan kategori wajib diisi' },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      + '-' + Date.now();

    // Buat produk baru
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        shortDescription,
        price: price ? parseFloat(price) : null,
        priceMin: priceMin ? parseFloat(priceMin) : null,
        priceMax: priceMax ? parseFloat(priceMax) : null,
        priceText,
        categoryId,
        alumniId: alumni.id,
        images: images || [],
        thumbnailImage,
        videoUrl,
        location,
        shippingInfo,
        shopeeUrl,
        tokopediaUrl,
        tiktokUrl,
        bukalapakUrl,
        lazadaUrl,
        blibliUrl,
        whatsappNumber,
        instagramUrl,
        facebookUrl,
        websiteUrl,
        businessName,
        businessType,
        tags: tags || [],
        metaTitle,
        metaDescription,
        isApproved: true // Auto-approved untuk alumni verified
      },
      include: {
        category: true,
        alumni: {
          select: {
            id: true,
            fullName: true,
            profilePhoto: true
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