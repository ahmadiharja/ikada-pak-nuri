'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Store,
  MapPin,
  Phone,
  FileText,
  Save,
  CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/use-toast'

interface StoreForm {
  name: string
  description: string
  address: string
  whatsappNumber: string
  websiteUrl?: string
  instagramUrl?: string
  facebookUrl?: string
  isActive: boolean
}

export default function CreateStorePage() {
  const [form, setForm] = useState<StoreForm>({
    name: '',
    description: '',
    address: '',
    whatsappNumber: '',
    websiteUrl: '',
    instagramUrl: '',
    facebookUrl: '',
    isActive: true
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false)
  const router = useRouter()

  const handleInputChange = (field: keyof StoreForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!form.name.trim()) {
      newErrors.name = 'Nama toko wajib diisi'
    }

    if (!form.description.trim()) {
      newErrors.description = 'Deskripsi toko wajib diisi'
    }

    if (!form.address.trim()) {
      newErrors.address = 'Alamat toko wajib diisi'
    }

    if (!form.whatsappNumber.trim()) {
      newErrors.whatsappNumber = 'Nomor WhatsApp wajib diisi'
    } else if (!/^\+?[0-9\s\-()]+$/.test(form.whatsappNumber)) {
      newErrors.whatsappNumber = 'Format nomor WhatsApp tidak valid'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast({
        title: "Error",
        description: "Mohon periksa kembali form yang Anda isi",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      const token = localStorage.getItem('alumni_token')
      if (!token) {
        router.push('/alumni-login')
        return
      }

      const response = await fetch('/api/alumni/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      })

      const data = await response.json()

      if (response.ok) {
        // Update alumni data in localStorage to include store
        const storedAlumniData = localStorage.getItem('alumni_data')
        if (storedAlumniData) {
          const alumniData = JSON.parse(storedAlumniData)
          alumniData.store = data.store
          localStorage.setItem('alumni_data', JSON.stringify(alumniData))
        }
        setIsSuccessDialogOpen(true)
      } else {
        toast({
          title: "Error",
          description: data.error || "Gagal membuat etalase toko",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error creating store:', error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat membuat etalase toko",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <AlertDialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <AlertDialogTitle className="text-center text-2xl font-bold">Sukses!</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Etalase toko Anda telah berhasil dibuat. Sekarang Anda dapat mulai menambahkan produk.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => router.push('/alumni/dashboard/products')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Lanjut ke Halaman Produk
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Desktop Layout */}
      <div className="hidden lg:block min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Link href="/alumni/dashboard">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali
                  </Button>
                </Link>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Buat Etalase Toko</h1>
                  <p className="text-sm text-gray-500">Buat etalase toko untuk mulai menjual produk UMKM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Informasi Dasar Toko */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Store className="w-5 h-5 mr-2" />
                    Informasi Dasar Toko
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nama Toko *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={form.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Masukkan nama toko Anda"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="description">Deskripsi Toko *</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Ceritakan tentang toko dan produk yang Anda jual"
                      rows={4}
                      className={errors.description ? 'border-red-500' : ''}
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Informasi Kontak */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="w-5 h-5 mr-2" />
                    Informasi Kontak
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Alamat Toko *</Label>
                    <Textarea
                      id="address"
                      value={form.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Masukkan alamat lengkap toko Anda"
                      rows={3}
                      className={errors.address ? 'border-red-500' : ''}
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>

                  <div>
                    <Label htmlFor="whatsappNumber">Nomor WhatsApp *</Label>
                    <Input
                      id="whatsappNumber"
                      type="tel"
                      value={form.whatsappNumber}
                      onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                      placeholder="Contoh: +628123456789"
                      className={errors.whatsappNumber ? 'border-red-500' : ''}
                    />
                    {errors.whatsappNumber && <p className="text-red-500 text-sm mt-1">{errors.whatsappNumber}</p>}
                  </div>

                  <div>
                    <Label htmlFor="websiteUrl">Website (Opsional)</Label>
                    <Input
                      id="websiteUrl"
                      type="url"
                      value={form.websiteUrl}
                      onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                      placeholder="https://tokosaya.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="instagramUrl">Instagram (Opsional)</Label>
                    <Input
                      id="instagramUrl"
                      type="url"
                      value={form.instagramUrl}
                      onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
                      placeholder="https://instagram.com/tokosaya"
                    />
                  </div>

                  <div>
                    <Label htmlFor="facebookUrl">Facebook (Opsional)</Label>
                    <Input
                      id="facebookUrl"
                      type="url"
                      value={form.facebookUrl}
                      onChange={(e) => handleInputChange('facebookUrl', e.target.value)}
                      placeholder="https://facebook.com/tokosaya"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Pengaturan */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Pengaturan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="isActive">Status Toko</Label>
                      <p className="text-sm text-gray-500">Aktifkan toko untuk mulai menerima pesanan</p>
                    </div>
                    <Switch
                      id="isActive"
                      checked={form.isActive}
                      onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link href="/alumni/dashboard">
                  <Button type="button" variant="outline">
                    Batal
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Menyimpan...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="w-4 h-4 mr-2" />
                      Buat Etalase Toko
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden min-h-screen bg-gray-50">
        {/* Mobile Header with Gradient */}
        <div className="bg-gradient-to-br from-green-600 to-green-700 text-white">
          <div className="flex items-center justify-between p-4 pt-12">
            <div className="flex items-center space-x-3">
              <Link href="/alumni/dashboard">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 p-2">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-bold text-lg text-white">Buat Etalase Toko</h1>
                <p className="text-green-100 text-sm">Mulai jual produk UMKM Anda</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="px-4 pt-6 pb-24">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Informasi Dasar Toko */}
              <div className="bg-white rounded-2xl shadow-sm">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="font-bold text-lg text-gray-800 flex items-center">
                    <Store className="w-5 h-5 mr-2 text-green-600" />
                    Informasi Dasar Toko
                  </h2>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <Label htmlFor="name-mobile" className="text-sm font-medium text-gray-700">Nama Toko *</Label>
                    <Input
                      id="name-mobile"
                      type="text"
                      value={form.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Masukkan nama toko Anda"
                      className={`mt-1 ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-xl`}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="description-mobile" className="text-sm font-medium text-gray-700">Deskripsi Toko *</Label>
                    <Textarea
                      id="description-mobile"
                      value={form.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Ceritakan tentang toko dan produk yang Anda jual"
                      rows={4}
                      className={`mt-1 ${errors.description ? 'border-red-500' : 'border-gray-200'} rounded-xl`}
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                  </div>
                </div>
              </div>

              {/* Informasi Kontak */}
              <div className="bg-white rounded-2xl shadow-sm">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="font-bold text-lg text-gray-800 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-green-600" />
                    Informasi Kontak
                  </h2>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <Label htmlFor="address-mobile" className="text-sm font-medium text-gray-700">Alamat Toko *</Label>
                    <Textarea
                      id="address-mobile"
                      value={form.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Masukkan alamat lengkap toko Anda"
                      rows={3}
                      className={`mt-1 ${errors.address ? 'border-red-500' : 'border-gray-200'} rounded-xl`}
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>

                  <div>
                    <Label htmlFor="whatsappNumber-mobile" className="text-sm font-medium text-gray-700">Nomor WhatsApp *</Label>
                    <Input
                      id="whatsappNumber-mobile"
                      type="tel"
                      value={form.whatsappNumber}
                      onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                      placeholder="Contoh: +628123456789"
                      className={`mt-1 ${errors.whatsappNumber ? 'border-red-500' : 'border-gray-200'} rounded-xl`}
                    />
                    {errors.whatsappNumber && <p className="text-red-500 text-sm mt-1">{errors.whatsappNumber}</p>}
                  </div>

                  <div>
                    <Label htmlFor="websiteUrl-mobile" className="text-sm font-medium text-gray-700">Website (Opsional)</Label>
                    <Input
                      id="websiteUrl-mobile"
                      type="url"
                      value={form.websiteUrl}
                      onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                      placeholder="https://tokosaya.com"
                      className="mt-1 border-gray-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="instagramUrl-mobile" className="text-sm font-medium text-gray-700">Instagram (Opsional)</Label>
                    <Input
                      id="instagramUrl-mobile"
                      type="url"
                      value={form.instagramUrl}
                      onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
                      placeholder="https://instagram.com/tokosaya"
                      className="mt-1 border-gray-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <Label htmlFor="facebookUrl-mobile" className="text-sm font-medium text-gray-700">Facebook (Opsional)</Label>
                    <Input
                      id="facebookUrl-mobile"
                      type="url"
                      value={form.facebookUrl}
                      onChange={(e) => handleInputChange('facebookUrl', e.target.value)}
                      placeholder="https://facebook.com/tokosaya"
                      className="mt-1 border-gray-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Pengaturan */}
              <div className="bg-white rounded-2xl shadow-sm">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="font-bold text-lg text-gray-800 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-green-600" />
                    Pengaturan
                  </h2>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="isActive-mobile" className="text-sm font-medium text-gray-700">Status Toko</Label>
                      <p className="text-sm text-gray-500 mt-1">Aktifkan toko untuk mulai menerima pesanan</p>
                    </div>
                    <Switch
                      id="isActive-mobile"
                      checked={form.isActive}
                      onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Mobile Fixed Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="flex space-x-3">
            <Link href="/alumni/dashboard" className="flex-1">
              <Button type="button" variant="outline" className="w-full rounded-xl">
                Batal
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl"
              onClick={handleSubmit}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Menyimpan...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Save className="w-4 h-4 mr-2" />
                  Buat Etalase Toko
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}