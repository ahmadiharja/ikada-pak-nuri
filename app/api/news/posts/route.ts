import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Fetch all posts with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const slug = searchParams.get('slug') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const status = searchParams.get('status') || '';
    const authorId = searchParams.get('authorId') || '';
    const featured = searchParams.get('featured') === 'true';
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    // If slug is provided, search by exact slug match
    if (slug) {
      where.slug = slug;
    } else if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (authorId) {
      where.authorId = authorId;
    }
    
    if (featured) {
      where.featured = true;
    }
    
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
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
            where: { status: 'APPROVED' },
            select: { id: true }
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
        },
        orderBy: featured ? { featuredOrder: 'asc' } : { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.post.count({ where })
    ]);
    
    const postsWithCounts = posts.map(post => ({
      ...post,
      commentCount: post.comments.length,
      tags: post.tags.map(pt => pt.tag)
    }));
    
    return NextResponse.json({
      posts: postsWithCounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST - Create new post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const {
      title,
      content,
      excerpt,
      imageUrl,
      categoryId,
      status = 'PENDING',
      tags = [],
      visibility = 'ALL_SYUBIYAH',
      targetSyubiyahIds = [],
      featured = false,
      featuredOrder = null
    } = body;
    
    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }
    
    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
    
    // Check if slug already exists
    const existingPost = await prisma.post.findUnique({
      where: { slug }
    });
    
    let finalSlug = slug;
    if (existingPost) {
      const timestamp = Date.now();
      finalSlug = `${slug}-${timestamp}`;
    }
    
    // Helper function to extract temp URLs from content and imageUrl
    const extractTempUrls = (content: string, imageUrl?: string) => {
      const tempUrls: string[] = [];
      
      // Extract temp URLs from content
      const tempUrlRegex = /\/temp\/blog\/[^\s"')]+/g;
      const contentMatches = content.match(tempUrlRegex);
      if (contentMatches) {
        tempUrls.push(...contentMatches);
      }
      
      // Check if imageUrl is a temp URL
      if (imageUrl && imageUrl.startsWith('/temp/blog/')) {
        tempUrls.push(imageUrl);
      }
      
      return [...new Set(tempUrls)]; // Remove duplicates
    };

    // Helper function to replace temp URLs with public URLs
    const replaceTempUrls = (text: string, urlMapping: Record<string, string>) => {
      let updatedText = text;
      Object.entries(urlMapping).forEach(([tempUrl, publicUrl]) => {
        updatedText = updatedText.replace(new RegExp(tempUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), publicUrl);
      });
      return updatedText;
    };

    let finalContent = content;
    let finalImageUrl = imageUrl;
    
    // If status is APPROVED, move temp files to public
    if (status === 'APPROVED') {
      const tempUrls = extractTempUrls(content, imageUrl);
      
      if (tempUrls.length > 0) {
        try {
          const moveResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/upload/move-to-public`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tempUrls }),
          });
          
          if (moveResponse.ok) {
            const moveResult = await moveResponse.json();
            const urlMapping: Record<string, string> = {};
            
            moveResult.movedFiles.forEach((file: any) => {
              urlMapping[file.tempUrl] = file.publicUrl;
            });
            
            // Replace temp URLs with public URLs
            finalContent = replaceTempUrls(content, urlMapping);
            if (imageUrl && urlMapping[imageUrl]) {
              finalImageUrl = urlMapping[imageUrl];
            }
          }
        } catch (error) {
          console.error('Error moving temp files to public:', error);
          // Continue with post creation even if file move fails
        }
      }
    }

    // Create post with tags
    const post = await prisma.post.create({
      data: {
        title,
        slug: finalSlug,
        content: finalContent,
        excerpt,
        imageUrl: finalImageUrl,
        status,
        authorId: session.user.id,
        categoryId: categoryId && categoryId !== 'none' ? categoryId : null,
        publishedAt: status === 'APPROVED' ? new Date() : null,
        visibility,
        targetSyubiyahIds,
        featured,
        featuredOrder,
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
      message: 'Post created successfully',
      post: {
        ...post,
        tags: post.tags.map(pt => pt.tag)
      }
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}