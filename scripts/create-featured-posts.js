const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createFeaturedPosts() {
  try {
    console.log('Creating featured posts...');
    
    // First, reset all featured posts
    await prisma.post.updateMany({
      data: {
        featured: false,
        featuredOrder: null
      }
    });
    
    // Get approved posts
    const posts = await prisma.post.findMany({
      where: {
        status: 'APPROVED'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });
    
    if (posts.length > 0) {
      // Update posts to be featured
      for (let i = 0; i < Math.min(posts.length, 5); i++) {
        await prisma.post.update({
          where: { id: posts[i].id },
          data: {
            featured: true,
            featuredOrder: i + 1
          }
        });
        console.log(`✓ Set post "${posts[i].title}" as featured (order: ${i + 1})`);
      }
      
      console.log(`\n✅ Successfully updated ${Math.min(posts.length, 5)} posts as featured`);
    } else {
      console.log('❌ No approved posts found to make featured');
    }
  } catch (error) {
    console.error('❌ Error creating featured posts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createFeaturedPosts();