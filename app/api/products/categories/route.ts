import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Fetch categories with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeCount = searchParams.get('includeCount') === 'true';
    const hierarchical = searchParams.get('hierarchical') === 'true';
    const isActive = searchParams.get('isActive');
    const level = searchParams.get('level');
    const parentId = searchParams.get('parentId');

    // Build where clause
    const where: any = {};
    
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }
    
    if (level !== null) {
      where.level = parseInt(level);
    }
    
    if (parentId !== null) {
      if (parentId === 'null' || parentId === '') {
        where.parentId = null;
      } else {
        where.parentId = parentId;
      }
    }

    // Build include clause
    const include: any = {
      parent: true,
      children: true,
    };

    if (includeCount) {
      include._count = {
        select: {
          products: true,
        },
      };
    }

    // Get categories
    let categories;
    
    if (hierarchical) {
      // Get only root categories for hierarchical view
      categories = await prisma.productCategory.findMany({
        where: { ...where, level: 0 },
        include,
        orderBy: [
          { sortOrder: 'asc' },
          { name: 'asc' },
        ],
      });

      // Recursively load children
      for (const category of categories) {
        category.children = await loadChildrenRecursively(category.id, include);
      }
    } else {
      // Get all categories flat
      categories = await prisma.productCategory.findMany({
        where,
        include,
        orderBy: [
          { level: 'asc' },
          { sortOrder: 'asc' },
          { name: 'asc' },
        ],
      });
    }

    return NextResponse.json(categories);
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
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, icon, color, sortOrder, isActive, parentId } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check if parent exists and get its level
    let parentLevel = -1;
    if (parentId) {
      const parent = await prisma.productCategory.findUnique({
        where: { id: parentId },
        select: { level: true, path: true }
      });
      
      if (!parent) {
        return NextResponse.json(
          { error: 'Parent category not found' },
          { status: 400 }
        );
      }
      
      parentLevel = parent.level;
      
      // Check if adding this category would exceed max level (3 levels: 0, 1, 2)
      if (parentLevel >= 2) {
        return NextResponse.json(
          { error: 'Cannot create category beyond level 2 (maximum 3 levels allowed)' },
          { status: 400 }
        );
      }
    }

    // Check for duplicate name within same parent
    const existingCategory = await prisma.productCategory.findFirst({
      where: {
        name: name.trim(),
        parentId: parentId || null,
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name already exists in the same parent' },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = generateSlug(name);
    
    // Calculate level
    const level = parentLevel + 1;
    
    // Generate path
    let path = slug;
    if (parentId) {
      const parent = await prisma.productCategory.findUnique({
        where: { id: parentId },
        select: { path: true }
      });
      path = parent ? `${parent.path}/${slug}` : slug;
    }

    // Create category
    const category = await prisma.productCategory.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        icon: icon?.trim() || null,
        color: color || '#3B82F6',
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true,
        level,
        path,
        parentId: parentId || null,
      },
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

// Helper function to load children recursively
async function loadChildrenRecursively(parentId: string, include: any) {
  const children = await prisma.productCategory.findMany({
    where: { parentId },
    include,
    orderBy: [
      { sortOrder: 'asc' },
      { name: 'asc' },
    ],
  });

  for (const child of children) {
    child.children = await loadChildrenRecursively(child.id, include);
  }

  return children;
}

// Helper function to generate slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}