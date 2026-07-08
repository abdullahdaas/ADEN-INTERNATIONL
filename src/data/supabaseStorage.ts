import { createClient, SupabaseClient } from '@supabase/supabase-js';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

let envUrl = '';
let envKey = '';

// @ts-ignore
if (typeof import.meta !== 'undefined' && import.meta.env) {
  // @ts-ignore
  if (import.meta.env.VITE_SUPABASE_URL) envUrl = import.meta.env.VITE_SUPABASE_URL;
  // @ts-ignore
  if (import.meta.env.VITE_SUPABASE_ANON_KEY) envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
}

if (!envUrl && typeof process !== 'undefined' && process.env) {
  envUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  if (!envKey) {
    envKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  }
}

if (!envKey) {
  console.warn("⚠️ VITE_SUPABASE_ANON_KEY is missing from environment variables.");
}

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    if (!envUrl) {
      throw new Error('Supabase URL is missing. Please add VITE_SUPABASE_URL in settings.');
    }
    if (!envKey) {
      throw new Error('Supabase Anon Key is missing. Please add VITE_SUPABASE_ANON_KEY in settings.');
    }
    _supabase = createClient(envUrl, envKey);
  }
  return _supabase;
}

export { getSupabase };

export const BUCKET_NAME = 'property-images';

function getSafePropertyFolder(propertyId: string): string {
  return propertyId.replace(/[^a-zA-Z0-9_-]/g, '') || `property_${Date.now()}`;
}

function getFileExtension(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext) return ext;

  switch (file.type) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    default:
      return 'bin';
  }
}

function validateImageFile(file: File): void {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error(`Unsupported image type: ${file.type}`);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Image is too large. Maximum size is 10MB.');
  }
}

/**
 * Upload a single file to Supabase Storage
 */
export const uploadFileToSupabase = async (propertyId: string, file: File): Promise<string> => {
  if (!envUrl) {
    throw new Error('Supabase URL is missing. Please add VITE_SUPABASE_URL in settings.');
  }
  if (!envKey) {
    throw new Error('Supabase Anon Key is missing. Please add VITE_SUPABASE_ANON_KEY in settings.');
  }

  validateImageFile(file);

  const extension = getFileExtension(file);
  const uniqueId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const fileName = `${uniqueId}.${extension}`;
  const filePath = `properties/${getSafePropertyFolder(propertyId)}/${fileName}`;

  const { data, error } = await getSupabase().storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data: publicUrlData } = getSupabase().storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
};

/**
 * Batch upload up to 30 files concurrently with overall progress tracking.
 */
export const batchUploadToSupabase = async (
  propertyId: string,
  files: File[],
  onProgress?: (progress: number) => void
): Promise<string[]> => {
  const totalFiles = files.length;
  if (totalFiles === 0) return [];
  if (totalFiles > 30) {
    throw new Error('Cannot upload more than 30 files at once.');
  }

  let completed = 0;
  
  const uploadPromises = files.map(async (file) => {
    try {
      const url = await uploadFileToSupabase(propertyId, file);
      completed++;
      if (onProgress) {
        onProgress(Math.round((completed / totalFiles) * 100));
      }
      return url;
    } catch (error) {
      console.error(`Failed to upload file ${file.name}:`, error);
      throw error;
    }
  });

  return Promise.all(uploadPromises);
};

/**
 * Delete a file from Supabase Storage by its public URL.
 */
export const deleteFileFromSupabase = async (publicUrl: string): Promise<void> => {
  if (!publicUrl.includes(BUCKET_NAME)) return;

  try {
    const urlParts = publicUrl.split(`/public/${BUCKET_NAME}/`);
    if (urlParts.length === 2) {
      const filePath = decodeURIComponent(urlParts[1]);
      const { error } = await getSupabase().storage
        .from(BUCKET_NAME)
        .remove([filePath]);
        
      if (error) {
        console.error("Supabase delete error:", error);
      }
    }
  } catch (error) {
    console.error("Failed to delete file from Supabase storage:", error);
  }
};
