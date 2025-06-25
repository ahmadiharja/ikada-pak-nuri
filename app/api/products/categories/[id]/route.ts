import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET - Get single category by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const category = await prisma.productCategory.findUnique({
      where: { id },
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

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
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
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { name, description, icon, color, sortOrder, isActive, parentId } = body;

    // Check if category exists
    const existingCategory = await prisma.productCategory.findUnique({
      where: { id },
      include: {
        children: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

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

    // Check for duplicate name within same parent (excluding current category)
    const duplicateCategory = await prisma.productCategory.findFirst({
      where: {
        name: name.trim(),
        parentId: parentId || null,
        id: { not: id },
      },
    });

    if (duplicateCategory) {
      return NextResponse.json(
        { error: 'Category with this name already exists in the same parent' },
        { status: 400 }
      );
    }

    // Check if trying to move category to its own descendant
    if (parentId) {
      const isDescendant = await checkIfDescendant(id, parentId);
      if (isDescendant) {
        return NextResponse.json(
          { error: 'Cannot move category to its own descendant' },
          { status: 400 }
        );
      }
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

    // Update category
    const updatedCategory = await prisma.productCategory.update({
      where: { id },
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

    // Update paths for all descendants if parent changed
    if (existingCategory.parentId !== (parentId || null)) {
      await updateDescendantPaths(id, path);
    }

    return NextResponse.json(updatedCategory);
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
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // Check if category exists
    const category = await prisma.productCategory.findUnique({
      where: { id },
      include: {
        children: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Check if category has children
    if (category.children && category.children.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with sub-categories. Please delete sub-categories first.' },
        { status: 400 }
      );
    }

    // Check if category has products
    if (category._count.products > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with products. Please remove or reassign products first.' },
        { status: 400 }
      );
    }

    // Delete category
    await prisma.productCategory.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Category deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}

// Helper function to check if a category is a descendant of another
async function checkIfDescendant(categoryId: string, potentialParentId: string): Promise<boolean> {
  const parent = await prisma.productCategory.findUnique({
    where: { id: potentialParentId },
    select: { parentId: true }
  });

  if (!parent) {
    return false;
  }

  if (parent.parentId === categoryId) {
    return true;
  }

  if (parent.parentId) {
    return checkIfDescendant(categoryId, parent.parentId);
  }

  return false;
}

// Helper function to update paths for all descendants
async function updateDescendantPaths(categoryId: string, newParentPath: string) {
  const descendants = await prisma.productCategory.findMany({
    where: {
      path: {
        startsWith: `${newParentPath}/`,
      },
    },
  });

  for (const descendant of descendants) {
    const oldPath = descendant.path;
    if (oldPath) {
      const slug = oldPath.split('/').pop()!;
      const newPath = `${newParentPath}/${slug}`;

      await prisma.productCategory.update({
        where: { id: descendant.id },
        data: { path: newPath },
      });
    }
  }
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