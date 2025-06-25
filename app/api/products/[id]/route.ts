import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/products/[id] - Ambil detail produk
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const incrementView = searchParams.get('view') === 'true';

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        store: {
          include: {
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
            }
          }
        },
        reviews: {
          where: { 
            isApproved: true,
            isPublic: true 
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    if (!product.isActive || !product.isApproved) {
      return NextResponse.json(
        { error: 'Produk tidak tersedia' },
        { status: 404 }
      );
    }

    // Increment view count jika diminta
    if (incrementView) {
      await prisma.product.update({
        where: { id },
        data: {
          viewCount: {
            increment: 1
          }
        }
      });
    }

    // Calculate average rating
    const ratings = product.reviews.map(r => r.rating);
    const avgRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
      : 0;

    // Get related products (same category, exclude current)
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: id },
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
        }
      },
      take: 4,
      orderBy: {
        viewCount: 'desc'
      }
    });

    const productData = {
      ...product,
      images: Array.isArray(product.images) ? product.images : [product.images].filter(Boolean),
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: ratings.length,
      relatedProducts
    };

    return NextResponse.json(productData);

  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data produk' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/products/[id] - Update produk (hanya pemilik)
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // Cek apakah produk ada dan milik alumni yang login
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        store: {
          include: {
            alumni: true
          }
        }
      }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    if (existingProduct.store.alumni.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki akses untuk mengubah produk ini' },
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
      metaDescription,
      isActive
    } = body;

    // Generate new slug if name changed
    let slug = existingProduct.slug;
    if (name && name !== existingProduct.name) {
      slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        + '-' + Date.now();
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug !== existingProduct.slug && { slug }),
        ...(description && { description }),
        ...(shortDescription !== undefined && { shortDescription }),
        ...(price !== undefined && { price: price ? parseFloat(price) : null }),
        ...(priceMin !== undefined && { priceMin: priceMin ? parseFloat(priceMin) : null }),
        ...(priceMax !== undefined && { priceMax: priceMax ? parseFloat(priceMax) : null }),
        ...(priceText !== undefined && { priceText }),
        ...(categoryId && { categoryId }),
        ...(images !== undefined && { images }),
        ...(thumbnailImage !== undefined && { thumbnailImage }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(location !== undefined && { location }),
        ...(shippingInfo !== undefined && { shippingInfo }),
        ...(shopeeUrl !== undefined && { shopeeUrl }),
        ...(tokopediaUrl !== undefined && { tokopediaUrl }),
        ...(tiktokUrl !== undefined && { tiktokUrl }),
        ...(bukalapakUrl !== undefined && { bukalapakUrl }),
        ...(lazadaUrl !== undefined && { lazadaUrl }),
        ...(blibliUrl !== undefined && { blibliUrl }),
        ...(whatsappNumber !== undefined && { whatsappNumber }),
        ...(instagramUrl !== undefined && { instagramUrl }),
        ...(facebookUrl !== undefined && { facebookUrl }),
        ...(websiteUrl !== undefined && { websiteUrl }),
        ...(businessName !== undefined && { businessName }),
        ...(businessType !== undefined && { businessType }),
        ...(tags !== undefined && { tags }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        category: true,
        store: {
          include: {
            alumni: true
          }
        }
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

// DELETE /api/products/[id] - Hapus produk (hanya pemilik)
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    // Cek apakah produk ada dan milik alumni yang login
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        store: {
          include: {
            alumni: true
          }
        }
      }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    if (existingProduct.store.alumni.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Anda tidak memiliki akses untuk menghapus produk ini' },
        { status: 403 }
      );
    }

    await prisma.product.delete({
      where: { id }
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