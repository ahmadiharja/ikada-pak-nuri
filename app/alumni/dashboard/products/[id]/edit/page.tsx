'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft,
  Upload,
  X,
  Plus,
  Minus,
  ExternalLink,
  Save,
  Eye,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDescription?: string
  price?: number
  priceMin?: number
  priceMax?: number
  priceText?: string
  categoryId: string
  category: {
    id: string
    name: string
    slug: string
  }
  businessName?: string
  businessType?: string
  location?: string
  images: string[]
  thumbnailImage?: string
  shopeeUrl?: string
  tokopediaUrl?: string
  tiktokUrl?: string
  bukalapakUrl?: string
  lazadaUrl?: string
  blibliUrl?: string
  whatsappNumber?: string
  instagramUrl?: string
  facebookUrl?: string
  websiteUrl?: string
  shippingInfo?: string
  tags: string[]
  isActive: boolean
  isApproved: boolean
  isFeatured: boolean
  viewCount: number
  clickCount: number
  createdAt: string
  updatedAt: string
}

interface ProductForm {
  name: string
  description: string
  shortDescription: string
  categoryId: string
  businessName: string
  businessType: string
  location: string
  priceType: 'single' | 'range' | 'custom'
  price?: number
  priceMin?: number
  priceMax?: number
  priceText?: string
  shopeeUrl: string
  tokopediaUrl: string
  tiktokUrl: string
  bukalapakUrl: string
  lazadaUrl: string
  blibliUrl: string
  whatsappNumber: string
  instagramUrl: string
  facebookUrl: string
  websiteUrl: string
  shippingInfo: string
  tags: string[]
  existingImages: string[]
  newImages: File[]
  isActive: boolean
}

export default function EditProductPage() {
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const [form, setForm] = useState<ProductForm>({
    name: '',
    description: '',
    shortDescription: '',
    categoryId: '',
    businessName: '',
    businessType: '',
    location: '',
    priceType: 'single',
    price: undefined,
    priceMin: undefined,
    priceMax: undefined,
    priceText: '',
    shopeeUrl: '',
    tokopediaUrl: '',
    tiktokUrl: '',
    bukalapakUrl: '',
    lazadaUrl: '',
    blibliUrl: '',
    whatsappNumber: '',
    instagramUrl: '',
    facebookUrl: '',
    websiteUrl: '',
    shippingInfo: '',
    tags: [],
    existingImages: [],
    newImages: [],
    isActive: true
  })

  const [errors, setErrors] = useState<{[key: string]: string}>({})

  useEffect(() => {
    fetchProduct()
    fetchCategories()
  }, [productId])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/alumni/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('alumni_token')}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const product = data.product
        setProduct(product)
        
        // Determine price type
        let priceType: 'single' | 'range' | 'custom' = 'single'
        if (product.priceText) priceType = 'custom'
        else if (product.priceMin && product.priceMax) priceType = 'range'
        
        setForm({
          name: product.name || '',
          description: product.description || '',
          shortDescription: product.shortDescription || '',
          categoryId: product.categoryId || '',
          businessName: product.businessName || '',
          businessType: product.businessType || '',
          location: product.location || '',
          priceType,
          price: product.price,
          priceMin: product.priceMin,
          priceMax: product.priceMax,
          priceText: product.priceText || '',
          shopeeUrl: product.shopeeUrl || '',
          tokopediaUrl: product.tokopediaUrl || '',
          tiktokUrl: product.tiktokUrl || '',
          bukalapakUrl: product.bukalapakUrl || '',
          lazadaUrl: product.lazadaUrl || '',
          blibliUrl: product.blibliUrl || '',
          whatsappNumber: product.whatsappNumber || '',
          instagramUrl: product.instagramUrl || '',
          facebookUrl: product.facebookUrl || '',
          websiteUrl: product.websiteUrl || '',
          shippingInfo: product.shippingInfo || '',
          tags: product.tags || [],
          existingImages: product.images || [],
          newImages: [],
          isActive: product.isActive
        })
      } else {
        throw new Error('Product not found')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      toast({
        title: "Gagal memuat produk",
        description: "Produk tidak ditemukan atau Anda tidak memiliki akses.",
        variant: "destructive"
      })
      router.push('/alumni/dashboard/products')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/products/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleInputChange = (field: keyof ProductForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleNewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const totalImages = form.existingImages.length + form.newImages.length + files.length
    
    if (totalImages > 5) {
      toast({
        title: "Terlalu banyak gambar",
        description: "Maksimal 5 gambar per produk.",
        variant: "destructive"
      })
      return
    }

    const newImages = [...form.newImages, ...files]
    setForm(prev => ({ ...prev, newImages }))

    // Create previews
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setNewImagePreviews(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeExistingImage = (index: number) => {
    const newExistingImages = form.existingImages.filter((_, i) => i !== index)
    setForm(prev => ({ ...prev, existingImages: newExistingImages }))
  }

  const removeNewImage = (index: number) => {
    const newImages = form.newImages.filter((_, i) => i !== index)
    const newPreviews = newImagePreviews.filter((_, i) => i !== index)
    setForm(prev => ({ ...prev, newImages }))
    setNewImagePreviews(newPreviews)
  }

  const addTag = () => {
    if (newTag.trim() && !form.tags.includes(newTag.trim())) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }))
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!form.name.trim()) newErrors.name = 'Nama produk wajib diisi'
    if (!form.description.trim()) newErrors.description = 'Deskripsi produk wajib diisi'
    if (!form.categoryId) newErrors.categoryId = 'Kategori wajib dipilih'
    
    if (form.priceType === 'single' && !form.price) {
      newErrors.price = 'Harga wajib diisi'
    }
    if (form.priceType === 'range') {
      if (!form.priceMin) newErrors.priceMin = 'Harga minimum wajib diisi'
      if (!form.priceMax) newErrors.priceMax = 'Harga maksimum wajib diisi'
      if (form.priceMin && form.priceMax && form.priceMin >= form.priceMax) {
        newErrors.priceMax = 'Harga maksimum harus lebih besar dari minimum'
      }
    }
    if (form.priceType === 'custom' && !form.priceText?.trim()) {
      newErrors.priceText = 'Text harga wajib diisi'
    }

    // Validate at least one marketplace link or contact
    const hasMarketplace = form.shopeeUrl || form.tokopediaUrl || form.tiktokUrl || 
                          form.bukalapakUrl || form.lazadaUrl || form.blibliUrl
    const hasContact = form.whatsappNumber || form.instagramUrl || form.facebookUrl || form.websiteUrl
    
    if (!hasMarketplace && !hasContact) {
      newErrors.contact = 'Minimal satu link marketplace atau kontak harus diisi'
    }

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
      // Upload new images
      const newImageUrls: string[] = []
      
      for (const image of form.newImages) {
        const formData = new FormData()
        formData.append('file', image)
        formData.append('type', 'product')
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          newImageUrls.push(uploadData.url)
        }
      }

      // Combine existing and new images
      const allImages = [...form.existingImages, ...newImageUrls]

      // Update product
      const productData = {
        name: form.name,
        description: form.description,
        shortDescription: form.shortDescription,
        categoryId: form.categoryId,
        businessName: form.businessName || undefined,
        businessType: form.businessType || undefined,
        location: form.location || undefined,
        price: form.priceType === 'single' ? form.price : undefined,
        priceMin: form.priceType === 'range' ? form.priceMin : undefined,
        priceMax: form.priceType === 'range' ? form.priceMax : undefined,
        priceText: form.priceType === 'custom' ? form.priceText : undefined,
        shopeeUrl: form.shopeeUrl || undefined,
        tokopediaUrl: form.tokopediaUrl || undefined,
        tiktokUrl: form.tiktokUrl || undefined,
        bukalapakUrl: form.bukalapakUrl || undefined,
        lazadaUrl: form.lazadaUrl || undefined,
        blibliUrl: form.blibliUrl || undefined,
        whatsappNumber: form.whatsappNumber || undefined,
        instagramUrl: form.instagramUrl || undefined,
        facebookUrl: form.facebookUrl || undefined,
        websiteUrl: form.websiteUrl || undefined,
        shippingInfo: form.shippingInfo || undefined,
        tags: form.tags,
        images: allImages,
        thumbnailImage: allImages[0] || undefined,
        isActive: form.isActive
      }

      const response = await fetch(`/api/alumni/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('alumni_token')}`
        },
        body: JSON.stringify(productData)
      })

      if (response.ok) {
        toast({
          title: "Produk berhasil diperbarui",
          description: "Perubahan produk Anda telah disimpan."
        })
        router.push('/alumni/dashboard/products')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update product')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      toast({
        title: "Gagal memperbarui produk",
        description: "Terjadi kesalahan saat memperbarui produk.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat produk...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Produk tidak ditemukan</p>
          <Link href="/alumni/dashboard/products">
            <Button className="mt-4">Kembali ke Daftar Produk</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/alumni/dashboard/products">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Edit Produk UMKM</h1>
                <p className="text-sm text-gray-500">Perbarui informasi produk Anda</p>
              </div>
            </div>
            <Link href={`/umkm/products/${product.slug}`} target="_blank">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Lihat Produk
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Dasar</CardTitle>
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
                  <Select value={form.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
                    <SelectTrigger className={errors.categoryId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && <p className="text-sm text-red-500 mt-1">{errors.categoryId}</p>}
                </div>
                
                <div>
                  <Label htmlFor="location">Lokasi</Label>
                  <Input
                    id="location"
                    value={form.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Kota/Kabupaten"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="shortDescription">Deskripsi Singkat</Label>
                <Textarea
                  id="shortDescription"
                  value={form.shortDescription}
                  onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                  placeholder="Deskripsi singkat untuk ditampilkan di card produk"
                  rows={2}
                />
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

          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Usaha</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="businessName">Nama Usaha/Brand</Label>
                  <Input
                    id="businessName"
                    value={form.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    placeholder="Nama usaha atau brand"
                  />
                </div>
                
                <div>
                  <Label htmlFor="businessType">Jenis Usaha</Label>
                  <Input
                    id="businessType"
                    value={form.businessType}
                    onChange={(e) => handleInputChange('businessType', e.target.value)}
                    placeholder="Contoh: Makanan, Fashion, Kerajinan"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="shippingInfo">Informasi Pengiriman</Label>
                <Textarea
                  id="shippingInfo"
                  value={form.shippingInfo}
                  onChange={(e) => handleInputChange('shippingInfo', e.target.value)}
                  placeholder="Informasi tentang pengiriman, ongkir, dll"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Harga</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Tipe Harga *</Label>
                <Select value={form.priceType} onValueChange={(value: 'single' | 'range' | 'custom') => handleInputChange('priceType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Harga Tunggal</SelectItem>
                    <SelectItem value="range">Range Harga</SelectItem>
                    <SelectItem value="custom">Custom Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {form.priceType === 'single' && (
                <div>
                  <Label htmlFor="price">Harga (Rp) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={form.price || ''}
                    onChange={(e) => handleInputChange('price', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="0"
                    className={errors.price ? 'border-red-500' : ''}
                  />
                  {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
                </div>
              )}
              
              {form.priceType === 'range' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priceMin">Harga Minimum (Rp) *</Label>
                    <Input
                      id="priceMin"
                      type="number"
                      value={form.priceMin || ''}
                      onChange={(e) => handleInputChange('priceMin', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="0"
                      className={errors.priceMin ? 'border-red-500' : ''}
                    />
                    {errors.priceMin && <p className="text-sm text-red-500 mt-1">{errors.priceMin}</p>}
                  </div>
                  <div>
                    <Label htmlFor="priceMax">Harga Maksimum (Rp) *</Label>
                    <Input
                      id="priceMax"
                      type="number"
                      value={form.priceMax || ''}
                      onChange={(e) => handleInputChange('priceMax', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="0"
                      className={errors.priceMax ? 'border-red-500' : ''}
                    />
                    {errors.priceMax && <p className="text-sm text-red-500 mt-1">{errors.priceMax}</p>}
                  </div>
                </div>
              )}
              
              {form.priceType === 'custom' && (
                <div>
                  <Label htmlFor="priceText">Text Harga *</Label>
                  <Input
                    id="priceText"
                    value={form.priceText || ''}
                    onChange={(e) => handleInputChange('priceText', e.target.value)}
                    placeholder="Contoh: Mulai dari 50rb, Nego, Hubungi untuk harga"
                    className={errors.priceText ? 'border-red-500' : ''}
                  />
                  {errors.priceText && <p className="text-sm text-red-500 mt-1">{errors.priceText}</p>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Gambar Produk</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Existing Images */}
              {form.existingImages.length > 0 && (
                <div>
                  <Label>Gambar Saat Ini</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-2">
                    {form.existingImages.map((image, index) => (
                      <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img src={image} alt={`Existing ${index + 1}`} className="w-full h-full object-cover" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0"
                          onClick={() => removeExistingImage(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                        {index === 0 && (
                          <Badge className="absolute bottom-2 left-2 text-xs">Utama</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Upload New Images */}
              <div>
                <Label htmlFor="newImages">Tambah Gambar Baru (Maksimal 5 total)</Label>
                <div className="mt-2">
                  <input
                    id="newImages"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleNewImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('newImages')?.click()}
                    disabled={form.existingImages.length + form.newImages.length >= 5}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Gambar Baru
                  </Button>
                </div>
              </div>
              
              {/* New Image Previews */}
              {newImagePreviews.length > 0 && (
                <div>
                  <Label>Gambar Baru</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-2">
                    {newImagePreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img src={preview} alt={`New ${index + 1}`} className="w-full h-full object-cover" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0"
                          onClick={() => removeNewImage(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                        <Badge variant="secondary" className="absolute bottom-2 left-2 text-xs">Baru</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Marketplace Links */}
          <Card>
            <CardHeader>
              <CardTitle>Link Marketplace & Kontak</CardTitle>
              <p className="text-sm text-gray-600">Minimal satu link marketplace atau kontak harus diisi</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                
                <div>
                  <Label htmlFor="bukalapakUrl">Link Bukalapak</Label>
                  <Input
                    id="bukalapakUrl"
                    value={form.bukalapakUrl}
                    onChange={(e) => handleInputChange('bukalapakUrl', e.target.value)}
                    placeholder="https://bukalapak.com/..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="lazadaUrl">Link Lazada</Label>
                  <Input
                    id="lazadaUrl"
                    value={form.lazadaUrl}
                    onChange={(e) => handleInputChange('lazadaUrl', e.target.value)}
                    placeholder="https://lazada.co.id/..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="blibliUrl">Link Blibli</Label>
                  <Input
                    id="blibliUrl"
                    value={form.blibliUrl}
                    onChange={(e) => handleInputChange('blibliUrl', e.target.value)}
                    placeholder="https://blibli.com/..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="whatsappNumber">Nomor WhatsApp</Label>
                  <Input
                    id="whatsappNumber"
                    value={form.whatsappNumber}
                    onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                    placeholder="628123456789"
                  />
                </div>
                
                <div>
                  <Label htmlFor="instagramUrl">Link Instagram</Label>
                  <Input
                    id="instagramUrl"
                    value={form.instagramUrl}
                    onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="facebookUrl">Link Facebook</Label>
                  <Input
                    id="facebookUrl"
                    value={form.facebookUrl}
                    onChange={(e) => handleInputChange('facebookUrl', e.target.value)}
                    placeholder="https://facebook.com/..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="websiteUrl">Website</Label>
                  <Input
                    id="websiteUrl"
                    value={form.websiteUrl}
                    onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                    placeholder="https://website.com"
                  />
                </div>
              </div>
              
              {errors.contact && <p className="text-sm text-red-500">{errors.contact}</p>}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Tambah tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan</CardTitle>
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
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Perubahan
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}