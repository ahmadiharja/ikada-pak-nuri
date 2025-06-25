'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Filter, 
  Eye, 
  Star, 
  MapPin, 
  Calendar,
  ShoppingBag,
  TrendingUp,
  Users,
  Package,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  Instagram,
  Facebook
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price?: number;
  priceMin?: number;
  priceMax?: number;
  priceText?: string;
  thumbnailImage?: string;
  images: string[];
  location?: string;
  businessName?: string;
  viewCount: number;
  avgRating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  shopeeUrl?: string;
  tokopediaUrl?: string;
  tiktokUrl?: string;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
  store: {
    id: string;
    name: string;
    description?: string;
    whatsappNumber?: string;
    instagramUrl?: string;
    facebookUrl?: string;
    websiteUrl?: string;
    address?: string;
    alumni: {
      id: string;
      fullName: string;
      profilePhoto?: string;
      email?: string;
      phone?: string;
    };
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  productCount: number;
}

interface Stats {
  totalProducts: number;
  activeProducts: number;
  featuredProducts: number;
  totalViews: number;
  totalAlumniWithProducts: number;
  averageRating: number;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    activeProducts: 0,
    featuredProducts: 0,
    totalViews: 0,
    totalAlumniWithProducts: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchStats();
  }, [searchTerm, selectedCategory, statusFilter, sortBy, currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && selectedCategory !== 'all' && { category: selectedCategory }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        sortBy: sortBy
      });

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setProducts(data.products);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalCount);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/products/categories?includeCount=true');
      const data = await response.json();
      
      if (response.ok) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/products?stats=true');
      const data = await response.json();
      
      if (response.ok && data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatPrice = (product: Product) => {
    if (product.priceText) return product.priceText;
    if (product.price) return `Rp ${product.price.toLocaleString('id-ID')}`;
    if (product.priceMin && product.priceMax) {
      return `Rp ${product.priceMin.toLocaleString('id-ID')} - ${product.priceMax.toLocaleString('id-ID')}`;
    }
    return 'Hubungi Penjual';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-xs text-gray-600 ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produk UMKM Alumni</h1>
          <p className="text-muted-foreground">
            Kelola dan pantau produk UMKM dari alumni
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produk Aktif</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProducts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produk Unggulan</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.featuredProducts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alumni UMKM</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAlumniWithProducts}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cari produk atau nama alumni..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories && categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name} ({category.productCount})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Terbaru</SelectItem>
                <SelectItem value="oldest">Terlama</SelectItem>
                <SelectItem value="name">Nama A-Z</SelectItem>
                <SelectItem value="price_low">Harga Terendah</SelectItem>
                <SelectItem value="price_high">Harga Tertinggi</SelectItem>
                <SelectItem value="rating">Rating Tertinggi</SelectItem>
                <SelectItem value="views">Paling Dilihat</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daftar Produk ({totalCount})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada produk</h3>
              <p className="text-gray-500 text-center">
                {searchTerm || selectedCategory !== 'all' || statusFilter !== 'all' 
                  ? 'Tidak ada produk yang sesuai dengan filter yang dipilih'
                  : 'Belum ada produk yang ditambahkan oleh alumni'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produk</TableHead>
                      <TableHead>Alumni</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Harga</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleProductClick(product)}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {product.thumbnailImage ? (
                                <Image
                                  src={product.thumbnailImage}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-sm truncate">{product.name}</div>
                              <div className="text-xs text-gray-500 line-clamp-1">
                                {product.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={product.store?.alumni?.profilePhoto} />
                              <AvatarFallback className="text-xs">
                                {product.store?.alumni?.fullName?.split(' ').map(n => n[0]).join('') || 'N/A'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="font-medium text-sm truncate">
                                {product.store?.alumni?.fullName || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500 truncate">
                                {product.store?.name || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className="text-xs"
                            style={{ borderColor: product.category.color, color: product.category.color }}
                          >
                            {product.category.name}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="font-medium text-sm text-green-600">
                            {formatPrice(product)}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          {product.reviewCount > 0 ? (
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-sm">{product.avgRating.toFixed(1)}</span>
                              <span className="text-xs text-gray-500">({product.reviewCount})</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">Belum ada review</span>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center space-x-1 text-sm text-gray-600">
                            <Eye className="h-3 w-3" />
                            <span>{product.viewCount}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge variant={product.isActive ? "default" : "secondary"} className="text-xs">
                            {product.isActive ? 'Aktif' : 'Tidak Aktif'}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {formatDate(product.createdAt)}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProductClick(product);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-6">
                  {currentPage > 1 && (
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Sebelumnya
                    </Button>
                  )}
                  
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  
                  {currentPage < totalPages && (
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Selanjutnya
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Product Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedProduct.name}</DialogTitle>
                <DialogDescription>
                  Detail produk dari {selectedProduct.store?.alumni?.fullName}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Product Images */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="relative aspect-square overflow-hidden rounded-lg">
                      {selectedProduct.thumbnailImage ? (
                        <Image
                          src={selectedProduct.thumbnailImage}
                          alt={selectedProduct.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gray-100">
                          <Package className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {selectedProduct.images && selectedProduct.images.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {selectedProduct.images.slice(0, 4).map((image, index) => (
                          <div key={index} className="relative aspect-square overflow-hidden rounded-md">
                            <Image
                              src={image}
                              alt={`${selectedProduct.name} ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {/* Product Info */}
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold">{selectedProduct.name}</h3>
                        <Badge 
                          variant="outline" 
                          className="mt-2"
                          style={{ borderColor: selectedProduct.category.color, color: selectedProduct.category.color }}
                        >
                          {selectedProduct.category.name}
                        </Badge>
                      </div>
                      
                      <div className="text-2xl font-bold text-green-600">
                        {formatPrice(selectedProduct)}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{selectedProduct.viewCount} views</span>
                        </div>
                        {selectedProduct.reviewCount > 0 && (
                          <div className="flex items-center space-x-1">
                            {renderStars(selectedProduct.avgRating)}
                            <span>({selectedProduct.reviewCount} reviews)</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <p>Ditambahkan: {formatDate(selectedProduct.createdAt)}</p>
                        {selectedProduct.location && (
                          <p className="flex items-center mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {selectedProduct.location}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Description */}
                    <div>
                      <h4 className="font-medium mb-2">Deskripsi Produk</h4>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {selectedProduct.description}
                      </p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Store & Alumni Info */}
                <div className="space-y-4">
                  <h4 className="font-medium">Informasi Toko & Alumni</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Alumni Info */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Alumni</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={selectedProduct.store?.alumni?.profilePhoto} />
                            <AvatarFallback>
                              {selectedProduct.store?.alumni?.fullName?.split(' ').map(n => n[0]).join('') || 'N/A'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{selectedProduct.store?.alumni?.fullName || 'N/A'}</p>
                            {selectedProduct.store?.alumni?.phone && (
                              <p className="text-sm text-gray-600 flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {selectedProduct.store.alumni.phone}
                              </p>
                            )}
                            {selectedProduct.store?.alumni?.email && (
                              <p className="text-sm text-gray-600 flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {selectedProduct.store.alumni.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Store Info */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Toko</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="font-medium">{selectedProduct.store?.name || 'N/A'}</p>
                          {selectedProduct.store?.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {selectedProduct.store.description}
                            </p>
                          )}
                        </div>
                        
                        {selectedProduct.store?.address && (
                          <p className="text-sm text-gray-600 flex items-start">
                            <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                            {selectedProduct.store.address}
                          </p>
                        )}
                        
                        {/* Social Links */}
                        <div className="flex space-x-2">
                          {selectedProduct.store?.whatsappNumber && (
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`https://wa.me/${selectedProduct.store.whatsappNumber}`} target="_blank">
                                <Phone className="h-3 w-3 mr-1" />
                                WhatsApp
                              </Link>
                            </Button>
                          )}
                          {selectedProduct.store?.instagramUrl && (
                            <Button size="sm" variant="outline" asChild>
                              <Link href={selectedProduct.store.instagramUrl} target="_blank">
                                <Instagram className="h-3 w-3 mr-1" />
                                Instagram
                              </Link>
                            </Button>
                          )}
                          {selectedProduct.store?.facebookUrl && (
                            <Button size="sm" variant="outline" asChild>
                              <Link href={selectedProduct.store.facebookUrl} target="_blank">
                                <Facebook className="h-3 w-3 mr-1" />
                                Facebook
                              </Link>
                            </Button>
                          )}
                          {selectedProduct.store?.websiteUrl && (
                            <Button size="sm" variant="outline" asChild>
                              <Link href={selectedProduct.store.websiteUrl} target="_blank">
                                <Globe className="h-3 w-3 mr-1" />
                                Website
                              </Link>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                {/* Marketplace Links */}
                {(selectedProduct.shopeeUrl || selectedProduct.tokopediaUrl || selectedProduct.tiktokUrl) && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h4 className="font-medium">Link Marketplace</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.shopeeUrl && (
                          <Button variant="outline" asChild>
                            <Link href={selectedProduct.shopeeUrl} target="_blank">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Shopee
                            </Link>
                          </Button>
                        )}
                        {selectedProduct.tokopediaUrl && (
                          <Button variant="outline" asChild>
                            <Link href={selectedProduct.tokopediaUrl} target="_blank">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Tokopedia
                            </Link>
                          </Button>
                        )}
                        {selectedProduct.tiktokUrl && (
                          <Button variant="outline" asChild>
                            <Link href={selectedProduct.tiktokUrl} target="_blank">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              TikTok Shop
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}