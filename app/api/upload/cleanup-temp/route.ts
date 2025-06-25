import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
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

    const deletedFiles = [];
    const errors = [];

    for (const tempUrl of tempUrls) {
      try {
        // Extract filename from temp URL
        const filename = tempUrl.replace('/temp/blog/', '');
        
        // Define temp file path
        const tempPath = join(process.cwd(), 'temp', 'blog', filename);
        
        // Check if temp file exists
        if (!existsSync(tempPath)) {
          errors.push({ tempUrl, error: 'Temp file not found' });
          continue;
        }
        
        // Delete temp file
        await unlink(tempPath);
        
        deletedFiles.push({
          tempUrl,
          filename
        });
        
      } catch (error) {
        console.error(`Error deleting temp file ${tempUrl}:`, error);
        errors.push({ 
          tempUrl, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    return NextResponse.json({
      success: true,
      deletedFiles,
      errors,
      totalProcessed: tempUrls.length,
      successCount: deletedFiles.length,
      errorCount: errors.length
    });

  } catch (error) {
    console.error('Cleanup temp error:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup temp files' },
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