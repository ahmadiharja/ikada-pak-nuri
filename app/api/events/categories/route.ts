import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Fetch all event categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const withEventCount = searchParams.get('withEventCount') === 'true';
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const categories = await prisma.eventCategory.findMany({
      where,
      include: withEventCount ? {
        events: {
          select: { id: true },
          where: { status: 'APPROVED' }
        }
      } : undefined,
      orderBy: { name: 'asc' }
    });
    
    const categoriesWithCount = categories.map(category => ({
      ...category,
      eventCount: withEventCount ? category.events?.length || 0 : undefined,
      events: undefined // Remove events array from response
    }));
    
    return NextResponse.json({ categories: categoriesWithCount });
  } catch (error) {
    console.error('Error fetching event categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event categories' },
      { status: 500 }
    );
  }
}

// POST - Create new event category
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
        { error: 'Forbidden - Only admin can create event categories' },
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
    
    // Check if category name already exists
    const existingCategory = await prisma.eventCategory.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' }
      }
    });
    
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category name already exists' },
        { status: 400 }
      );
    }
    
    // Create new category
    const newCategory = await prisma.eventCategory.create({
      data: {
        name,
        description: description || null,
        color: color || 'blue'
      }
    });
    
    return NextResponse.json({ 
      message: 'Event category created successfully',
      category: newCategory 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating event category:', error);
    return NextResponse.json(
      { error: 'Failed to create event category' },
      { status: 500 }
    );
  }
}