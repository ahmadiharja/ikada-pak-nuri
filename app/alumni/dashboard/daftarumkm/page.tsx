"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
}

export default function AlumniUMKMListPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const alumniToken = localStorage.getItem("alumni_token");
    if (!alumniToken) {
      router.push("/alumni-login");
      return;
    }
    fetchProducts();
  }, [router]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductClick = (id: string) => {
    router.push(`/alumni/dashboard/daftarumkm/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto p-4">
        <h2 className="text-xl font-bold mb-4">UMKM Alumni</h2>
        {isLoading ? (
          <div>Memuat produk...</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products.length === 0 && <div className="col-span-2">Tidak ada produk tersedia.</div>}
            {products.map(product => (
              <Card key={product.id} className="p-2 rounded-xl shadow-sm border border-gray-200 bg-white hover:shadow-md transition cursor-pointer flex flex-col" onClick={() => handleProductClick(product.id)}>
                <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2 flex items-center justify-center">
                  {product.thumbnailImage || product.images?.[0] ? (
                    <img src={product.thumbnailImage || product.images?.[0]} alt={product.name} className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-gray-400 text-xs">No Image</span>
                  )}
                </div>
                <CardTitle className="text-base font-bold line-clamp-1 mb-1">{product.name}</CardTitle>
                <div className="text-green-600 font-semibold text-sm mb-1">Rp {product.price.toLocaleString("id-ID")}</div>
                {product.owner && (
                  <div className="flex items-center gap-2 mt-auto">
                    <Avatar className="w-6 h-6">
                      {product.owner.profilePhoto ? (
                        <AvatarImage src={product.owner.profilePhoto} alt={product.owner.fullName} />
                      ) : (
                        <AvatarFallback>{product.owner.fullName?.[0]}</AvatarFallback>
                      )}
                    </Avatar>
                    <span className="text-xs text-gray-500 line-clamp-1">{product.owner.fullName}</span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 