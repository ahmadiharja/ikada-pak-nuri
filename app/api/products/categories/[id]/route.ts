import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/products/categories/[id] - Ambil kategori berdasarkan ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const includeChildren = searchParams.get('includeChildren') === 'true';
    const includeParent = searchParams.get('includeParent') === 'true';
    const includeCount = searchParams.get('includeCount') === 'true';

    const category = await prisma.productCategory.findUnique({
      where: { id },
      include: {
        ...(includeParent && { parent: true }),
        ...(includeChildren && {
          children: {
            include: {
              children: {
                include: {
                  children: true,
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
                orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
              },
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
            orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
          }
        }),
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
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Kategori tidak ditemukan' },
        { status: 404 }
      );
    }

    const result = includeCount ? {
      ...category,
      productCount: category._count?.products || 0,
      ...(category.children && {
        children: category.children.map((child: any) => addProductCount(child))
      })
    } : category;

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching category:', error);
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

// PUT /api/products/categories/[id] - Update kategori
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { error: 'Akses ditolak. Hanya admin yang dapat mengupdate kategori.' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { name, description, icon, color, sortOrder, parentId, isActive } = body;

    // Cek apakah kategori ada
    const existingCategory = await prisma.productCategory.findUnique({
      where: { id },
      include: { parent: true, children: true }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Kategori tidak ditemukan' },
        { status: 404 }
      );
    }

    // Validasi parent category jika diubah
    let level = existingCategory.level;
    let parentPath = '';
    
    if (parentId !== undefined && parentId !== existingCategory.parentId) {
      if (parentId) {
        // Cek parent category
        const parentCategory = await prisma.productCategory.findUnique({
          where: { id: parentId }
        });
        
        if (!parentCategory) {
          return NextResponse.json(
            { error: 'Kategori parent tidak ditemukan' },
            { status: 400 }
          );
        }
        
        // Cek apakah tidak membuat circular reference
        if (parentId === id) {
          return NextResponse.json(
            { error: 'Kategori tidak dapat menjadi parent dari dirinya sendiri' },
            { status: 400 }
          );
        }
        
        // Cek apakah parent bukan child dari kategori ini
        const isChildOfThis = await isDescendant(parentId, id);
        if (isChildOfThis) {
          return NextResponse.json(
            { error: 'Kategori parent tidak dapat menjadi child dari kategori ini' },
            { status: 400 }
          );
        }
        
        level = parentCategory.level + 1;
        parentPath = parentCategory.path || '';
        
        // Batasi maksimal 3 level
        if (level > 2) {
          return NextResponse.json(
            { error: 'Maksimal 3 level kategori yang diizinkan' },
            { status: 400 }
          );
        }
      } else {
        level = 0;
        parentPath = '';
      }
    } else if (existingCategory.parent) {
      parentPath = existingCategory.parent.path || '';
    }

    // Validasi nama unik dalam parent yang sama
    if (name && name !== existingCategory.name) {
      const duplicateName = await prisma.productCategory.findFirst({
        where: {
          name,
          parentId: parentId !== undefined ? (parentId || null) : existingCategory.parentId,
          id: { not: id }
        }
      });

      if (duplicateName) {
        return NextResponse.json(
          { error: 'Kategori dengan nama tersebut sudah ada dalam kategori parent yang sama' },
          { status: 400 }
        );
      }
    }

    // Generate slug baru jika nama berubah
    let slug = existingCategory.slug;
    if (name && name !== existingCategory.name) {
      slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      // Check if slug already exists
      const existingSlug = await prisma.productCategory.findFirst({
        where: {
          slug,
          id: { not: id }
        }
      });

      if (existingSlug) {
        return NextResponse.json(
          { error: 'Slug kategori sudah digunakan' },
          { status: 400 }
        );
      }
    }

    // Generate path baru
    const path = parentPath ? `${parentPath}/${slug}` : slug;

    // Update kategori
    const updatedCategory = await prisma.productCategory.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug !== existingCategory.slug && { slug }),
        ...(description !== undefined && { description: description || null }),
        ...(icon !== undefined && { icon: icon || null }),
        ...(color && { color }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(parentId !== undefined && { parentId: parentId || null }),
        ...(isActive !== undefined && { isActive }),
        level,
        path
      },
      include: {
        parent: true,
        children: true
      }
    });

    // Update path untuk semua children jika path berubah
    if (path !== existingCategory.path) {
      await updateChildrenPaths(id, path);
    }

    return NextResponse.json({
      message: 'Kategori berhasil diupdate',
      category: updatedCategory
    });

  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Gagal mengupdate kategori' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/products/categories/[id] - Hapus kategori
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        { error: 'Akses ditolak. Hanya admin yang dapat menghapus kategori.' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Cek apakah kategori ada
    const category = await prisma.productCategory.findUnique({
      where: { id },
      include: {
        children: true,
        products: true
      }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Kategori tidak ditemukan' },
        { status: 404 }
      );
    }

    // Cek apakah ada produk yang menggunakan kategori ini
    if (category.products.length > 0) {
      return NextResponse.json(
        { error: `Tidak dapat menghapus kategori karena masih ada ${category.products.length} produk yang menggunakan kategori ini` },
        { status: 400 }
      );
    }

    // Cek apakah ada sub-kategori
    if (category.children.length > 0) {
      return NextResponse.json(
        { error: `Tidak dapat menghapus kategori karena masih ada ${category.children.length} sub-kategori` },
        { status: 400 }
      );
    }

    // Hapus kategori
    await prisma.productCategory.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Kategori berhasil dihapus'
    });

  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus kategori' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function untuk cek apakah suatu kategori adalah descendant dari kategori lain
async function isDescendant(categoryId: string, ancestorId: string): Promise<boolean> {
  const category = await prisma.productCategory.findUnique({
    where: { id: categoryId },
    select: { parentId: true }
  });

  if (!category || !category.parentId) {
    return false;
  }

  if (category.parentId === ancestorId) {
    return true;
  }

  return isDescendant(category.parentId, ancestorId);
}

// Helper function untuk update path semua children
async function updateChildrenPaths(parentId: string, parentPath: string) {
  const children = await prisma.productCategory.findMany({
    where: { parentId },
    select: { id: true, slug: true }
  });

  for (const child of children) {
    const newPath = `${parentPath}/${child.slug}`;
    
    await prisma.productCategory.update({
      where: { id: child.id },
      data: { path: newPath }
    });

    // Recursively update grandchildren
    await updateChildrenPaths(child.id, newPath);
  }
}