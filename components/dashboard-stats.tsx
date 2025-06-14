'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, DollarSign, TrendingUp, UserPlus, Activity } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardStats {
  overview: {
    totalAlumni: number;
    totalKegiatan: number;
    totalDonasi: number;
    alumniAktif: number;
    kegiatanMendatang: number;
    alumniBaru: number;
    totalDonasiTerkumpul: number;
    donasiBulanIni: number;
  };
  charts: {
    alumniPerAngkatan: Array<{ angkatan: string; jumlah: number }>;
    kegiatanPopuler: Array<{ nama: string; peserta: number; tanggal: string }>;
  };
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/stats');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      } else {
        setError(result.error || 'Gagal mengambil data statistik');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mengambil data');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px] mb-2" />
              <Skeleton className="h-3 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            <p>{error}</p>
            <button 
              onClick={fetchStats}
              className="mt-2 text-sm text-blue-500 hover:underline"
            >
              Coba lagi
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: "Total Alumni",
      value: stats.overview.totalAlumni.toLocaleString(),
      description: `${stats.overview.alumniAktif} alumni aktif`,
      icon: Users,
      trend: "+2.1% dari bulan lalu"
    },
    {
      title: "Alumni Baru",
      value: stats.overview.alumniBaru.toLocaleString(),
      description: "Bulan ini",
      icon: UserPlus,
      trend: "Pendaftaran terbaru"
    },
    {
      title: "Total Kegiatan",
      value: stats.overview.totalKegiatan.toLocaleString(),
      description: `${stats.overview.kegiatanMendatang} kegiatan mendatang`,
      icon: Calendar,
      trend: "Kegiatan aktif"
    },
    {
      title: "Total Donasi",
      value: formatCurrency(stats.overview.totalDonasiTerkumpul),
      description: `${formatCurrency(stats.overview.donasiBulanIni)} bulan ini`,
      icon: DollarSign,
      trend: "+12.5% dari bulan lalu"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {card.trend}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Alumni per Angkatan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Alumni per Angkatan
            </CardTitle>
            <CardDescription>
              5 angkatan dengan alumni terbanyak
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.charts.alumniPerAngkatan.map((item, index) => (
                <div key={item.angkatan} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <span className="font-medium">Angkatan {item.angkatan}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(item.jumlah / Math.max(...stats.charts.alumniPerAngkatan.map(a => a.jumlah))) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">
                      {item.jumlah}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Kegiatan Populer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Kegiatan Populer
            </CardTitle>
            <CardDescription>
              Berdasarkan jumlah peserta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.charts.kegiatanPopuler.map((kegiatan, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm truncate">{kegiatan.nama}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(kegiatan.tanggal).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {kegiatan.peserta} peserta
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}