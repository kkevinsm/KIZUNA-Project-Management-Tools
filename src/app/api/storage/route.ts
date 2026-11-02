import { NextRequest, NextResponse } from 'next/server';
import { isR2Configured, uploadToR2, deleteFromR2, listR2Files, getR2Client } from '@/lib/r2';
import { GetObjectCommand } from '@aws-sdk/client-s3';

// In-memory fallback cache for development or when R2 credentials are not set yet
interface MockFile {
  key: string;
  name: string;
  size: number;
  type: string;
  data: string; // base64
  uploadedAt: string;
}

const mockFileStore = new Map<string, MockFile>();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const taskId = (formData.get('taskId') as string) || 'general';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `kizuna/${taskId}/${timestamp}-${sanitizedName}`;

    if (isR2Configured()) {
      try {
        const uploadResult = await uploadToR2({
          key,
          buffer,
          contentType: file.type || 'application/octet-stream',
        });

        return NextResponse.json({
          success: true,
          isR2: true,
          key,
          name: file.name,
          size: file.size,
          url: uploadResult.url,
          uploadedAt: new Date().toISOString(),
        });
      } catch (err: unknown) {
        console.error('Cloudflare R2 upload error, falling back to local simulation:', err);
      }
    }

    // Fallback store
    const base64Data = buffer.toString('base64');
    mockFileStore.set(key, {
      key,
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      data: base64Data,
      uploadedAt: new Date().toISOString(),
    });

    const mockUrl = `/api/storage?key=${encodeURIComponent(key)}`;

    return NextResponse.json({
      success: true,
      isR2: false,
      message: 'Uploaded to local fallback (Configure CLOUDFLARE_R2_* env vars for live R2 storage)',
      key,
      name: file.name,
      size: file.size,
      url: mockUrl,
      uploadedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  const action = searchParams.get('action');

  if (action === 'list') {
    if (isR2Configured()) {
      try {
        const r2Files = await listR2Files();
        return NextResponse.json({ files: r2Files, isR2: true });
      } catch {
        // fallback
      }
    }
    const mockFiles = Array.from(mockFileStore.values()).map((f) => ({
      key: f.key,
      name: f.name,
      size: f.size,
      uploadedAt: f.uploadedAt,
    }));
    return NextResponse.json({ files: mockFiles, isR2: false });
  }

  if (!key) {
    return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 });
  }

  // If Cloudflare R2 is configured, stream from R2
  if (isR2Configured()) {
    try {
      const client = getR2Client();
      const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME!;
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      const response = await client.send(command);
      const stream = response.Body as ReadableStream;
      const headers = new Headers();
      if (response.ContentType) headers.set('Content-Type', response.ContentType);
      if (response.ContentLength) headers.set('Content-Length', response.ContentLength.toString());

      return new NextResponse(stream, { headers });
    } catch (err: unknown) {
      console.error('Error fetching from R2:', err);
    }
  }

  // Fallback lookup
  const found = mockFileStore.get(key);
  if (!found) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const fileBuffer = Buffer.from(found.data, 'base64');
  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': found.type,
      'Content-Disposition': `inline; filename="${found.name}"`,
    },
  });
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 });
    }

    if (isR2Configured()) {
      try {
        await deleteFromR2(key);
        return NextResponse.json({ success: true, isR2: true });
      } catch (err: unknown) {
        console.error('R2 deletion failed:', err);
      }
    }

    mockFileStore.delete(key);
    return NextResponse.json({ success: true, isR2: false });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
