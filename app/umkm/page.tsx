'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  StarIcon,
  EyeIcon,
  MapPinIcon,
  TagIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

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
  isFeatured: boolean;
  isPromoted: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    color: string;
  };
  alumni: {
    id: string;
    fullName: string;
    profilePhoto?: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color: string;
  productCount: number;
}

export default function UMKMPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Get initial params from URL
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'newest';
    const page = parseInt(searchParams.get('page') || '1');
    
    setSelectedCategory(category);
    setSearchTerm(search);
    setSortBy(sort);
    setCurrentPage(page);
    
    fetchData(page, category, search, sort);
    fetchCategories();
  }, [searchParams]);

  const fetchData = async (page = 1, category = '', search = '', sort = 'newest') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(category && { category }),
        ...(search && { search }),
        sortBy: sort,
        featured: 'true'
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
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const updateURL = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    // Reset page when filters change
    if (newParams.category !== undefined || newParams.search !== undefined || newParams.sort !== undefined) {
      params.set('page', '1');
    }
    
    router.push(`/umkm?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL({ search: searchTerm });
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    updateURL({ category: categoryId });
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    updateURL({ sort: newSort });
  };

  const handlePageChange = (page: number) => {
    updateURL({ page: page.toString() });
  };

  const formatPrice = (product: Product) => {
    if (product.priceText) return product.priceText;
    if (product.price) return `Rp ${product.price.toLocaleString('id-ID')}`;
    if (product.priceMin && product.priceMax) {
      return `Rp ${product.priceMin.toLocaleString('id-ID')} - ${product.priceMax.toLocaleString('id-ID')}`;
    }
    return 'Hubungi Penjual';
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIconSolid
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              UMKM Alumni
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Dukung produk dan usaha alumni Ikatan Alumni Daarul Pakar Nuurul Huda
            </p>
            <div className="flex justify-center space-x-8 text-center">
              <div>
                <div className="text-3xl font-bold">{totalCount}</div>
                <div className="text-sm opacity-75">Produk</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{categories.length}</div>
                <div className="text-sm opacity-75">Kategori</div>
              </div>
              <div>
                <div className="text-3xl font-bold">
                  {categories.reduce((sum, cat) => sum + cat.productCount, 0)}
                </div>
                <div className="text-sm opacity-75">Alumni Berjualan</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari produk, alumni, atau bisnis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>

            {/* Sort and Filter */}
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="name">Nama A-Z</option>
                <option value="popular">Terpopuler</option>
                <option value="featured">Unggulan</option>
              </select>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <FunnelIcon className="h-5 w-5" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Categories Filter */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Kategori</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleCategoryChange('')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === ''
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Semua ({totalCount})
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.icon && <span className="mr-1">{category.icon}</span>}
                    {category.name} ({category.productCount})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <Link href={`/umkm/products/${product.slug}`}>
                    <div className="relative">
                      <div className="h-48 bg-gray-200 relative overflow-hidden">
                        {product.thumbnailImage || product.images[0] ? (
                          <Image
                            src={product.thumbnailImage || product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <ShoppingBagIcon className="h-16 w-16 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col space-y-1">
                        {product.isFeatured && (
                          <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            ⭐ Unggulan
                          </span>
                        )}
                        {product.isPromoted && (
                          <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            🚀 Promosi
                          </span>
                        )}
                      </div>
                      
                      {/* Category Badge */}
                      <div className="absolute top-2 right-2">
                        <span 
                          className="text-white text-xs px-2 py-1 rounded-full font-medium"
                          style={{ backgroundColor: product.category.color }}
                        >
                          {product.category.icon} {product.category.name}
                        </span>
                      </div>
                    </div>
                  </Link>
                  
                  <div className="p-4">
                    <Link href={`/umkm/products/${product.slug}`}>
                      <h3 className="font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    
                    {product.shortDescription && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {product.shortDescription}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-blue-600">
                        {formatPrice(product)}
                      </div>
                      <Link href={`/umkm/products/${product.slug}`}>
                        <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                          Lihat Detail
                        </button>
                      </Link>
                    </div>
                    
                    {/* Rating */}
                    {product.reviewCount > 0 && (
                      <div className="mb-2">
                        {renderStars(product.avgRating)}
                      </div>
                    )}
                    
                    {/* Alumni Info */}
                    <div className="flex items-center space-x-2 mb-2">
                      <Link href={`/alumni/${product.alumni.id}`} className="flex items-center space-x-2 hover:text-blue-600 transition-colors">
                        {product.alumni.profilePhoto ? (
                          <Image
                            src={product.alumni.profilePhoto}
                            alt={product.alumni.fullName}
                            width={20}
                            height={20}
                            className="rounded-full"
                          />
                        ) : (
                          <UserGroupIcon className="h-5 w-5 text-gray-400" />
                        )}
                        <span className="text-sm text-gray-600 truncate">
                          {product.alumni.fullName}
                        </span>
                      </Link>
                      <span className="text-gray-400">•</span>
                      <Link href={`/umkm/alumni/${product.alumni.id}`} className="text-xs text-blue-600 hover:text-blue-700">
                        Produk
                      </Link>
                    </div>
                    
                    {/* Business Name */}
                    {product.businessName && (
                      <div className="text-sm text-gray-500 mb-2 truncate">
                        🏪 {product.businessName}
                      </div>
                    )}
                    
                    {/* Location */}
                    {product.location && (
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        <span className="truncate">{product.location}</span>
                      </div>
                    )}
                    
                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <EyeIcon className="h-4 w-4" />
                        <span>{product.viewCount}</span>
                      </div>
                      <div className="text-right">
                        {product.reviewCount} ulasan
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  {currentPage > 1 && (
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Sebelumnya
                    </button>
                  )}
                  
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 border rounded-lg ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  {currentPage < totalPages && (
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Selanjutnya
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <ShoppingBagIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada produk ditemukan</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory
                ? 'Coba ubah filter atau kata kunci pencarian'
                : 'Belum ada produk yang tersedia'}
            </p>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}