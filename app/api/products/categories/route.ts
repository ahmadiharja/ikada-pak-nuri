import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/products/categories - Ambil semua kategori produk
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeCount = searchParams.get('includeCount') === 'true';
    const activeOnly = searchParams.get('activeOnly') !== 'false'; // default true
    const hierarchical = searchParams.get('hierarchical') === 'true'; // untuk struktur hierarkis
    const parentId = searchParams.get('parentId'); // untuk mengambil sub-kategori tertentu
    const level = searchParams.get('level'); // untuk mengambil kategori berdasarkan level
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // Build where clause
    const where: any = {};
    if (activeOnly && !includeInactive) {
      where.isActive = true;
    }
    if (parentId !== undefined) {
      where.parentId = parentId === 'null' ? null : parentId;
    }
    if (level !== null && level !== undefined && level !== '') {
      where.level = parseInt(level);
    }

    if (hierarchical) {
      // Ambil struktur hierarkis lengkap
      const hierarchicalWhere = { ...where };
      // Hapus level dari hierarchical query jika ada, karena kita ingin semua level
      delete hierarchicalWhere.level;
      if (level === null || level === undefined || level === '') {
        hierarchicalWhere.parentId = null; // hanya root categories jika level tidak ditentukan
      }
      // Helper function to generate the _count selection
      const createCountSelect = () => ({
        _count: {
          select: { products: { where: { isActive: true, isApproved: true } } }
        }
      });

      // Level 3 (L3) - Options for fetching L3 entities
      let l3ChildrenOptions = {
        where: activeOnly && !includeInactive ? { isActive: true } : {},
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: {} // Initialize include object for L3
      };
      if (includeCount) {
        // _count for L3 entities goes into L3's include block
        l3ChildrenOptions.include = { ...l3ChildrenOptions.include, ...createCountSelect() };
      }

      // Level 2 (L2) - Options for fetching L2 entities
      let l2ChildrenOptions = {
        where: activeOnly && !includeInactive ? { isActive: true } : {},
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: {
          children: l3ChildrenOptions // Nest L3 options
        }
      };
      if (includeCount) {
        // _count for L2 entities goes into L2's include block, as a sibling to 'children' relation
        l2ChildrenOptions.include = { ...l2ChildrenOptions.include, ...createCountSelect() };
      }

      // Level 1 (L1) - Options for fetching L1 entities
      let l1ChildrenOptions = {
        where: activeOnly && !includeInactive ? { isActive: true } : {},
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: {
          children: l2ChildrenOptions // Nest L2 options
        }
      };
      if (includeCount) {
        // _count for L1 entities goes into L1's include block
        l1ChildrenOptions.include = { ...l1ChildrenOptions.include, ...createCountSelect() };
      }

      // Root findMany arguments
      const findManyArgs: any = {
        where: hierarchicalWhere,
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: {
          children: l1ChildrenOptions // Nest L1 options
        }
      };
      if (includeCount) {
        // _count for Root entities goes into Root's include block
        findManyArgs.include = { ...findManyArgs.include, ...createCountSelect() };
      }

      const categories = await prisma.productCategory.findMany(findManyArgs);

      const result = includeCount 
        ? categories.map(category => addProductCount(category))
        : categories;

      return NextResponse.json(result);
    } else {
      // Ambil flat list
      const categories = await prisma.productCategory.findMany({
        where,
        include: {
          parent: true,
          ...(includeCount && {
            _count: {
              select: {
                products: {
                  where: {
                    isActive: true,
                    isApproved: true
                  }
                }
              }
            }
          })
        },
        orderBy: [
          { level: 'asc' },
          { sortOrder: 'asc' },
          { name: 'asc' }
        ]
      });

      const result = includeCount 
        ? categories.map(category => ({
            ...category,
            productCount: category._count?.products || 0
          }))
        : categories;

      return NextResponse.json(result);
    }

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data kategori' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function untuk menambahkan product count secara rekursif
function addProductCount(category: any): any {
  const result = {
    ...category,
    productCount: category._count?.products || 0
  };
  
  if (category.children && category.children.length > 0) {
    result.children = category.children.map((child: any) => addProductCount(child));
  }
  
  return result;
}

// POST /api/products/categories - Buat kategori baru (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    const isAdmin = user?.roles.some(ur => ur.role.name === 'ADMIN');
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya admin yang dapat membuat kategori.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, icon, color, sortOrder, parentId } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Nama kategori wajib diisi' },
        { status: 400 }
      );
    }

    // Validasi parent category jika ada
    let parentCategory = null;
    let level = 0;
    let parentPath = '';
    
    if (parentId) {
      parentCategory = await prisma.productCategory.findUnique({
        where: { id: parentId }
      });
      
      if (!parentCategory) {
        return NextResponse.json(
          { error: 'Kategori parent tidak ditemukan' },
          { status: 400 }
        );
      }
      
      level = parentCategory.level + 1;
      parentPath = parentCategory.path || '';
      
      // Batasi maksimal 3 level (0, 1, 2)
      if (level > 2) {
        return NextResponse.json(
          { error: 'Maksimal 3 level kategori yang diizinkan' },
          { status: 400 }
        );
      }
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check if category with same name exists in same parent
    const existingCategory = await prisma.productCategory.findFirst({
      where: {
        name,
        parentId: parentId || null
      }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Kategori dengan nama tersebut sudah ada dalam kategori parent yang sama' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingSlug = await prisma.productCategory.findUnique({
      where: { slug }
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: 'Slug kategori sudah digunakan' },
        { status: 400 }
      );
    }

    // Generate path
    const path = parentPath ? `${parentPath}/${slug}` : slug;

    const category = await prisma.productCategory.create({
      data: {
        name,
        slug,
        description: description || null,
        icon: icon || null,
        color: color || '#3B82F6',
        sortOrder: sortOrder || 0,
        level,
        parentId: parentId || null,
        path
      }
    });

    return NextResponse.json({
      message: 'Kategori berhasil dibuat',
      category
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Gagal membuat kategori' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}