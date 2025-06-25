import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
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

    // Create temp upload directory if it doesn't exist
    const tempDir = join(process.cwd(), 'temp', 'blog');
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileExtension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${timestamp}_${originalName.split('.')[0]}.${fileExtension}`;
    const filePath = join(tempDir, fileName);

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Process image with sharp for optimization
    let processedBuffer;
    try {
      processedBuffer = await sharp(buffer)
        .resize(1200, 1200, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ 
          quality: 85,
          progressive: true 
        })
        .toBuffer();
    } catch (sharpError) {
      // If sharp fails, use original buffer
      console.warn('Sharp processing failed, using original file:', sharpError);
      processedBuffer = buffer;
    }

    // Save file to temp directory
    await writeFile(filePath, processedBuffer);

    // Return the temp URL (we'll use a special prefix to indicate it's temporary)
    const tempUrl = `/temp/blog/${fileName}`;
    
    return NextResponse.json({
      success: true,
      url: tempUrl,
      filename: fileName,
      size: processedBuffer.length,
      isTemporary: true
    });

  } catch (error) {
    console.error('Temp upload error:', error);
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