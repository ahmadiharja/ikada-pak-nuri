import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/products/[id]/click - Track marketplace click
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { platform } = body;

    // Validate product exists
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    // Increment click count
    await prisma.product.update({
      where: { id },
      data: {
        clickCount: {
          increment: 1
        }
      }
    });

    // Log the click (optional - for analytics)
    // You can create a separate table for detailed click tracking
    console.log(`Product ${id} clicked on ${platform}`);

    return NextResponse.json({
      message: 'Click tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking click:', error);
    return NextResponse.json(
      { error: 'Gagal melacak klik' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}