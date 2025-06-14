'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  StarIcon,
  EyeIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ShoppingBagIcon,
  UserIcon,
  BuildingStorefrontIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  ShareIcon,
  HeartIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  TruckIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid 
} from '@heroicons/react/24/solid';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';

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
  videoUrl?: string;
  location?: string;
  businessName?: string;
  businessType?: string;
  shippingInfo?: string;
  viewCount: number;
  clickCount: number;
  avgRating: number;
  reviewCount: number;
  isFeatured: boolean;
  isPromoted: boolean;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  whatsappNumber?: string;
  shopeeUrl?: string;
  tokopediaUrl?: string;
  tiktokUrl?: string;
  bukalapakUrl?: string;
  lazadaUrl?: string;
  blibliUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  websiteUrl?: string;
  createdAt: string;
  updatedAt: string;
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
    phone?: string;
    syubiyah?: {
      name: string;
    };
  };
  reviews: Review[];
  relatedProducts: Product[];
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewer?: {
    name: string;
    avatar?: string;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('');

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError('');
      
      // First try to get product by slug
      const response = await fetch(`/api/products?slug=${slug}&view=true`);
      
      if (!response.ok) {
        throw new Error('Produk tidak ditemukan');
      }
      
      const data = await response.json();
      
      if (data.products && data.products.length > 0) {
        setProduct(data.products[0]);
      } else {
        throw new Error('Produk tidak ditemukan');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (!product?.images.length) return;
    
    if (direction === 'prev') {
      setCurrentImageIndex(prev => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    } else {
      setCurrentImageIndex(prev => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.shortDescription || product?.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link disalin!",
        description: "Link produk telah disalin ke clipboard.",
      });
    }
  };

  const handleContactWhatsApp = () => {
    if (product?.whatsappNumber) {
      const message = `Halo, saya tertarik dengan produk ${product.name}. Bisakah Anda memberikan informasi lebih lanjut?`;
      const url = `https://wa.me/${product.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    }
  };

  const handleMarketplaceClick = (url: string, platform: string) => {
    // Track click
    fetch(`/api/products/${product?.id}/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform })
    });
    
    window.open(url, '_blank');
  };

  const formatPrice = (price?: number, priceMin?: number, priceMax?: number, priceText?: string) => {
    if (priceText) return priceText;
    if (price) return `Rp ${price.toLocaleString('id-ID')}`;
    if (priceMin && priceMax) return `Rp ${priceMin.toLocaleString('id-ID')} - Rp ${priceMax.toLocaleString('id-ID')}`;
    if (priceMin) return `Mulai dari Rp ${priceMin.toLocaleString('id-ID')}`;
    return 'Hubungi penjual';
  };

  const renderStars = (rating: number, size = 'w-4 h-4') => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIconSolid
            key={star}
            className={`${size} ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-300 rounded-lg h-96"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                <div className="h-20 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Produk tidak ditemukan'}
            </h1>
            <Button onClick={() => router.push('/umkm')}>
              Kembali ke Katalog UMKM
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Beranda</Link>
            <span>/</span>
            <Link href="/umkm" className="hover:text-blue-600">UMKM</Link>
            <span>/</span>
            <Link 
              href={`/umkm?category=${product.category.slug}`} 
              className="hover:text-blue-600"
            >
              {product.category.name}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-white rounded-lg overflow-hidden shadow-sm border">
              <div className="aspect-square relative">
                <Image
                  src={product.images[currentImageIndex] || product.thumbnailImage || '/placeholder.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover cursor-pointer"
                  onClick={() => setIsImageModalOpen(true)}
                />
                
                {/* Navigation Arrows */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={() => handleImageNavigation('prev')}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleImageNavigation('next')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </>
                )}
                
                {/* Video Play Button */}
                {product.videoUrl && currentImageIndex === 0 && (
                  <button
                    onClick={() => setIsVideoModalOpen(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
                  >
                    <div className="bg-white/90 rounded-full p-4">
                      <PlayIcon className="w-8 h-8 text-gray-900 ml-1" />
                    </div>
                  </button>
                )}
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isFeatured && (
                    <Badge className="bg-yellow-500 text-white">
                      Featured
                    </Badge>
                  )}
                  {product.isPromoted && (
                    <Badge className="bg-red-500 text-white">
                      Promoted
                    </Badge>
                  )}
                </div>
                
                {/* Actions */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button
                    onClick={() => setIsFavorited(!isFavorited)}
                    className="bg-white/90 p-2 rounded-full shadow-sm hover:bg-white transition-colors"
                  >
                    {isFavorited ? (
                      <HeartIconSolid className="w-5 h-5 text-red-500" />
                    ) : (
                      <HeartIcon className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                  <button
                    onClick={handleShare}
                    className="bg-white/90 p-2 rounded-full shadow-sm hover:bg-white transition-colors"
                  >
                    <ShareIcon className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      index === currentImageIndex ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Category */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge 
                  variant="secondary" 
                  className="text-xs"
                  style={{ backgroundColor: `${product.category.color}20`, color: product.category.color }}
                >
                  {product.category.icon && <span className="mr-1">{product.category.icon}</span>}
                  {product.category.name}
                </Badge>
                {product.businessName && (
                  <Badge variant="outline" className="text-xs">
                    <BuildingStorefrontIcon className="w-3 h-3 mr-1" />
                    {product.businessName}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              {product.shortDescription && (
                <p className="text-gray-600 text-lg">{product.shortDescription}</p>
              )}
            </div>
            
            {/* Rating and Stats */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                {renderStars(product.avgRating)}
                <span className="font-medium">{product.avgRating.toFixed(1)}</span>
                <span className="text-gray-500">({product.reviewCount} ulasan)</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <EyeIcon className="w-4 h-4" />
                <span>{product.viewCount.toLocaleString()} dilihat</span>
              </div>
            </div>
            
            {/* Price */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {formatPrice(product.price, product.priceMin, product.priceMax, product.priceText)}
              </div>
              {product.shippingInfo && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <TruckIcon className="w-4 h-4" />
                  <span>{product.shippingInfo}</span>
                </div>
              )}
            </div>
            
            {/* Location */}
            {product.location && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPinIcon className="w-5 h-5" />
                <span>{product.location}</span>
              </div>
            )}
            
            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    <TagIcon className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Contact Actions */}
            <div className="space-y-3">
              {product.whatsappNumber && (
                <Button 
                  onClick={handleContactWhatsApp}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                  Hubungi via WhatsApp
                </Button>
              )}
              
              {/* Marketplace Links */}
              <div className="grid grid-cols-2 gap-2">
                {product.shopeeUrl && (
                  <Button 
                    variant="outline" 
                    onClick={() => handleMarketplaceClick(product.shopeeUrl!, 'shopee')}
                    className="text-orange-600 border-orange-600 hover:bg-orange-50"
                  >
                    Shopee
                  </Button>
                )}
                {product.tokopediaUrl && (
                  <Button 
                    variant="outline" 
                    onClick={() => handleMarketplaceClick(product.tokopediaUrl!, 'tokopedia')}
                    className="text-green-600 border-green-600 hover:bg-green-50"
                  >
                    Tokopedia
                  </Button>
                )}
                {product.lazadaUrl && (
                  <Button 
                    variant="outline" 
                    onClick={() => handleMarketplaceClick(product.lazadaUrl!, 'lazada')}
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    Lazada
                  </Button>
                )}
                {product.bukalapakUrl && (
                  <Button 
                    variant="outline" 
                    onClick={() => handleMarketplaceClick(product.bukalapakUrl!, 'bukalapak')}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    Bukalapak
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Seller Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage 
                  src={product.alumni.profilePhoto || '/placeholder-user.jpg'} 
                  alt={product.alumni.fullName} 
                />
                <AvatarFallback>
                  {product.alumni.fullName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <Link href={`/alumni/${product.alumni.id}`} className="hover:text-blue-600 transition-colors">
                  <h3 className="text-lg font-semibold">{product.alumni.fullName}</h3>
                </Link>
                {product.alumni.syubiyah && (
                  <p className="text-sm text-gray-600">{product.alumni.syubiyah.name}</p>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Link 
                href={`/alumni/${product.alumni.id}`}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Profil Alumni
              </Link>
              <Link 
                href={`/umkm/alumni/${product.alumni.id}`}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Lihat Semua Produk
              </Link>
              {product.alumni.phone && (
                <a 
                  href={`tel:${product.alumni.phone}`}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                  <PhoneIcon className="w-4 h-4" />
                  Telepon
                </a>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Product Details Tabs */}
        <Tabs defaultValue="description" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Deskripsi</TabsTrigger>
            <TabsTrigger value="reviews">Ulasan ({product.reviewCount})</TabsTrigger>
            <TabsTrigger value="info">Info Tambahan</TabsTrigger>
          </TabsList>
          
          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="prose max-w-none">
                  {product.description ? (
                    <div dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br>') }} />
                  ) : (
                    <p className="text-gray-500">Tidak ada deskripsi tersedia.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                {product.reviews && product.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {/* Rating Summary */}
                    <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">{product.avgRating.toFixed(1)}</div>
                        {renderStars(product.avgRating, 'w-5 h-5')}
                        <div className="text-sm text-gray-600 mt-1">{product.reviewCount} ulasan</div>
                      </div>
                    </div>
                    
                    {/* Reviews List */}
                    <div className="space-y-4">
                      {product.reviews.map((review) => (
                        <div key={review.id} className="border-b pb-4 last:border-b-0">
                          <div className="flex items-start gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={review.reviewer?.avatar} />
                              <AvatarFallback>
                                {review.reviewer?.name?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">
                                  {review.reviewer?.name || 'Pengguna'}
                                </span>
                                {renderStars(review.rating, 'w-4 h-4')}
                              </div>
                              <p className="text-gray-700 text-sm mb-1">{review.comment}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString('id-ID', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">Belum ada ulasan untuk produk ini.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="info" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Informasi Produk</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Kategori:</span>
                        <span>{product.category.name}</span>
                      </div>
                      {product.businessType && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Jenis Bisnis:</span>
                          <span>{product.businessType}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ditambahkan:</span>
                        <span>
                          {new Date(product.createdAt).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Terakhir diperbarui:</span>
                        <span>
                          {new Date(product.updatedAt).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Kontak & Media Sosial</h4>
                    <div className="space-y-2">
                      {product.instagramUrl && (
                        <a 
                          href={product.instagramUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <GlobeAltIcon className="w-4 h-4" />
                          Instagram
                        </a>
                      )}
                      {product.facebookUrl && (
                        <a 
                          href={product.facebookUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <GlobeAltIcon className="w-4 h-4" />
                          Facebook
                        </a>
                      )}
                      {product.websiteUrl && (
                        <a 
                          href={product.websiteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <GlobeAltIcon className="w-4 h-4" />
                          Website
                        </a>
                      )}
                      {product.tiktokUrl && (
                        <a 
                          href={product.tiktokUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <GlobeAltIcon className="w-4 h-4" />
                          TikTok
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Related Products */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Produk Terkait</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {product.relatedProducts.map((relatedProduct) => (
                <Card key={relatedProduct.id} className="group hover:shadow-lg transition-shadow">
                  <div className="aspect-square relative overflow-hidden rounded-t-lg">
                    <Image
                      src={relatedProduct.thumbnailImage || relatedProduct.images[0] || '/placeholder.jpg'}
                      alt={relatedProduct.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {relatedProduct.isFeatured && (
                      <Badge className="absolute top-2 left-2 bg-yellow-500 text-white text-xs">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-2">
                      <Badge 
                        variant="secondary" 
                        className="text-xs mb-2"
                        style={{ backgroundColor: `${relatedProduct.category.color}20`, color: relatedProduct.category.color }}
                      >
                        {relatedProduct.category.name}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {relatedProduct.shortDescription}
                    </p>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        {renderStars(relatedProduct.avgRating, 'w-3 h-3')}
                        <span className="text-xs text-gray-500">({relatedProduct.reviewCount})</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <EyeIcon className="w-3 h-3" />
                        <span>{relatedProduct.viewCount}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-blue-600">
                        {formatPrice(relatedProduct.price, relatedProduct.priceMin, relatedProduct.priceMax, relatedProduct.priceText)}
                      </div>
                      <Link href={`/umkm/products/${relatedProduct.slug}`}>
                        <Button size="sm" variant="outline">
                          Lihat
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Image Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <XMarkIcon className="w-8 h-8" />
            </button>
            <Image
              src={product.images[currentImageIndex] || product.thumbnailImage || '/placeholder.jpg'}
              alt={product.name}
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain"
            />
            {product.images.length > 1 && (
              <>
                <button
                  onClick={() => handleImageNavigation('prev')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70"
                >
                  <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={() => handleImageNavigation('next')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70"
                >
                  <ChevronRightIcon className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Video Modal */}
      {isVideoModalOpen && product.videoUrl && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full w-full">
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300"
            >
              <XMarkIcon className="w-8 h-8" />
            </button>
            <div className="aspect-video">
              <iframe
                src={product.videoUrl}
                className="w-full h-full rounded-lg"
                allowFullScreen
                title={`Video ${product.name}`}
              />
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}