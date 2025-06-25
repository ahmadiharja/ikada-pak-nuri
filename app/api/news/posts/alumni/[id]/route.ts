import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Dummy alumni token validation (replace with real validation as needed)
async function validateAlumniToken(token: string | undefined): Promise<boolean> {
  // Example: token should be non-empty and start with 'alumni-'
  return !!token && token.startsWith('alumni-');
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Get alumni token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '').trim();
    const isValid = await validateAlumniToken(token);
    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        },
        category: {
          select: { id: true, name: true, color: true }
        },
        tags: {
          include: {
            tag: { select: { id: true, name: true } }
          }
        },
        comments: {
          where: { status: 'APPROVED' },
          select: { id: true }
        }
      }
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Flatten tags
    const tags = post.tags.map(pt => pt.tag);
    const commentCount = post.comments.length;

    return NextResponse.json({
      post: {
        ...post,
        tags,
        commentCount
      }
    });
  } catch (error) {
    console.error('Error fetching alumni post detail:', error);
    return NextResponse.json({ error: 'Failed to fetch post detail' }, { status: 500 });
  }
} 