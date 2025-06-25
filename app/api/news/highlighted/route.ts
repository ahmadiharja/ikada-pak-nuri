import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const highlightedPosts = await prisma.post.findMany({
      where: {
        highlighted: true,
        status: 'APPROVED',
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        imageUrl: true,
        publishedAt: true,
        viewCount: true,
        author: {
          select: {
            name: true,
          },
        },
        category: {
          select: {
            name: true,
            slug: true,
            color: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ highlightedPosts });
  } catch (error) {
    console.error('Error fetching highlighted posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch highlighted posts' },
      { status: 500 }
    );
  }
}