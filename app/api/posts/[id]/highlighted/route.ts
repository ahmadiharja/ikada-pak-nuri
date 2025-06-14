import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(
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

    const { highlighted } = await request.json();
    const postId = params.id;

    // Jika ingin set highlighted = true, pastikan tidak ada post lain yang highlighted
    if (highlighted) {
      // Set semua post lain menjadi tidak highlighted
      await prisma.post.updateMany({
        where: {
          highlighted: true,
          id: {
            not: postId,
          },
        },
        data: {
          highlighted: false,
        },
      });
    }

    // Update post yang dipilih
    const updatedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        highlighted,
      },
      select: {
        id: true,
        title: true,
        highlighted: true,
      },
    });

    return NextResponse.json({
      success: true,
      post: updatedPost,
      message: highlighted 
        ? 'Post berhasil di-highlight' 
        : 'Post berhasil dihapus dari highlight',
    });
  } catch (error) {
    console.error('Error updating highlighted status:', error);
    return NextResponse.json(
      { error: 'Failed to update highlighted status' },
      { status: 500 }
    );
  }
}