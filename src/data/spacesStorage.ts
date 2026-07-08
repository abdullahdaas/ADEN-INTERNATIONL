import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomBytes } from 'crypto';

function normalizeEndpoint(value: string | undefined): string {
  if (!value) return '';
  return value.replace(/^https?:\/\//, '').replace(/\/+$/, '');
}

function getEnvVar(name: string, fallbackName?: string): string {
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[name]) return process.env[name];
    if (fallbackName && process.env[fallbackName]) return process.env[fallbackName];
  }
  return '';
}

function getSpacesConfig() {
  const endpoint = normalizeEndpoint(getEnvVar('DO_SPACES_ENDPOINT', 'VITE_DO_SPACES_ENDPOINT'));
  const region = getEnvVar('DO_SPACES_REGION', 'VITE_DO_SPACES_REGION');
  const bucket = getEnvVar('DO_SPACES_BUCKET', 'VITE_DO_SPACES_BUCKET');
  const accessKeyId = getEnvVar('DO_SPACES_KEY', 'VITE_DO_SPACES_KEY');
  const secretAccessKey = getEnvVar('DO_SPACES_SECRET', 'VITE_DO_SPACES_SECRET');

  if (!endpoint || !region || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'DigitalOcean Spaces configuration is missing. Please set DO_SPACES_ENDPOINT, DO_SPACES_REGION, DO_SPACES_BUCKET, DO_SPACES_KEY, and DO_SPACES_SECRET.',
    );
  }

  return { endpoint, region, bucket, accessKeyId, secretAccessKey };
}

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    const { endpoint, region, accessKeyId, secretAccessKey } = getSpacesConfig();
    s3Client = new S3Client({
      region,
      endpoint: `https://${endpoint}`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: false,
    });
  }
  return s3Client;
}

function getPublicUrl(key: string): string {
  const { endpoint, bucket } = getSpacesConfig();
  return `https://${bucket}.${endpoint}/${encodeURIComponent(key)}`;
}

function validateImageContentType(contentType: string) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowed.includes(contentType)) {
    throw new Error(`Unsupported image type: ${contentType}. Allowed types are jpeg, png, webp, gif.`);
  }
}

function makeObjectKey(propertyId: string, originalName: string) {
  const extension = originalName.split('.').pop()?.toLowerCase() || 'webp';
  const sanitized = originalName
    .replace(/[^a-zA-Z0-9-_\.]/g, '-')
    .replace(/-+/g, '-');
  const randomSuffix = randomBytes(4).toString('hex');
  return `properties/${propertyId}/${Date.now()}-${randomSuffix}-${sanitized}`;
}

export async function uploadFileToSpaces(
  propertyId: string,
  fileName: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  validateImageContentType(contentType);
  const { bucket } = getSpacesConfig();
  const key = makeObjectKey(propertyId, fileName);

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read',
    CacheControl: 'public, max-age=31536000',
  });

  await getS3Client().send(command);
  return getPublicUrl(key);
}

export async function deleteFileFromSpaces(publicUrl: string): Promise<void> {
  const { bucket, endpoint } = getSpacesConfig();
  try {
    const url = new URL(publicUrl);
    const expectedHost = `${bucket}.${endpoint}`;
    if (!url.host.endsWith(expectedHost)) {
      console.warn('deleteFileFromSpaces skipped because the URL does not belong to configured DO Spaces bucket.');
      return;
    }

    const key = url.pathname.replace(/^\/+/, '');
    if (!key) return;

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    await getS3Client().send(command);
  } catch (error) {
    console.error('Failed to delete Spaces object:', error);
  }
}
