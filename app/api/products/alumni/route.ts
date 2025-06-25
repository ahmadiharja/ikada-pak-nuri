import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isApproved: true,
      },
      include: {
        store: {
          include: {
            alumni: {
              select: {
                fullName: true,
                profilePhoto: true,
              },
            },
          },
        },
        category: {
          select: {
            name: true,
            color: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the data to match the expected format
    const transformedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price ? Number(product.price) : 0,
      image: product.thumbnailImage || (product.images.length > 0 ? product.images[0] : '/placeholder-logo.png'),
      description: product.description,
      marketplace: 'Marketplace',
      marketplaceUrl: product.shopeeUrl || product.tokopediaUrl || product.tiktokUrl || '#',
      category: product.category?.name,
      categoryColor: product.category?.color,
      alumniName: product.store?.alumni?.fullName,
      storeName: product.store?.name,
      shippedFromCity: product.shippedFromCity,
      unit: product.unit,
      viewCount: product.viewCount,
      clickCount: product.clickCount,
      createdAt: product.createdAt,
    }));

    return NextResponse.json({
      success: true,
      products: transformedProducts,
    });
  } catch (error) {
    console.error('Error fetching alumni products:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch alumni products',
      },
      { status: 500 }
    );
  }
} 