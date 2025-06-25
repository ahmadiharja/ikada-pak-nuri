"use client";

import { ShoppingCart, ExternalLink, Package, Users, MapPin, Eye, MousePointer } from "lucide-react";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const officialProducts = [
  {
    id: 1,
    name: "Seragam Batik IKADA Official",
    price: 175000,
    image: "",
    description: "Seragam batik resmi IKADA, bahan premium, tersedia berbagai ukuran.",
  },
  {
    id: 2,
    name: "Kaos IKADA Original",
    price: 95000,
    image: "",
    description: "Kaos official alumni IKADA, nyaman dipakai harian.",
  },
  {
    id: 3,
    name: "Pin Logo IKADA",
    price: 25000,
    image: "",
    description: "Pin eksklusif logo IKADA, cocok untuk aksesoris seragam.",
  },
  {
    id: 4,
    name: "Buku Pedoman IKADA",
    price: 50000,
    image: "",
    description: "Buku pedoman resmi organisasi IKADA, edisi terbaru.",
  },
];

function ProductCard({ product, type }: { product: any; type: "official" | "alumni" }) {
  const getMarketplaceName = (url: string) => {
    if (url.includes('shopee')) return 'Shopee';
    if (url.includes('tokopedia')) return 'Tokopedia';
    if (url.includes('tiktok')) return 'TikTok';
    return 'Marketplace';
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-0">
        <div className="aspect-square relative overflow-hidden bg-gray-100">
          <img
            src={product.image || "/placeholder-logo.png"}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {type === "official" && (
            <Badge className="absolute top-2 left-2 bg-emerald-600 text-white">
              <Package className="w-3 h-3 mr-1" />
              Official
            </Badge>
          )}
          {type === "alumni" && (
            <Badge className="absolute top-2 left-2 bg-orange-500 text-white">
              <Users className="w-3 h-3 mr-1" />
              Alumni
            </Badge>
          )}
          {type === "alumni" && product.category && (
            <Badge 
              className="absolute top-2 right-2 text-xs"
              style={{ backgroundColor: product.categoryColor || '#3b82f6' }}
            >
              {product.category}
            </Badge>
          )}
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-sm mb-1 line-clamp-2 leading-tight">{product.name}</h3>
          
          {/* Store info for alumni products */}
          {type === "alumni" && product.storeName && (
            <p className="text-xs text-gray-500 mb-1 truncate">oleh {product.storeName}</p>
          )}
          
          <div className="text-emerald-700 dark:text-emerald-300 font-bold text-sm mb-2">
            Rp {product.price?.toLocaleString() || '0'}
            {product.unit && <span className="text-xs text-gray-500 ml-1">/{product.unit}</span>}
          </div>
          
          <div className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-tight">
            {product.description}
          </div>
          
          {/* Location info for alumni products */}
          {type === "alumni" && product.shippedFromCity && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
              <MapPin className="w-3 h-3" />
              <span>{product.shippedFromCity}</span>
            </div>
          )}
          
          {/* Stats for alumni products */}
          {type === "alumni" && (product.viewCount > 0 || product.clickCount > 0) && (
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{product.viewCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <MousePointer className="w-3 h-3" />
                <span>{product.clickCount}</span>
              </div>
            </div>
          )}
          
          {type === "official" ? (
            <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition text-sm">
              <ShoppingCart className="h-4 w-4" /> Beli Sekarang
            </button>
          ) : (
            <a
              href={product.marketplaceUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition text-sm"
            >
              <ExternalLink className="h-4 w-4" /> Beli di {getMarketplaceName(product.marketplaceUrl)}
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ProductSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <Skeleton className="aspect-square w-full" />
        <div className="p-3 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-8 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function MarketplacePage() {
  const [alumniProducts, setAlumniProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch alumni products from database
    fetch('/api/products/alumni')
      .then(res => res.json())
      .then(data => {
        setAlumniProducts(data.products || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching alumni products:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 animate-fade-in">
      <h1 className="ikada-text-gradient text-2xl font-bold mb-6 text-center">Marketplace IKADA</h1>
      
      {/* Official Store Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-300">Produk Official Store</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {officialProducts.map((product) => (
            <ProductCard key={product.id} product={product} type="official" />
          ))}
        </div>
      </div>

      {/* Alumni Products Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-orange-600" />
          <h2 className="text-xl font-bold text-orange-600 dark:text-orange-400">Produk Alumni</h2>
          {!loading && (
            <Badge variant="secondary" className="ml-auto">
              {alumniProducts.length} produk
            </Badge>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))
          ) : alumniProducts.length > 0 ? (
            alumniProducts.map((product) => (
              <ProductCard key={product.id} product={product} type="alumni" />
            ))
          ) : (
            // Empty state
            <div className="col-span-2 text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Belum ada produk alumni yang tersedia</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 