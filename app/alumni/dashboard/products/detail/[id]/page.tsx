'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ExternalLink, Package, ChevronLeft, ChevronRight, Store, Share2 } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { toast } from 'sonner';

interface ProductDetail {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  thumbnailImage: string;
  category: {
    name: string;
  };
  shopeeUrl?: string;
  store: {
    name: string;
    alumni: {
      fullName: string;
    };
  };
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const fetchProductDetail = async () => {
      if (!params.id) return;
      
      try {
        setIsLoading(true);
        const token = localStorage.getItem('alumni_token');
        if (!token) {
          router.push('/alumni-login');
          return;
        }

        const response = await fetch(`/api/alumni/products/${params.id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Gagal mengambil detail produk');
        }

        const data = await response.json();
        setProduct(data.product);
      } catch (err) {
        console.error(err);
        setError('Gagal memuat detail produk.');
        toast.error('Gagal memuat detail produk');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetail();

    return () => window.removeEventListener('resize', checkMobile);
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="h-96 bg-gray-200 rounded-2xl mb-4"></div>
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Produk Tidak Ditemukan</h2>
        <p className="text-gray-600 mb-6">{error || 'Produk yang Anda cari tidak dapat ditemukan.'}</p>
        <Button onClick={() => router.back()} className="bg-green-600 hover:bg-green-700">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
      </div>
    );
  }

  const productImages = Array.isArray(product?.images) 
    ? product.images.map(img => img.startsWith('http') ? img : `${window.location.origin}${img}`) 
    : []

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Lihat produk ini: ${product.name}`,
        url: window.location.href,
      })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing', error));
    } else {
      toast.info("Fitur berbagi tidak didukung di browser ini.");
    }
  }

  const renderDesktopView = () => (
    <Card>
      <CardHeader>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 mb-4 -ml-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Dashboard
        </Button>
        {/* Product Image Gallery */}
        <div className="relative group">
          <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
             {productImages.length > 0 ? (
              <img 
                src={productImages[selectedImageIndex]} 
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <Package className="w-24 h-24 text-gray-300" />
            )}
          </div>
          {productImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full h-8 w-8"
                onClick={(e) => { e.preventDefault(); setSelectedImageIndex(prev => (prev - 1 + productImages.length) % productImages.length); }}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full h-8 w-8"
                onClick={(e) => { e.preventDefault(); setSelectedImageIndex(prev => (prev + 1) % productImages.length); }}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
        {productImages.length > 1 && (
          <div className="flex justify-center space-x-2 mt-4">
            {productImages.map((img, index) => (
              <button
                key={index}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${selectedImageIndex === index ? 'border-green-600' : 'border-transparent'}`}
                onClick={() => setSelectedImageIndex(index)}
              >
                <img src={img} alt={`${product.name} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Badge variant="outline" className="mb-2">{product.category.name}</Badge>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
        <p className="text-2xl font-bold text-green-600 mb-4">{formatCurrency(product.price)}</p>
        
        <Separator className="my-4" />

        <h2 className="text-base font-semibold mb-2">Deskripsi Produk</h2>
        <p className="text-gray-600 whitespace-pre-wrap text-sm">{product.description}</p>
        
        <Separator className="my-4" />
        
        <h2 className="text-base font-semibold mb-4">Informasi Toko</h2>
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Store className="w-8 h-8 text-gray-500" />
              <div>
                <p className="font-semibold text-gray-800">{product.store.name}</p>
                <p className="text-sm text-gray-500">Oleh: {product.store.alumni.fullName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button size="default" className="flex-1 bg-green-600 hover:bg-green-700">
            <FaWhatsapp className="w-4 h-4 mr-2" />
            Hubungi Penjual
          </Button>
          {product.shopeeUrl && (
            <Button asChild size="default" variant="outline" className="flex-1">
              <a href={product.shopeeUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Lihat di Shopee
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const renderMobileView = () => (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 flex justify-between items-center p-2 bg-white/80 backdrop-blur-sm z-10">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="font-semibold">Detail Produk</span>
        <Button variant="ghost" size="icon" onClick={handleShare}>
          <Share2 className="w-5 h-5" />
        </Button>
      </div>
      
      {/* Image Carousel */}
      <div className="relative w-full aspect-square pt-12">
        <div className="absolute inset-0 top-12">
          {productImages.length > 0 ? (
            <img 
              src={productImages[selectedImageIndex]} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <Package className="w-24 h-24 text-gray-400" />
            </div>
          )}
        </div>
        
        {productImages.length > 1 && (
          <>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
              {productImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`h-2 w-2 rounded-full ${selectedImageIndex === index ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 bg-white rounded-t-2xl -mt-4 relative z-0">
        <div className="flex justify-between items-start">
            <div>
              <Badge variant="outline">{product.category.name}</Badge>
              <h1 className="text-xl font-bold mt-1">{product.name}</h1>
            </div>
            <p className="text-xl font-bold text-green-600">{formatCurrency(product.price)}</p>
        </div>
        
        <Separator className="my-4" />
        
        <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
          <Store className="w-6 h-6 text-gray-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">{product.store.name}</p>
            <p className="text-xs text-gray-500">Oleh: {product.store.alumni.fullName}</p>
          </div>
        </div>

        <Separator className="my-4" />
        
        <h2 className="font-semibold text-base mb-2">Deskripsi</h2>
        <p className="text-sm text-gray-600 whitespace-pre-wrap">{product.description}</p>
      </div>
      
      {/* Sticky Footer Action */}
      <div className="sticky bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-200 flex gap-3">
          {product.shopeeUrl && (
            <Button asChild size="lg" variant="outline" className="flex-1">
              <a href={product.shopeeUrl} target="_blank" rel="noopener noreferrer">
                Shopee
              </a>
            </Button>
          )}
          <Button size="lg" className="flex-1 bg-green-600 hover:bg-green-700">
            <FaWhatsapp className="w-4 h-4 mr-2" />
            Hubungi Penjual
          </Button>
      </div>
    </div>
  )

  return isMobile ? renderMobileView() : renderDesktopView();
}