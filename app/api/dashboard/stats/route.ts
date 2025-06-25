import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Ambil statistik dasar sesuai schema Prisma
    const [alumniCount, eventsCount, umkmCount, postsCount] = await Promise.all([
      prisma.alumni.count(),
      prisma.event.count(),
      prisma.alumniStore.count(),
      prisma.post.count({ where: { status: 'APPROVED' } })
    ]);
    
    // Alumni terverifikasi
    const verifiedAlumniCount = await prisma.alumni.count({
      where: { status: 'VERIFIED' }
    });
    
    // Events yang akan datang
    const upcomingEventsCount = await prisma.event.count({
      where: {
        date: { gte: new Date() },
        status: 'PUBLISHED'
      }
    });
    
    // Alumni baru bulan ini
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const newAlumniThisMonth = await prisma.alumni.count({
      where: {
        createdAt: { gte: startOfMonth }
      }
    });
    
    // Posts baru bulan ini
    const newPostsThisMonth = await prisma.post.count({
      where: {
        createdAt: { gte: startOfMonth },
        status: 'APPROVED'
      }
    });
    
    return NextResponse.json({
      success: true,
      alumniCount,
      eventsCount,
      umkmCount,
      postsCount,
      verifiedAlumniCount,
      upcomingEventsCount,
      newAlumniThisMonth,
      newPostsThisMonth
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil statistik dashboard' },
      { status: 500 }
    );
  }
}