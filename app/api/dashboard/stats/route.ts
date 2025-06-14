import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Ambil statistik dasar
    const [totalAlumni, totalKegiatan, totalDonasi, alumniAktif] = await Promise.all([
      prisma.alumni.count(),
      prisma.kegiatan.count(),
      prisma.donasi.count(),
      prisma.alumni.count({ where: { status: 'AKTIF' } })
    ]);
    
    // Statistik donasi
    const donasiStats = await prisma.donasi.aggregate({
      _sum: { jumlah: true },
      _count: { id: true },
      where: { status: 'BERHASIL' }
    });
    
    // Alumni per angkatan (5 teratas)
    const alumniPerAngkatan = await prisma.alumni.groupBy({
      by: ['angkatan'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    });
    
    // Kegiatan mendatang
    const kegiatanMendatang = await prisma.kegiatan.count({
      where: {
        tanggal: { gte: new Date() },
        status: 'AKTIF'
      }
    });
    
    // Alumni baru bulan ini
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const alumniBaru = await prisma.alumni.count({
      where: {
        createdAt: { gte: startOfMonth }
      }
    });
    
    // Donasi bulan ini
    const donasiBulanIni = await prisma.donasi.aggregate({
      _sum: { jumlah: true },
      where: {
        tanggal: { gte: startOfMonth },
        status: 'BERHASIL'
      }
    });
    
    // Kegiatan populer (berdasarkan jumlah peserta)
    const kegiatanPopuler = await prisma.kegiatan.findMany({
      include: {
        _count: {
          select: { peserta: true }
        }
      },
      orderBy: {
        peserta: {
          _count: 'desc'
        }
      },
      take: 5
    });
    
    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalAlumni,
          totalKegiatan,
          totalDonasi,
          alumniAktif,
          kegiatanMendatang,
          alumniBaru,
          totalDonasiTerkumpul: donasiStats._sum.jumlah || 0,
          donasiBulanIni: donasiBulanIni._sum.jumlah || 0
        },
        charts: {
          alumniPerAngkatan: alumniPerAngkatan.map(item => ({
            angkatan: item.angkatan.toString(),
            jumlah: item._count.id
          })),
          kegiatanPopuler: kegiatanPopuler.map(kegiatan => ({
            nama: kegiatan.nama,
            peserta: kegiatan._count.peserta,
            tanggal: kegiatan.tanggal
          }))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil statistik dashboard' },
      { status: 500 }
    );
  }
}