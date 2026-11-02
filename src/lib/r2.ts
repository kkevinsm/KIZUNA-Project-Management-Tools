import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

// Check if Cloudflare R2 credentials are fully provided
export function isR2Configured(): boolean {
  return Boolean(
    process.env.CLOUDFLARE_R2_ACCOUNT_ID &&
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
    process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY &&
    process.env.CLOUDFLARE_R2_BUCKET_NAME
  );
}

// Singleton S3 client instance for Cloudflare R2
let r2ClientInstance: S3Client | null = null;

export function getR2Client(): S3Client {
  if (!r2ClientInstance) {
    const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
    const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

    if (!accountId || !accessKeyId || !secretAccessKey) {
      throw new Error('Cloudflare R2 credentials are not configured in environment variables.');
    }

    r2ClientInstance = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  return r2ClientInstance;
}

export async function uploadToR2({
  key,
  buffer,
  contentType,
}: {
  key: string;
  buffer: Buffer;
  contentType: string;
}) {
  const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  if (!bucket) throw new Error('CLOUDFLARE_R2_BUCKET_NAME is not configured');

  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });

  await client.send(command);

  const publicUrlBase = process.env.CLOUDFLARE_R2_PUBLIC_URL?.replace(/\/$/, '');
  const url = publicUrlBase ? `${publicUrlBase}/${key}` : `/api/storage?key=${encodeURIComponent(key)}`;

  return { key, url, size: buffer.length };
}

export async function deleteFromR2(key: string) {
  const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  if (!bucket) throw new Error('CLOUDFLARE_R2_BUCKET_NAME is not configured');

  const client = getR2Client();
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await client.send(command);
  return { success: true };
}

export async function listR2Files() {
  const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  if (!bucket) return [];

  const client = getR2Client();
  const command = new ListObjectsV2Command({
    Bucket: bucket,
  });

  const response = await client.send(command);
  return (response.Contents || []).map((item) => ({
    key: item.Key || '',
    size: item.Size || 0,
    lastModified: item.LastModified?.toISOString() || new Date().toISOString(),
  }));
}
