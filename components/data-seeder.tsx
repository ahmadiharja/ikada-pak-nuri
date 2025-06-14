'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SeedResult {
  success: boolean;
  message: string;
  data?: {
    alumni: number;
    kegiatan: number;
    donasi: number;
    kegiatanAlumni: number;
    berita: number;
  };
  error?: string;
}

export function DataSeeder() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);

  const seedData = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'Gagal melakukan seeding data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Seeder
        </CardTitle>
        <CardDescription>
          Buat data sample untuk testing dashboard (Hati-hati: akan menghapus data existing!)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {result && (
          <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                {result.message}
                {result.error && (
                  <div className="mt-1 text-sm">
                    Error: {result.error}
                  </div>
                )}
              </AlertDescription>
            </div>
          </Alert>
        )}
        
        {result?.success && result.data && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <div className="text-center">
              <Badge variant="outline" className="w-full">
                {result.data.alumni} Alumni
              </Badge>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="w-full">
                {result.data.kegiatan} Kegiatan
              </Badge>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="w-full">
                {result.data.donasi} Donasi
              </Badge>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="w-full">
                {result.data.kegiatanAlumni} Peserta
              </Badge>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="w-full">
                {result.data.berita} Berita
              </Badge>
            </div>
          </div>
        )}
        
        <Button 
          onClick={seedData} 
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Membuat Data Sample...
            </>
          ) : (
            <>
              <Database className="h-4 w-4 mr-2" />
              Buat Data Sample
            </>
          )}
        </Button>
        
        <div className="text-xs text-muted-foreground">
          <strong>Peringatan:</strong> Operasi ini akan menghapus semua data existing dan menggantinya dengan data sample.
          Hanya gunakan untuk development/testing.
        </div>
      </CardContent>
    </Card>
  );
}