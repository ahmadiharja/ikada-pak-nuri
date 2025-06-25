"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ExternalLink, MapPin, Users, Eye, MousePointer, ChevronLeft, ChevronRight, Tag } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  thumbnailImage?: string;
  images?: string[];
  description?: string;
  owner?: {
    id: string;
    fullName: string;
    profilePhoto?: string;
  };
  image?: string;
  storeName?: string;
  shippedFromCity?: string;
  viewCount?: number;
  clickCount?: number;
  marketplaceUrl?: string;
  category?: string;
}

export default function AlumniUMKMDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params as { id: string };
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const imageList = product?.images && product.images.length > 0 ? product.images : (product?.image ? [product.image] : []);

  useEffect(() => {
    const alumniToken = localStorage.getItem("alumni_token");
    if (!alumniToken) {
      router.push("/alumni-login");
      return;
    }
    fetchProduct();
  }, [router, id]);

  const fetchProduct = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/products/alumni`);
      if (res.ok) {
        const data = await res.json();
        const found = (data.products || []).find((p: any) => p.id === id);
        setProduct(found || null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevImage = () => {
    setCurrentImage((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  };
  const handleNextImage = () => {
    setCurrentImage((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
  };

  if (isLoading) {
    return <div className="p-4">Memuat detail produk...</div>;
  }
  if (!product) {
    return <div className="p-4">Produk tidak ditemukan.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-md mx-auto p-0">
        {/* Carousel Gambar */}
        <div className="relative w-full aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
          {imageList.length > 0 ? (
            <>
              <img src={imageList[currentImage]} alt={product.name} className="object-cover w-full h-full transition-all duration-300" />
              {imageList.length > 1 && (
                <>
                  <button onClick={handlePrevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow"><ChevronLeft className="w-6 h-6 text-gray-700" /></button>
                  <button onClick={handleNextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow"><ChevronRight className="w-6 h-6 text-gray-700" /></button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {imageList.map((_, idx) => (
                      <span key={idx} className={`w-2 h-2 rounded-full ${idx === currentImage ? 'bg-orange-500' : 'bg-gray-300'}`}></span>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <span className="text-gray-400 text-xs">No Image</span>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            {product.category && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-orange-100 text-orange-700 text-xs font-medium"><Tag className="w-3 h-3" />{product.category}</span>
            )}
            {product.storeName && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-medium"><Users className="w-3 h-3" />{product.storeName}</span>
            )}
          </div>
          <h1 className="text-xl font-bold mb-1 text-gray-900 leading-tight">{product.name}</h1>
          <div className="text-2xl font-extrabold text-green-600 mb-2">Rp {product.price.toLocaleString("id-ID")}</div>
          {product.shippedFromCity && (
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500">{product.shippedFromCity}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{product.viewCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <MousePointer className="w-4 h-4" />
              <span>{product.clickCount}</span>
            </div>
          </div>
          <div className="text-base text-gray-700 mb-4 whitespace-pre-line leading-relaxed">{product.description}</div>
        </div>
        {/* Tombol Beli sticky bawah */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4 flex justify-center mb-20">
          <a
            href={product.marketplaceUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-3 rounded-xl flex items-center justify-center gap-2 transition text-base shadow-lg"
          >
            <ExternalLink className="h-5 w-5" /> Beli di Marketplace
          </a>
        </div>
      </div>
    </div>
  );
} 