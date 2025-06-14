'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { X, Upload, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
  label?: string;
  placeholder?: string;
}

export function ImageUploader({ 
  value, 
  onChange, 
  className, 
  label = "Gambar Thumbnail",
  placeholder = "Masukkan URL gambar atau upload file"
}: ImageUploaderProps) {
  const [imageUrl, setImageUrl] = useState(value || '');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    onChange(url);
  };

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setIsUploading(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // You can implement your own upload endpoint here
      // For now, we'll use a placeholder URL or convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        handleUrlChange(result);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
      
      // Alternative: Upload to your server
      // const response = await fetch('/api/upload', {
      //   method: 'POST',
      //   body: formData,
      // });
      // const data = await response.json();
      // handleUrlChange(data.url);
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
      setIsUploading(false);
    }
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, [handleFileUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setImageUrl('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <Label>{label}</Label>
      
      {/* URL Input */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type="url"
            placeholder={placeholder}
            value={imageUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            className="w-full"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Drag & Drop Area */}
      <Card 
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
          imageUrl ? 'hidden' : 'block'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            Drag & drop gambar di sini atau klik untuk memilih
          </p>
          <p className="text-xs text-gray-400">
            Mendukung: JPG, PNG, GIF, WebP (Max 5MB)
          </p>
        </CardContent>
      </Card>

      {/* Image Preview */}
      {imageUrl && (
        <Card className="relative">
          <CardContent className="p-4">
            <div className="relative group">
              <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={imageUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                  onError={() => {
                    // Handle broken image
                    console.error('Failed to load image:', imageUrl);
                  }}
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 break-all">
              {imageUrl.length > 100 ? `${imageUrl.substring(0, 100)}...` : imageUrl}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ImageUploader;