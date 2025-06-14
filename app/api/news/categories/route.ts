import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Fetch all categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const withPostCount = searchParams.get('withPostCount') === 'true';
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const categories = await prisma.category.findMany({
      where,
      include: withPostCount ? {
        posts: {
          select: { id: true },
          where: { status: 'APPROVED' }
        }
      } : undefined,
      orderBy: { name: 'asc' }
    });
    
    const categoriesWithCount = categories.map(category => ({
      ...category,
      postCount: withPostCount ? category.posts?.length || 0 : undefined,
      posts: undefined // Remove posts array from response
    }));
    
    return NextResponse.json({ categories: categoriesWithCount });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Only PUSAT role can create categories
    if (session.user.role !== 'PUSAT') {
      return NextResponse.json(
        { error: 'Forbidden - Only admin can create categories' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { name, description, color } = body;
    
    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }
    
    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
    
    // Check if category name or slug already exists
    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: 'insensitive' } },
          { slug }
        ]
      }
    });
    
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category name or slug already exists' },
        { status: 400 }
      );
    }
    
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        color
      }
    });
    
    return NextResponse.json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}