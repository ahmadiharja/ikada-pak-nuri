'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, Loader2, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';

interface CreateSuperAdminResult {
  success: boolean;
  message: string;
  data?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  errors?: any[];
}

interface SuperAdminStatus {
  success: boolean;
  hasSuperAdmin: boolean;
  count: number;
}

export function CreateSuperAdmin() {
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [result, setResult] = useState<CreateSuperAdminResult | null>(null);
  const [status, setStatus] = useState<SuperAdminStatus | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const checkSuperAdminStatus = async () => {
    setCheckingStatus(true);
    try {
      const response = await fetch('/api/create-superadmin');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error checking superadmin status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const createSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/create-superadmin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        setFormData({ email: '', password: '', name: '' });
        // Refresh status after successful creation
        checkSuperAdminStatus();
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Gagal membuat superadmin',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Buat Akun Superadmin
        </CardTitle>
        <CardDescription>
          Buat akun superadmin untuk mengelola sistem IKADA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Check */}
        <div className="flex items-center gap-2">
          <Button 
            onClick={checkSuperAdminStatus} 
            disabled={checkingStatus}
            variant="outline"
            size="sm"
          >
            {checkingStatus ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Cek Status Superadmin
          </Button>
        </div>

        {status && (
          <Alert className={status.hasSuperAdmin ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
            <div className="flex items-center gap-2">
              {status.hasSuperAdmin ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              )}
              <AlertDescription className={status.hasSuperAdmin ? 'text-green-800' : 'text-yellow-800'}>
                {status.hasSuperAdmin 
                  ? `Sudah ada ${status.count} superadmin di sistem`
                  : 'Belum ada superadmin di sistem'
                }
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Result Alert */}
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
                {result.errors && (
                  <div className="mt-1 text-sm">
                    {result.errors.map((error, index) => (
                      <div key={index}>{error.message}</div>
                    ))}
                  </div>
                )}
                {result.success && result.data && (
                  <div className="mt-2 text-sm">
                    <strong>Email:</strong> {result.data.email}<br/>
                    <strong>Nama:</strong> {result.data.name}<br/>
                    <strong>Role:</strong> {result.data.role}
                  </div>
                )}
              </AlertDescription>
            </div>
          </Alert>
        )}
        
        {/* Form */}
        <form onSubmit={createSuperAdmin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Masukkan nama lengkap"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="admin@ikada.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Minimal 8 karakter"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Membuat Superadmin...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Buat Superadmin
              </>
            )}
          </Button>
        </form>
        
        <div className="text-xs text-muted-foreground">
          <strong>Catatan:</strong> Superadmin memiliki akses penuh ke sistem dan dapat mengelola semua data.
        </div>
      </CardContent>
    </Card>
  );
}