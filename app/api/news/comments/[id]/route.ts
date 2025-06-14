import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Fetch single comment by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const comment = await prisma.comment.findUnique({
      where: { id },
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
          where: { status: 'APPROVED' },
          include: {
            author: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    
    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ comment });
  } catch (error) {
    console.error('Error fetching comment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comment' },
      { status: 500 }
    );
  }
}

// PUT - Update comment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    const body = await request.json();
    const { content, status } = body;
    
    // Check if comment exists
    const existingComment = await prisma.comment.findUnique({
      where: { id },
      include: { author: true }
    });
    
    if (!existingComment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }
    
    // Check permissions
    const isAuthor = existingComment.authorId === session.user.id;
    const isAdmin = session.user.role === 'PUSAT';
    
    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Authors can only edit content, admins can edit content and status
    const updateData: any = {};
    
    if (content !== undefined) {
      updateData.content = content;
      // If author edits content, reset status to pending
      if (isAuthor && !isAdmin) {
        updateData.status = 'PENDING';
      }
    }
    
    // Only admins can change status
    if (status !== undefined && isAdmin) {
      updateData.status = status;
    }
    
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: updateData,
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
      message: 'Comment updated successfully',
      comment: updatedComment
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}

// DELETE - Delete comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    
    // Check if comment exists
    const existingComment = await prisma.comment.findUnique({
      where: { id },
      include: {
        author: true,
        replies: {
          select: { id: true }
        }
      }
    });
    
    if (!existingComment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }
    
    // Check permissions
    const isAuthor = existingComment.authorId === session.user.id;
    const isAdmin = session.user.role === 'PUSAT';
    
    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Check if comment has replies
    if (existingComment.replies.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete comment that has replies. Please delete the replies first.' },
        { status: 400 }
      );
    }
    
    // Delete comment
    await prisma.comment.delete({
      where: { id }
    });
    
    return NextResponse.json({
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}