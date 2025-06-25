import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.resolve(process.cwd(), "data/reuni-2026.json");

export async function GET() {
  try {
    const content = fs.readFileSync(DATA_PATH, "utf-8");
    return NextResponse.json(JSON.parse(content), { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to read content" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // NOTE: Anda harus menerapkan autentikasi superadmin dengan lebih kuat pada production.
    const body = await request.json();
    if (typeof body.content !== "string") {
      return NextResponse.json({ error: "Invalid content" }, { status: 400 });
    }
    fs.writeFileSync(DATA_PATH, JSON.stringify({ content: body.content }, null, 2), "utf-8");
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to write content" }, { status: 500 });
  }
}