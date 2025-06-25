import { NextRequest, NextResponse } from 'next/server';
import { copyFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tempUrls } = body;
    
    if (!tempUrls || !Array.isArray(tempUrls)) {
      return NextResponse.json(
        { error: 'tempUrls array is required' },
        { status: 400 }
      );
    }

    const movedFiles = [];
    const errors = [];

    // Create public blog directory if it doesn't exist
    const publicDir = join(process.cwd(), 'public', 'blog');
    if (!existsSync(publicDir)) {
      await mkdir(publicDir, { recursive: true });
    }

    for (const tempUrl of tempUrls) {
      try {
        // Extract filename from temp URL
        const filename = tempUrl.replace('/temp/blog/', '');
        
        // Define source and destination paths
        const sourcePath = join(process.cwd(), 'temp', 'blog', filename);
        const destPath = join(publicDir, filename);
        
        // Check if temp file exists
        if (!existsSync(sourcePath)) {
          errors.push({ tempUrl, error: 'Temp file not found' });
          continue;
        }
        
        // Copy file from temp to public
        await copyFile(sourcePath, destPath);
        
        // Delete temp file
        await unlink(sourcePath);
        
        // Add to moved files list
        const publicUrl = `/blog/${filename}`;
        movedFiles.push({
          tempUrl,
          publicUrl,
          filename
        });
        
      } catch (error) {
        console.error(`Error moving file ${tempUrl}:`, error);
        errors.push({ 
          tempUrl, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return NextResponse.json({
      success: true,
      movedFiles,
      errors,
      totalProcessed: tempUrls.length,
      successCount: movedFiles.length,
      errorCount: errors.length
    });

  } catch (error) {
    console.error('Move to public error:', error);
    return NextResponse.json(
      { error: 'Failed to move files to public' },
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