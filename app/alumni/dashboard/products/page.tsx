'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Plus,
  Trash2,
  Edit,
  Eye,
  Search,
  Grid3X3,
  List,
  Store,
  MapPin,
  Phone,
  ShoppingBag,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Product {
  id: string
  name: string
  description: string
  price: number
  slug: string
  thumbnailImage?: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  category?: {
    id: string
    name: string
  }
  createdAt: string
}

interface ProductCategory {
  id: string
  name: string
}

interface StoreInfo {
  id: string
  name: string
  description?: string
  logo?: string
  address?: string
  whatsappNumber?: string
  isVerified: boolean
}

export default function AlumniProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)

    fetchStoreInfo()
      fetchProducts()
      fetchCategories()
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const fetchStoreInfo = async () => {
    try {
      const token = localStorage.getItem('alumni_token')
      if (!token) {
        router.push('/alumni-login')
        return
      }

      const response = await fetch('/api/alumni/store', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStoreInfo(data.store)
      }
    } catch (error) {
      console.error('Error fetching store info:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('alumni_token')
      if (!token) {
        router.push('/alumni-login')
        return
      }

      const response = await fetch('/api/alumni/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
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

  const handleDeleteProduct = async (productId: string) => {
    try {
      const token = localStorage.getItem('alumni_token')
      if (!token) return

      const response = await fetch(`/api/alumni/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId))
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0 
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Dipublikasi</Badge>
      case 'DRAFT':
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Draft</Badge>
      case 'ARCHIVED':
        return <Badge variant="outline"><XCircle className="w-3 h-3 mr-1" />Diarsipkan</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.category?.id === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'name':
        return a.name.localeCompare(b.name)
      case 'price-high':
        return (b.price || 0) - (a.price || 0)
      case 'price-low':
        return (a.price || 0) - (b.price || 0)
      default:
        return 0
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  const renderDesktopView = () => (
    <div className="space-y-6">
      {/* Store Information Header */}
      {storeInfo && (
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                  <AvatarImage src={storeInfo.logo} alt={storeInfo.name} />
                  <AvatarFallback className="bg-green-600 text-white text-xl">
                    {storeInfo.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{storeInfo.name}</h1>
                  {storeInfo.isVerified && (
                    <Badge className="bg-blue-100 text-blue-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Terverifikasi
                    </Badge>
                  )}
            </div>
                {storeInfo.description && (
                  <p className="text-gray-600 mb-3">{storeInfo.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {storeInfo.address && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{storeInfo.address}</span>
          </div>
                  )}
                  {storeInfo.whatsappNumber && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      <span>{storeInfo.whatsappNumber}</span>
        </div>
                  )}
                </div>
                  </div>
                </div>
              </CardContent>
            </Card>
      )}
            
      {/* Controls */}
            <Card>
              <CardContent className="p-6">
          {/* Search and Add Product Row */}
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Cari produk..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
            <Link href="/alumni/dashboard/products/create" className="w-1/3">
              <Button className="bg-green-600 hover:bg-green-700 w-full">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Produk
              </Button>
            </Link>
                </div>
                
          {/* Filters Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Semua Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Terbaru</SelectItem>
                    <SelectItem value="oldest">Terlama</SelectItem>
                    <SelectItem value="name">Nama A-Z</SelectItem>
                  <SelectItem value="price-high">Harga Tertinggi</SelectItem>
                  <SelectItem value="price-low">Harga Terendah</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Products Count */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <span>{sortedProducts.length} produk ditemukan</span>
              </div>
            </CardContent>
          </Card>

          {/* Products Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedProducts.map(product => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-gray-100 overflow-hidden">
                {product.thumbnailImage ? (
                  <img 
                    src={product.thumbnailImage} 
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <ShoppingBag className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 truncate flex-1">{product.name}</h3>
                  {getStatusBadge(product.status)}
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-green-600">{formatCurrency(product.price || 0)}</span>
                  {product.category && (
                    <Badge variant="outline" className="text-xs">{product.category.name}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/alumni/dashboard/products/detail/${product.id}`} className="flex-1">
                    <Button size="sm" variant="outline" className="w-full">
                      <Eye className="w-3 h-3 mr-1" />
                      Lihat
                    </Button>
                  </Link>
                  <Link href={`/alumni/dashboard/products/${product.id}/edit`}>
                    <Button size="sm" variant="outline">
                      <Edit className="w-3 h-3" />
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
                        <AlertDialogDescription>
                          Apakah Anda yakin ingin menghapus produk "{product.name}"? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedProducts.map(product => (
            <Card key={product.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {product.thumbnailImage ? (
                      <img 
                        src={product.thumbnailImage} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      {getStatusBadge(product.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="font-bold text-green-600">{formatCurrency(product.price || 0)}</span>
                      {product.category && (
                        <span>• {product.category.name}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/alumni/dashboard/products/detail/${product.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3 mr-1" />
                        Lihat
                          </Button>
                            </Link>
                            <Link href={`/alumni/dashboard/products/${product.id}/edit`}>
                      <Button size="sm" variant="outline">
                        <Edit className="w-3 h-3" />
                      </Button>
                            </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
                                <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus produk "{product.name}"? Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                  </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
      )}

      {/* Empty State */}
      {sortedProducts.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada produk</h3>
            <p className="text-gray-500 mb-6">Mulai dengan menambahkan produk pertama Anda</p>
                <Link href="/alumni/dashboard/products/create">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Produk Pertama
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
  )

  const renderMobileView = () => (
    <div className="space-y-4">
      {/* Store Information Header */}
      {storeInfo && (
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-12 w-12 border-2 border-white">
                <AvatarImage src={storeInfo.logo} alt={storeInfo.name} />
                <AvatarFallback className="bg-green-600 text-white">
                  {storeInfo.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-gray-900">{storeInfo.name}</h1>
                  {storeInfo.isVerified && (
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Terverifikasi
                    </Badge>
                  )}
                </div>
                {storeInfo.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{storeInfo.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {storeInfo.address && (
                <div className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span className="truncate">{storeInfo.address}</span>
                </div>
              )}
              {storeInfo.whatsappNumber && (
                <div className="flex items-center">
                  <Phone className="w-3 h-3 mr-1" />
                  <span>{storeInfo.whatsappNumber}</span>
          </div>
              )}
        </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cari produk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            <Link href="/alumni/dashboard/products/create">
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Semua Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="flex-1">
                <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Terbaru</SelectItem>
                    <SelectItem value="oldest">Terlama</SelectItem>
                    <SelectItem value="name">Nama A-Z</SelectItem>
                <SelectItem value="price-high">Harga Tertinggi</SelectItem>
                <SelectItem value="price-low">Harga Terendah</SelectItem>
                  </SelectContent>
                </Select>
              </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
            <span>{sortedProducts.length} produk</span>
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-6 w-6 p-0"
              >
                <Grid3X3 className="w-3 h-3" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-6 w-6 p-0"
              >
                <List className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-3">
          {sortedProducts.map(product => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-square bg-gray-100 overflow-hidden">
                {product.thumbnailImage ? (
                  <img 
                    src={product.thumbnailImage} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <h3 className="font-semibold text-sm text-gray-900 truncate mb-1">{product.name}</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-green-600 text-sm">{formatCurrency(product.price || 0)}</span>
                  {getStatusBadge(product.status)}
                </div>
                <div className="flex items-center gap-1">
                  <Link href={`/alumni/dashboard/products/detail/${product.id}`} className="flex-1">
                    <Button size="sm" variant="outline" className="w-full text-xs">
                      <Eye className="w-3 h-3 mr-1" />
                      Lihat
                    </Button>
                  </Link>
                  <Link href={`/alumni/dashboard/products/${product.id}/edit`}>
                    <Button size="sm" variant="outline" className="text-xs">
                      <Edit className="w-3 h-3" />
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 text-xs">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
                        <AlertDialogDescription>
                          Apakah Anda yakin ingin menghapus produk "{product.name}"? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedProducts.map(product => (
            <Card key={product.id}>
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {product.thumbnailImage ? (
                      <img 
                        src={product.thumbnailImage} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-sm text-gray-900 truncate">{product.name}</h3>
                      {getStatusBadge(product.status)}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-green-600 text-sm">{formatCurrency(product.price || 0)}</span>
                      <div className="flex items-center gap-1">
                        <Link href={`/alumni/dashboard/products/detail/${product.id}`}>
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                            <Eye className="w-3 h-3" />
                          </Button>
                            </Link>
                            <Link href={`/alumni/dashboard/products/${product.id}/edit`}>
                          <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                            <Edit className="w-3 h-3" />
                          </Button>
                            </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-red-600 hover:text-red-700">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
                                <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus produk "{product.name}"? Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
              ))}
            </div>
      )}

      {/* Empty State */}
      {sortedProducts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-medium text-gray-900 mb-2">Belum ada produk</h3>
            <p className="text-sm text-gray-500 mb-4">Mulai dengan menambahkan produk pertama Anda</p>
              <Link href="/alumni/dashboard/products/create">
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                Tambah Produk
                </Button>
              </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )

  return isMobile ? renderMobileView() : renderDesktopView()
}
