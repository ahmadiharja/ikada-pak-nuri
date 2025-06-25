import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public');

async function parseForm(req: NextRequest) {
  return new Promise<{ files: formidable.Files }>((resolve, reject) => {
    const form = formidable({ multiples: false, uploadDir, keepExtensions: true });
    form.parse(req as any, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ files });
    });
  });
}

export async function POST(req: NextRequest) {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    const { files } = await parseForm(req);
    const file = files.file;
    if (!file) throw new Error('No file uploaded');
    // Only accept image or ico
    if (!file.mimetype?.startsWith('image/') && file.mimetype !== 'image/x-icon') {
      throw new Error('Invalid file type');
    }
    const relPath = `/${path.basename(file.filepath)}`;
    return NextResponse.json({ success: true, file: relPath });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
} 