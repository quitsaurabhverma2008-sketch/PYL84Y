import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `pyl84y/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
