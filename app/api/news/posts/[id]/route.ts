import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Fetch single post by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const post = await prisma.post.findUnique({
      where: { id },
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
          where: { status: 'APPROVED', parentId: null },
          include: {
            author: {
              select: {
                id: true,
                name: true
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
          },
          orderBy: { createdAt: 'desc' }
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      }
    });
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // Increment view count
    await prisma.post.update({
      where: { id },
      data: { viewCount: { increment: 1 } }
    });
    
    const postWithTags = {
      ...post,
      tags: post.tags.map(pt => pt.tag)
    };
    
    return NextResponse.json({ post: postWithTags });
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

// PUT - Update post
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
    const {
      title,
      content,
      excerpt,
      imageUrl,
      categoryId,
      status,
      tags = [],
      visibility,
      targetSyubiyahIds
    } = body;
    
    // Check if post exists and user has permission
    const existingPost = await prisma.post.findUnique({
      where: { id },
      include: { author: true }
    });
    
    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // Check if user is author or has admin role
    if (existingPost.authorId !== session.user.id && session.user.role !== 'PUSAT') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Generate new slug if title changed
    let slug = existingPost.slug;
    if (title && title !== existingPost.title) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
      
      // Check if new slug already exists
      const slugExists = await prisma.post.findFirst({
        where: {
          slug,
          id: { not: id }
        }
      });
      
      if (slugExists) {
        const timestamp = Date.now();
        slug = `${slug}-${timestamp}`;
      }
    }
    
    // Delete existing tags
    await prisma.postTag.deleteMany({
      where: { postId: id }
    });
    
    // Update post with new tags
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title: title || existingPost.title,
        slug,
        content: content || existingPost.content,
        excerpt,
        imageUrl,
        categoryId: categoryId && categoryId !== 'none' ? categoryId : null,
        status: status || existingPost.status,
        publishedAt: status === 'APPROVED' && !existingPost.publishedAt ? new Date() : existingPost.publishedAt,
        ...(visibility !== undefined && { visibility }),
        ...(targetSyubiyahIds !== undefined && { targetSyubiyahIds }),
        tags: {
          create: tags.map((tagName: string) => ({
            tag: {
              connectOrCreate: {
                where: { name: tagName },
                create: {
                  name: tagName,
                  slug: tagName.toLowerCase().replace(/\s+/g, '-')
                }
              }
            }
          }))
        }
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: true,
        tags: {
          include: {
            tag: true
          }
        }
      }
    });
    
    return NextResponse.json({
      message: 'Post updated successfully',
      post: {
        ...updatedPost,
        tags: updatedPost.tags.map(pt => pt.tag)
      }
    });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

// DELETE - Delete post
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
    
    // Check if post exists and user has permission
    const existingPost = await prisma.post.findUnique({
      where: { id },
      include: { author: true }
    });
    
    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // Check if user is author or has admin role
    if (existingPost.authorId !== session.user.id && session.user.role !== 'PUSAT') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Delete post (cascade will handle related records)
    await prisma.post.delete({
      where: { id }
    });
    
    return NextResponse.json({
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}

// PATCH - Update featured status or increment view count
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { featured, action } = body;
    
    // Handle increment view count (no auth required)
    if (action === 'increment_view') {
      const updatedPost = await prisma.post.update({
        where: { id },
        data: { viewCount: { increment: 1 } }
      });
      
      return NextResponse.json({
        message: 'View count updated',
        viewCount: updatedPost.viewCount
      });
    }
    
    // For other actions, require authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id },
      include: { author: true }
    });
    
    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // Check if user has permission (author or admin)
    if (existingPost.authorId !== session.user.id && session.user.role !== 'PUSAT') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Update featured status
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        featured: featured,
        featuredOrder: featured ? 1 : null
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
        }
      }
    });
    
    return NextResponse.json({
      message: 'Featured status updated successfully',
      post: updatedPost
    });
  } catch (error) {
    console.error('Error updating featured status:', error);
    return NextResponse.json(
      { error: 'Failed to update featured status' },
      { status: 500 }
    );
  }
}