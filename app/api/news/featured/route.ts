import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch featured posts for slider
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    
    const featuredPosts = await prisma.post.findMany({
      where: {
        featured: true,
        status: 'APPROVED'
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true
          }
        },
        comments: {
          where: { status: 'APPROVED' },
          select: { id: true }
        }
      },
      orderBy: [
        { featuredOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      take: limit
    });
    
    const postsWithCounts = featuredPosts.map(post => ({
      ...post,
      commentCount: post.comments.length
    }));
    
    return NextResponse.json({
      featuredPosts: postsWithCounts
    });
  } catch (error) {
    console.error('Error fetching featured posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured posts' },
      { status: 500 }
    );
  }
}