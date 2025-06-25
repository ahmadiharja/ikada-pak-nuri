import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const uploadDir = path.join(process.cwd(), 'public', 'herohome');

export async function POST(req: NextRequest) {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    const formData = await req.formData();
    const files = formData.getAll('file');
    const uploaded: string[] = [];
    for (const file of files) {
      if (!(file instanceof File)) continue;
      if (!file.type.startsWith('image/')) continue;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      // Generate unique filename
      const ext = path.extname(file.name) || '.jpg';
      const base = path.basename(file.name, ext);
      const filename = `${base}-${Date.now()}${ext}`;
      const filePath = path.join(uploadDir, filename);
      await fs.writeFile(filePath, buffer);
      uploaded.push(`/herohome/${filename}`);
    }
    return NextResponse.json({ success: true, files: uploaded });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
} 