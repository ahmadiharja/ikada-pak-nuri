import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Fetch single category by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const withPosts = searchParams.get('withPosts') === 'true';
    
    const category = await prisma.category.findUnique({
      where: { id },
      include: withPosts ? {
        posts: {
          where: { status: 'APPROVED' },
          include: {
            author: {
              select: {
                id: true,
                name: true
              }
            },
            comments: {
              where: { status: 'APPROVED' },
              select: { id: true }
            }
          },
          orderBy: { publishedAt: 'desc' }
        }
      } : {
        posts: {
          select: { id: true },
          where: { status: 'APPROVED' }
        }
      }
    });
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    const categoryWithCount = {
      ...category,
      postCount: category.posts.length,
      posts: withPosts ? category.posts.map(post => ({
        ...post,
        commentCount: post.comments?.length || 0
      })) : undefined
    };
    
    return NextResponse.json({ category: categoryWithCount });
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// PUT - Update category
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
    
    // Only PUSAT role can update categories
    if (session.user.role !== 'PUSAT') {
      return NextResponse.json(
        { error: 'Forbidden - Only admin can update categories' },
        { status: 403 }
      );
    }
    
    const { id } = params;
    const body = await request.json();
    const { name, description, color } = body;
    
    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });
    
    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Generate new slug if name changed
    let slug = existingCategory.slug;
    if (name && name !== existingCategory.name) {
      slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
      
      // Check if new name or slug already exists
      const duplicateCategory = await prisma.category.findFirst({
        where: {
          OR: [
            { name: { equals: name, mode: 'insensitive' } },
            { slug }
          ],
          id: { not: id }
        }
      });
      
      if (duplicateCategory) {
        return NextResponse.json(
          { error: 'Category name or slug already exists' },
          { status: 400 }
        );
      }
    }
    
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: name || existingCategory.name,
        slug,
        description,
        color
      }
    });
    
    return NextResponse.json({
      message: 'Category updated successfully',
      category: updatedCategory
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE - Delete category
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
    
    // Only PUSAT role can delete categories
    if (session.user.role !== 'PUSAT') {
      return NextResponse.json(
        { error: 'Forbidden - Only admin can delete categories' },
        { status: 403 }
      );
    }
    
    const { id } = params;
    
    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        posts: {
          select: { id: true }
        }
      }
    });
    
    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Check if category has posts
    if (existingCategory.posts.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category that has posts. Please move or delete the posts first.' },
        { status: 400 }
      );
    }
    
    // Delete category
    await prisma.category.delete({
      where: { id }
    });
    
    return NextResponse.json({
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}