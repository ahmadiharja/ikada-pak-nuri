import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'product' for alumni products
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Determine upload directory based on type
    let uploadDir;
    if (type === 'product') {
      uploadDir = join(process.cwd(), 'public', 'produkalumni');
    } else {
      uploadDir = join(process.cwd(), 'public', 'uploads');
    }

    // Create upload directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileExtension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${timestamp}_${originalName.split('.')[0]}.webp`; // Convert to webp for optimization
    const filePath = join(uploadDir, fileName);

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Process image with sharp for optimization
    let processedBuffer;
    try {
      processedBuffer = await sharp(buffer)
        .resize(800, 800, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .webp({ 
          quality: 85,
          effort: 4
        })
        .toBuffer();
    } catch (sharpError) {
      console.warn('Sharp processing failed, using original file:', sharpError);
      // If sharp fails, try to save as jpeg
      try {
        processedBuffer = await sharp(buffer)
          .jpeg({ quality: 85 })
          .toBuffer();
        const jpegFileName = `${timestamp}_${originalName.split('.')[0]}.jpg`;
        const jpegFilePath = join(uploadDir, jpegFileName);
        await writeFile(jpegFilePath, processedBuffer);
        
        const publicUrl = type === 'product' 
          ? `/produkalumni/${jpegFileName}`
          : `/uploads/${jpegFileName}`;
        
        return NextResponse.json({
          success: true,
          url: publicUrl,
          filename: jpegFileName,
          size: processedBuffer.length
        });
      } catch (fallbackError) {
        // Last resort: use original buffer
        processedBuffer = buffer;
      }
    }

    // Save file to upload directory
    await writeFile(filePath, processedBuffer);

    // Return the public URL
    const publicUrl = type === 'product' 
      ? `/produkalumni/${fileName}`
      : `/uploads/${fileName}`;
    
    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: fileName,
      size: processedBuffer.length
    });

  } catch (error) {
    console.error('Product upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}