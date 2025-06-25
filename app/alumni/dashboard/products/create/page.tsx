'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft,
  Upload,
  X,
  Plus,
  Save,
  Eye,
  Image as ImageIcon,
  Package,
  DollarSign,
  Globe,
  Settings,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CategorySelector } from '@/components/ui/category-selector'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'

interface ProductCategory {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color: string
}

interface ProductForm {
  name: string;
  description: string;
  categoryId: string;
  price: string;
  unit: string;
  shopeeUrl: string;
  tokopediaUrl: string;
  tiktokUrl: string;
  shippedFromCity: string;
  images: File[];
  isActive: boolean;
}

export default function CreateProductPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()

  const [form, setForm] = useState<ProductForm>({
    name: '',
    description: '',
    categoryId: '',
    price: '',
    unit: '',
    shopeeUrl: '',
    tokopediaUrl: '',
    tiktokUrl: '',
    shippedFromCity: '',
    images: [],
    isActive: true
  })

  const [errors, setErrors] = useState<{[key: string]: string}>({})

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
      fetchCategories()
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/products/categories?hierarchical=true')
      if (response.ok) {
        const data = await response.json()
        const categoriesArray = Array.isArray(data) ? data : []
        setCategories(categoriesArray)
      } else {
        console.error('Failed to fetch categories:', response.status, response.statusText)
        toast({
          title: "Error",
          description: "Gagal memuat kategori produk",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast({
        title: "Error",
        description: "Gagal memuat kategori produk",
        variant: "destructive"
      })
    }
  }

  const handleInputChange = (field: keyof ProductForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + form.images.length > 5) {
      toast({
        title: "Terlalu banyak gambar",
        description: "Maksimal 5 gambar per produk.",
        variant: "destructive"
      })
      return
    }

    const newImages = [...form.images, ...files]
    setForm(prev => ({ ...prev, images: newImages }))

    // Create previews
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    const newImages = form.images.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setForm(prev => ({ ...prev, images: newImages }))
    setImagePreviews(newPreviews)
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!form.name.trim()) newErrors.name = 'Nama produk wajib diisi'
    if (!form.description.trim()) newErrors.description = 'Deskripsi produk wajib diisi'
    if (!form.categoryId) newErrors.categoryId = 'Kategori wajib dipilih'
    if (form.price && isNaN(parseFloat(form.price))) newErrors.price = 'Harga harus berupa angka yang valid'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast({
        title: "Form tidak valid",
        description: "Mohon periksa kembali data yang Anda masukkan.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Upload images first
      const imageUrls: string[] = []
      
      for (const image of form.images) {
        const formData = new FormData()
        formData.append('file', image)
        formData.append('type', 'product')
        
        const uploadResponse = await fetch('/api/upload/product', {
          method: 'POST',
          body: formData
        })
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          if (uploadData.success) {
            imageUrls.push(uploadData.url)
          }
        } else {
          console.error('Failed to upload image:', await uploadResponse.text())
          toast({
            title: "Error Upload",
            description: "Gagal mengupload gambar produk",
            variant: "destructive"
          })
        }
      }

      // Create product
      const productData = {
        name: form.name,
        description: form.description,
        categoryId: form.categoryId,
        price: form.price ? parseFloat(form.price) : null,
        unit: form.unit || null,
        shopeeUrl: form.shopeeUrl || null,
        tokopediaUrl: form.tokopediaUrl || null,
        tiktokUrl: form.tiktokUrl || null,
        shippedFromCity: form.shippedFromCity || null,
        images: imageUrls,
        isActive: form.isActive
      }

      const response = await fetch('/api/alumni/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('alumni_token')}`
        },
        body: JSON.stringify(productData)
      })

      if (response.ok) {
        toast({
          title: "Produk berhasil ditambahkan",
          description: "Produk Anda telah ditambahkan ke etalase UMKM."
        })
        router.push('/alumni/dashboard/products')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create product')
      }
    } catch (error) {
      console.error('Error creating product:', error)
      toast({
        title: "Gagal menambahkan produk",
        description: "Terjadi kesalahan saat menambahkan produk.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
  return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  const renderDesktopView = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
                <Link href="/alumni/dashboard/products">
            <Button variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali
                  </Button>
                </Link>
                <div>
            <h1 className="text-2xl font-bold text-gray-900">Tambah Produk Baru</h1>
            <p className="text-gray-600">Lengkapi informasi produk untuk ditambahkan ke etalase UMKM</p>
            </div>
          </div>
        </div>

      <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" />
              Informasi Dasar
            </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="name">Nama Produk *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Masukkan nama produk"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                </div>
                
                <div>
                  <Label htmlFor="category">Kategori *</Label>
                  <CategorySelector
                    categories={categories}
                    value={form.categoryId}
                    onValueChange={(value) => handleInputChange('categoryId', value)}
                    placeholder="Pilih kategori..."
                    className={errors.categoryId ? 'border-red-500' : ''}
                  />
                  {errors.categoryId && <p className="text-sm text-red-500 mt-1">{errors.categoryId}</p>}
                </div>
                
                <div>
                  <Label htmlFor="shippedFromCity">Dikirim dari Kota</Label>
                  <Input
                    id="shippedFromCity"
                    value={form.shippedFromCity}
                    onChange={(e) => handleInputChange('shippedFromCity', e.target.value)}
                    placeholder="Kota pengiriman"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Deskripsi Lengkap *</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Deskripsi lengkap produk"
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Information */}
          <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Informasi Harga
            </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="price">Harga</Label>
                  <Input
                    id="price"
                    type="number"
                    value={form.price || ''}
                    onChange={(e) => handleInputChange('price', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Harga produk"
                  />
                </div>
                
                <div>
                  <Label htmlFor="unit">Satuan</Label>
                  <Input
                    id="unit"
                    value={form.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    placeholder="Contoh: kg, pcs, meter, liter"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-green-600" />
              Gambar Produk
            </CardTitle>
            <p className="text-sm text-gray-600">Upload maksimal 5 gambar produk</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                  <input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('images')?.click()}
                    disabled={form.images.length >= 5}
                className="w-full h-32 border-dashed border-2 border-gray-300 hover:border-green-500 hover:bg-green-50"
              >
                <div className="flex flex-col items-center">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Upload Gambar</span>
                  <span className="text-xs text-gray-500">PNG, JPG hingga 10MB</span>
                </div>
              </Button>
              </div>
              
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      {index === 0 && (
                      <Badge className="absolute bottom-2 left-2 text-xs bg-green-600">Utama</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Marketplace Links */}
          <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-600" />
              Link Marketplace
            </CardTitle>
              <p className="text-sm text-gray-600">Opsional - Link ke produk di marketplace</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="shopeeUrl">Link Shopee</Label>
                  <Input
                    id="shopeeUrl"
                    value={form.shopeeUrl}
                    onChange={(e) => handleInputChange('shopeeUrl', e.target.value)}
                    placeholder="https://shopee.co.id/..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="tokopediaUrl">Link Tokopedia</Label>
                  <Input
                    id="tokopediaUrl"
                    value={form.tokopediaUrl}
                    onChange={(e) => handleInputChange('tokopediaUrl', e.target.value)}
                    placeholder="https://tokopedia.com/..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="tiktokUrl">Link TikTok Shop</Label>
                  <Input
                    id="tiktokUrl"
                    value={form.tiktokUrl}
                    onChange={(e) => handleInputChange('tiktokUrl', e.target.value)}
                    placeholder="https://shop.tiktok.com/..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-green-600" />
              Pengaturan
            </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isActive">Aktifkan Produk</Label>
                  <p className="text-sm text-gray-600">Produk akan ditampilkan di etalase UMKM</p>
                </div>
                <Switch
                  id="isActive"
                  checked={form.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Link href="/alumni/dashboard/products">
              <Button type="button" variant="outline">
                Batal
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700">
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Produk
                </>
              )}
            </Button>
          </div>
        </form>
          </div>
  )

  const renderMobileView = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
                <Link href="/alumni/dashboard/products">
          <Button variant="ghost" size="sm" className="p-2">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
                <div>
          <h1 className="text-lg font-bold text-gray-900">Tambah Produk</h1>
          <p className="text-sm text-gray-600">Produk UMKM baru</p>
          </div>
        </div>

      <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="w-4 h-4 text-green-600" />
              Informasi Dasar
            </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
              <Label htmlFor="name-mobile" className="text-sm font-medium">Nama Produk *</Label>
                  <Input
                    id="name-mobile"
                    value={form.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Masukkan nama produk"
                className={`mt-1 ${errors.name ? 'border-red-500' : ''}`}
                  />
                  {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                </div>
                
                <div>
              <Label htmlFor="category-mobile" className="text-sm font-medium">Kategori *</Label>
                  <CategorySelector
                    categories={categories}
                    value={form.categoryId}
                    onValueChange={(value) => handleInputChange('categoryId', value)}
                    placeholder="Pilih kategori..."
                className={`mt-1 ${errors.categoryId ? 'border-red-500' : ''}`}
                  />
                  {errors.categoryId && <p className="text-sm text-red-500 mt-1">{errors.categoryId}</p>}
                </div>
                
                <div>
              <Label htmlFor="shippedFromCity-mobile" className="text-sm font-medium">Kota Pengiriman</Label>
                  <Input
                    id="shippedFromCity-mobile"
                    value={form.shippedFromCity}
                    onChange={(e) => handleInputChange('shippedFromCity', e.target.value)}
                    placeholder="Kota asal pengiriman"
                className="mt-1"
                  />
                </div>
                
                <div>
              <Label htmlFor="description-mobile" className="text-sm font-medium">Deskripsi Lengkap *</Label>
                  <Textarea
                    id="description-mobile"
                    value={form.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Deskripsi lengkap produk"
                    rows={3}
                className={`mt-1 ${errors.description ? 'border-red-500' : ''}`}
                  />
                  {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Pricing Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="w-4 h-4 text-green-600" />
              Informasi Harga
            </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
              <Label htmlFor="price-mobile" className="text-sm font-medium">Harga (Rp)</Label>
                  <Input
                    id="price-mobile"
                    type="number"
                    value={form.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0"
                className={`mt-1 ${errors.price ? 'border-red-500' : ''}`}
                  />
                  {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
                </div>
                
                <div>
              <Label htmlFor="unit-mobile" className="text-sm font-medium">Satuan</Label>
                  <Input
                    id="unit-mobile"
                    value={form.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    placeholder="Contoh: pcs, kg, meter, dll"
                className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Image Upload */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ImageIcon className="w-4 h-4 text-green-600" />
              Foto Produk
            </CardTitle>
                <p className="text-sm text-gray-600">Upload maksimal 5 foto produk</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload-mobile"
                  />
                  <label
                    htmlFor="image-upload-mobile"
                className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-green-50 hover:border-green-500 transition-colors"
                  >
                <Upload className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-sm text-gray-600 font-medium">Pilih Foto</span>
                    <span className="text-xs text-gray-500">PNG, JPG hingga 10MB</span>
                  </label>
                </div>
                
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                    {index === 0 && (
                      <Badge className="absolute bottom-1 left-1 text-xs bg-green-600">Utama</Badge>
                    )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Marketplace Links */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="w-4 h-4 text-green-600" />
              Link Marketplace
            </CardTitle>
                <p className="text-sm text-gray-600">Opsional - Tambahkan link produk di marketplace</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
              <Label htmlFor="shopeeUrl-mobile" className="text-sm font-medium">Link Shopee</Label>
                  <Input
                    id="shopeeUrl-mobile"
                    value={form.shopeeUrl}
                    onChange={(e) => handleInputChange('shopeeUrl', e.target.value)}
                    placeholder="https://shopee.co.id/..."
                className="mt-1"
                  />
                </div>
                
                <div>
              <Label htmlFor="tokopediaUrl-mobile" className="text-sm font-medium">Link Tokopedia</Label>
                  <Input
                    id="tokopediaUrl-mobile"
                    value={form.tokopediaUrl}
                    onChange={(e) => handleInputChange('tokopediaUrl', e.target.value)}
                    placeholder="https://tokopedia.com/..."
                className="mt-1"
                  />
                </div>
                
                <div>
              <Label htmlFor="tiktokUrl-mobile" className="text-sm font-medium">Link TikTok Shop</Label>
                  <Input
                    id="tiktokUrl-mobile"
                    value={form.tiktokUrl}
                    onChange={(e) => handleInputChange('tiktokUrl', e.target.value)}
                    placeholder="https://shop.tiktok.com/..."
                className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="w-4 h-4 text-green-600" />
              Pengaturan
            </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                <Label className="text-sm font-medium">Aktifkan Produk</Label>
                    <p className="text-xs text-gray-500">Produk akan ditampilkan di halaman UMKM</p>
                  </div>
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
        <div className="flex flex-col space-y-3 pb-20">
              <Button type="submit" disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-700 text-white py-3">
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Simpan Produk
                  </>
                )}
              </Button>
              <Link href="/alumni/dashboard/products">
            <Button type="button" variant="outline" className="w-full">
                  Batal
                </Button>
              </Link>
            </div>
          </form>
    </div>
  )

  return isMobile ? renderMobileView() : renderDesktopView()
}