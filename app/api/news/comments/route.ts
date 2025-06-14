import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Fetch all comments with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const postId = searchParams.get('postId') || '';
    const status = searchParams.get('status') || '';
    const authorId = searchParams.get('authorId') || '';
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (search) {
      where.content = { contains: search, mode: 'insensitive' };
    }
    
    if (postId) {
      where.postId = postId;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (authorId) {
      where.authorId = authorId;
    }
    
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          post: {
            select: {
              id: true,
              title: true,
              slug: true
            }
          },
          parent: {
            select: {
              id: true,
              content: true,
              author: {
                select: {
                  name: true
                }
              }
            }
          },
          replies: {
            select: { id: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.comment.count({ where })
    ]);
    
    const commentsWithCounts = comments.map(comment => ({
      ...comment,
      replyCount: comment.replies.length
    }));
    
    return NextResponse.json({
      comments: commentsWithCounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST - Create new comment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { content, postId, parentId } = body;
    
    // Validate required fields
    if (!content || !postId) {
      return NextResponse.json(
        { error: 'Content and post ID are required' },
        { status: 400 }
      );
    }
    
    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // If parentId is provided, check if parent comment exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId }
      });
      
      if (!parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        );
      }
      
      // Ensure parent comment belongs to the same post
      if (parentComment.postId !== postId) {
        return NextResponse.json(
          { error: 'Parent comment does not belong to this post' },
          { status: 400 }
        );
      }
    }
    
    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: session.user.id,
        postId,
        parentId: parentId || null,
        status: 'PENDING' // Comments need approval
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        post: {
          select: {
            id: true,
            title: true
          }
        },
        parent: {
          select: {
            id: true,
            content: true,
            author: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });
    
    return NextResponse.json({
      message: 'Comment created successfully and is pending approval',
      comment
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}