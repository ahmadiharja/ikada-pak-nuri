const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCategories() {
  try {
    console.log('Checking categories in database...');
    
    const categories = await prisma.productCategory.findMany({
      include: {
        children: true,
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log(`Found ${categories.length} categories in database:`);
    
    categories.forEach(category => {
      console.log(`- ${category.name} (Level: ${category.level}, Children: ${category.children?.length || 0}, Products: ${category._count?.products || 0})`);
    });
    
    // Check hierarchical structure
    const rootCategories = await prisma.productCategory.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: true
          }
        }
      }
    });
    
    console.log(`\nRoot categories: ${rootCategories.length}`);
    rootCategories.forEach(root => {
      console.log(`- ${root.name} (${root.children?.length || 0} sub-categories)`);
    });
    
  } catch (error) {
    console.error('Error checking categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();