'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  ExternalLink,
  MapPin,
  Calendar,
  Tag,
  Store,
  Phone,
  Globe,
  MessageCircle,
  Instagram,
  Facebook,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreHorizontal
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/components/ui/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
    color: string
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
  alumni: {
    id: string
    name: string
    email: string
  }
}

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  useEffect(() => {
    fetchProduct()
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
        setProduct(data.product)
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

  const handleDelete = async () => {
    if (!product) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/alumni/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('alumni_token')}`
        }
      })

      if (response.ok) {
        toast({
          title: "Produk berhasil dihapus",
          description: "Produk telah dihapus dari etalase UMKM."
        })
        router.push('/alumni/dashboard/products')
      } else {
        throw new Error('Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      toast({
        title: "Gagal menghapus produk",
        description: "Terjadi kesalahan saat menghapus produk.",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleProductStatus = async () => {
    if (!product) return
    
    try {
      const response = await fetch(`/api/alumni/products/${productId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('alumni_token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProduct(prev => prev ? { ...prev, isActive: data.isActive } : null)
        toast({
          title: data.isActive ? "Produk diaktifkan" : "Produk dinonaktifkan",
          description: data.isActive ? "Produk akan ditampilkan di etalase." : "Produk disembunyikan dari etalase."
        })
      } else {
        throw new Error('Failed to toggle status')
      }
    } catch (error) {
      console.error('Error toggling status:', error)
      toast({
        title: "Gagal mengubah status",
        description: "Terjadi kesalahan saat mengubah status produk.",
        variant: "destructive"
      })
    }
  }

  const formatPrice = (product: Product) => {
    if (product.priceText) return product.priceText
    if (product.priceMin && product.priceMax) {
      return `Rp ${product.priceMin.toLocaleString('id-ID')} - Rp ${product.priceMax.toLocaleString('id-ID')}`
    }
    if (product.price) {
      return `Rp ${product.price.toLocaleString('id-ID')}`
    }
    return 'Hubungi untuk harga'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (product: Product) => {
    if (!product.isActive) {
      return <Badge variant="secondary" className="flex items-center gap-1"><EyeOff className="w-3 h-3" />Tidak Aktif</Badge>
    }
    if (!product.isApproved) {
      return <Badge variant="outline" className="flex items-center gap-1 text-yellow-600 border-yellow-600"><Clock className="w-3 h-3" />Menunggu Persetujuan</Badge>
    }
    return <Badge variant="default" className="flex items-center gap-1 bg-green-600"><CheckCircle className="w-3 h-3" />Aktif</Badge>
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
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/alumni/dashboard/products">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusBadge(product)}
                  <Badge variant="outline" style={{ backgroundColor: product.category.color + '20', color: product.category.color, borderColor: product.category.color }}>
                    {product.category.name}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link href={`/umkm/products/${product.slug}`} target="_blank">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Lihat di Etalase
                </Button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={toggleProductStatus}>
                    {product.isActive ? (
                      <><EyeOff className="w-4 h-4 mr-2" />Nonaktifkan</>
                    ) : (
                      <><Eye className="w-4 h-4 mr-2" />Aktifkan</>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/alumni/dashboard/products/${productId}/edit`}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Produk
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" asChild>
                    <AlertDialog>
                      <AlertDialogTrigger className="flex items-center w-full px-2 py-1.5 text-sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Hapus Produk
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
                          <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus produk "{product.name}"? 
                            Tindakan ini tidak dapat dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {isDeleting ? (
                              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Menghapus...</>
                            ) : (
                              'Hapus'
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Basic Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <Card>
              <CardContent className="p-6">
                {product.images.length > 0 ? (
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={product.images[selectedImageIndex]} 
                        alt={product.name}
                        className="w-full h-full object-contain bg-gray-100"
                      />
                    </div>
                    
                    {/* Thumbnail Images */}
                    {product.images.length > 1 && (
                      <div className="grid grid-cols-5 gap-2">
                        {product.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors ${
                              selectedImageIndex === index ? 'border-green-600' : 'border-transparent hover:border-gray-300'
                            }`}
                          >
                            <img 
                              src={image} 
                              alt={`${product.name} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Store className="w-12 h-12 mx-auto mb-2" />
                      <p>Tidak ada gambar</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Deskripsi Produk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700">{product.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Info */}
            {product.shippingInfo && (
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Pengiriman</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{product.shippingInfo}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Product Details */}
          <div className="space-y-6">
            {/* Price and Basic Info */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
                    {product.shortDescription && (
                      <p className="text-gray-600 mt-1">{product.shortDescription}</p>
                    )}
                  </div>
                  
                  <div className="text-2xl font-bold text-green-600">
                    {formatPrice(product)}
                  </div>
                  
                  {product.businessName && (
                    <div className="flex items-center text-gray-600">
                      <Store className="w-4 h-4 mr-2" />
                      <span>{product.businessName}</span>
                      {product.businessType && (
                        <span className="ml-2 text-sm">({product.businessType})</span>
                      )}
                    </div>
                  )}
                  
                  {product.location && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{product.location}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Marketplace Links */}
            <Card>
              <CardHeader>
                <CardTitle>Link Pembelian</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {product.shopeeUrl && (
                  <a href={product.shopeeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white text-xs font-bold">S</span>
                      </div>
                      <span className="font-medium">Shopee</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                )}
                
                {product.tokopediaUrl && (
                  <a href={product.tokopediaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white text-xs font-bold">T</span>
                      </div>
                      <span className="font-medium">Tokopedia</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                )}
                
                {product.tiktokUrl && (
                  <a href={product.tiktokUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-black rounded flex items-center justify-center mr-3">
                        <span className="text-white text-xs font-bold">TT</span>
                      </div>
                      <span className="font-medium">TikTok Shop</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                )}
                
                {product.bukalapakUrl && (
                  <a href={product.bukalapakUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white text-xs font-bold">B</span>
                      </div>
                      <span className="font-medium">Bukalapak</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                )}
                
                {product.lazadaUrl && (
                  <a href={product.lazadaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-3">
                        <span className="text-white text-xs font-bold">L</span>
                      </div>
                      <span className="font-medium">Lazada</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                )}
                
                {product.blibliUrl && (
                  <a href={product.blibliUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center mr-3">
                        <span className="text-white text-xs font-bold">BL</span>
                      </div>
                      <span className="font-medium">Blibli</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Contact */}
            {(product.whatsappNumber || product.instagramUrl || product.facebookUrl || product.websiteUrl) && (
              <Card>
                <CardHeader>
                  <CardTitle>Kontak</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {product.whatsappNumber && (
                    <a href={`https://wa.me/${product.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        <MessageCircle className="w-5 h-5 text-green-600 mr-3" />
                        <span className="font-medium">WhatsApp</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </a>
                  )}
                  
                  {product.instagramUrl && (
                    <a href={product.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        <Instagram className="w-5 h-5 text-pink-600 mr-3" />
                        <span className="font-medium">Instagram</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </a>
                  )}
                  
                  {product.facebookUrl && (
                    <a href={product.facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        <Facebook className="w-5 h-5 text-blue-600 mr-3" />
                        <span className="font-medium">Facebook</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </a>
                  )}
                  
                  {product.websiteUrl && (
                    <a href={product.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        <Globe className="w-5 h-5 text-gray-600 mr-3" />
                        <span className="font-medium">Website</span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {product.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Statistik</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Dilihat</span>
                  <span className="font-medium">{product.viewCount.toLocaleString('id-ID')} kali</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Diklik</span>
                  <span className="font-medium">{product.clickCount.toLocaleString('id-ID')} kali</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Dibuat</span>
                  <span>{formatDate(product.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Diperbarui</span>
                  <span>{formatDate(product.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}