import { createClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://jwgcowzsslbidcnyphvs.supabase.co';
// A syntactically valid JWT dummy key to prevent "Invalid Compact JWS" crashes.
const DUMMY_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

let envUrl = '';
let envKey = '';

if (typeof process !== 'undefined' && process.env) {
  envUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  envKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
}

// @ts-ignore
if (typeof import.meta !== 'undefined' && import.meta.env) {
  // @ts-ignore
  if (import.meta.env.VITE_SUPABASE_URL) envUrl = import.meta.env.VITE_SUPABASE_URL;
  // @ts-ignore
  if (import.meta.env.VITE_SUPABASE_ANON_KEY) envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
}

const finalUrl = envUrl || FALLBACK_URL;
const finalKey = envKey || DUMMY_KEY;

if (!envKey) {
  console.warn("⚠️ VITE_SUPABASE_ANON_KEY is missing from environment variables.");
}

export const supabase = createClient(finalUrl, finalKey);

export const BUCKET_NAME = 'property-images';

/**
 * Upload a single file to Supabase Storage
 */
export const uploadFileToSupabase = async (propertyId: string, file: File): Promise<string> => {
  if (!envKey) {
    throw new Error('Supabase Anon Key is missing. Please add VITE_SUPABASE_ANON_KEY in settings.');
  }

  const extension = file.name.split('.').pop() || 'webp';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${extension}`;
  const filePath = `properties/${propertyId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

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
      const { error } = await supabase.storage
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
