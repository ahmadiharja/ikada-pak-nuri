'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  StarIcon,
  EyeIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ShoppingBagIcon,
  UserIcon,
  BuildingStorefrontIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface Alumni {
  id: string;
  fullName: string;
  profilePhoto?: string;
  phone?: string;
  email: string;
  syubiyah?: {
    name: string;
  };
}

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
  businessType?: string;
  viewCount: number;
  avgRating: number;
  reviewCount: number;
  whatsappNumber?: string;
  shopeeUrl?: string;
  tokopediaUrl?: string;
  tiktokUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  websiteUrl?: string;
  category: {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    color: string;
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

export default function AlumniCatalogPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const alumniId = params.id as string;
  
  const [alumni, setAlumni] = useState<Alumni | null>(null);
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
  }, [alumniId, searchParams]);

  const fetchData = async (page = 1, category = '', search = '', sort = 'newest') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(category && { category }),
        ...(search && { search }),
        sortBy: sort
      });

      const response = await fetch(`/api/products/alumni/${alumniId}?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setAlumni(data.alumni);
        setProducts(data.products);
        setCategories(data.categories);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalCount);
      } else {
        console.error('Error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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
    
    router.push(`/umkm/alumni/${alumniId}?${params.toString()}`);
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

  const handleWhatsAppClick = (product: Product) => {
    const phone = product.whatsappNumber || alumni?.phone;
    if (phone) {
      const message = `Halo, saya tertarik dengan produk ${product.name}. Bisa minta informasi lebih lanjut?`;
      const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!alumni) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Alumni Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-4">Alumni yang Anda cari tidak ditemukan atau belum terverifikasi.</p>
          <Link href="/umkm" className="text-blue-600 hover:text-blue-800">
            Kembali ke UMKM Alumni
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alumni Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="relative">
                {alumni.profilePhoto ? (
                  <Image
                    src={alumni.profilePhoto}
                    alt={alumni.fullName}
                    width={80}
                    height={80}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="h-20 w-20 bg-gray-300 rounded-full flex items-center justify-center">
                    <UserIcon className="h-10 w-10 text-gray-500" />
                  </div>
                )}
              </div>
              <div>
                <Link href={`/alumni/${alumni.id}`} className="hover:text-blue-600 transition-colors">
                  <h1 className="text-2xl font-bold text-gray-900">{alumni.fullName}</h1>
                </Link>
                {alumni.syubiyah && (
                  <p className="text-gray-600">{alumni.syubiyah.name}</p>
                )}
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center">
                    <ShoppingBagIcon className="h-4 w-4 mr-1" />
                    {totalCount} Produk
                  </span>
                  <span className="flex items-center">
                    <BuildingStorefrontIcon className="h-4 w-4 mr-1" />
                    {categories.length} Kategori
                  </span>
                </div>
              </div>
            </div>
            
            {/* Contact Actions */}
            <div className="flex flex-wrap gap-2">
              <Link 
                href={`/alumni/${alumni.id}`}
                className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <UserIcon className="h-4 w-4" />
                <span>Profil Alumni</span>
              </Link>
              {alumni.phone && (
                <button
                  onClick={() => {
                    const message = `Halo ${alumni.fullName}, saya tertarik dengan produk UMKM Anda.`;
                    const whatsappUrl = `https://wa.me/${alumni.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <ChatBubbleLeftRightIcon className="h-4 w-4" />
                  <span>WhatsApp</span>
                </button>
              )}
              <a
                href={`tel:${alumni.phone}`}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PhoneIcon className="h-4 w-4" />
                <span>Telepon</span>
              </a>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari produk..."
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
          {showFilters && categories.length > 0 && (
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
        {products.length > 0 ? (
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
                    
                    <div className="text-lg font-bold text-blue-600 mb-2">
                      {formatPrice(product)}
                    </div>
                    
                    {/* Rating */}
                    {product.reviewCount > 0 && (
                      <div className="mb-2">
                        {renderStars(product.avgRating)}
                      </div>
                    )}
                    
                    {/* Business Name */}
                    {product.businessName && (
                      <div className="text-sm text-gray-500 mb-2 truncate">
                        🏪 {product.businessName}
                      </div>
                    )}
                    
                    {/* Location */}
                    {product.location && (
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        <span className="truncate">{product.location}</span>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      {(product.whatsappNumber || alumni.phone) && (
                        <button
                          onClick={() => handleWhatsAppClick(product)}
                          className="flex-1 bg-green-600 text-white text-sm py-2 px-3 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          WhatsApp
                        </button>
                      )}
                      
                      {/* Marketplace Links */}
                      <div className="flex space-x-1">
                        {product.shopeeUrl && (
                          <a
                            href={product.shopeeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-orange-500 text-white text-xs py-2 px-2 rounded hover:bg-orange-600 transition-colors"
                            title="Shopee"
                          >
                            🛒
                          </a>
                        )}
                        {product.tokopediaUrl && (
                          <a
                            href={product.tokopediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-500 text-white text-xs py-2 px-2 rounded hover:bg-green-600 transition-colors"
                            title="Tokopedia"
                          >
                            🛍️
                          </a>
                        )}
                        {product.websiteUrl && (
                          <a
                            href={product.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-500 text-white text-xs py-2 px-2 rounded hover:bg-blue-600 transition-colors"
                            title="Website"
                          >
                            🌐
                          </a>
                        )}
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedCategory
                ? 'Tidak ada produk ditemukan'
                : `${alumni.fullName} belum memiliki produk`}
            </h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory
                ? 'Coba ubah filter atau kata kunci pencarian'
                : 'Produk akan muncul di sini setelah alumni menambahkan produk'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}