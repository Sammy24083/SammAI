import { supabase, isLiveSupabaseConfigured } from './supabase';

export const BUCKETS = {
  PRODUCTS: 'Product_images',
  BANNERS: 'banner',
};

// High-resolution reliable fallback images for AI tools
export const FALLBACK_PRODUCT_IMAGE = '/images/gemini-pro.svg';

/**
 * Returns a guaranteed valid image URL, replacing broken/missing URLs with a clean tech visual
 */
export function getSafeImageUrl(url?: string | null, productNameOrSlug?: string): string {
  const identifier = (productNameOrSlug || '').toLowerCase();

  // If identified by name or slug
  if (identifier.includes('chatgpt')) {
    return '/images/chatgpt-plus.svg';
  }
  if (identifier.includes('gemini')) {
    return '/images/gemini-pro.svg';
  }
  if (identifier.includes('capcut')) {
    return '/images/capcut-pro.svg';
  }

  // Automatic translation for previous generic Unsplash placeholder IDs
  if (url) {
    if (url.includes('677442136019-21780efad99a')) {
      return '/images/chatgpt-plus.svg';
    }
    if (url.includes('1574717024653-61fd2cf4d44d') || url.includes('1536240478700-b869070f9279')) {
      return '/images/capcut-pro.svg';
    }
  }

  if (!url || typeof url !== 'string' || url.trim() === '') {
    return FALLBACK_PRODUCT_IMAGE;
  }
  return url;
}

/**
 * Converts a file to a high-quality, lightweight base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Uploads an image file to Supabase Storage with automatic fallback to persistent Base64
 */
export async function uploadImageToSupabase(
  file: File,
  bucketName: string = BUCKETS.PRODUCTS
): Promise<string> {
  try {
    if (isLiveSupabaseConfigured && supabase) {
      const fileExt = file.name.split('.').pop() || 'png';
      const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

      // Try uploading to user's specified bucket names
      const candidateBuckets = [
        bucketName,
        bucketName.toLowerCase(),
        'Product_images',
        'product_images',
        'product-images'
      ];

      for (const bucket of candidateBuckets) {
        try {
          const { data, error } = await supabase.storage
            .from(bucket)
            .upload(cleanFileName, file, {
              cacheControl: '3600',
              upsert: true,
            });

          if (!error && data) {
            const { data: publicData } = supabase.storage
              .from(bucket)
              .getPublicUrl(cleanFileName);

            if (publicData?.publicUrl) {
              return publicData.publicUrl;
            }
          }
        } catch (e) {
          // Continue to next candidate
        }
      }
    }
  } catch (err) {
    console.warn('Direct bucket upload failed, using persistent base64 representation:', err);
  }

  // Guaranteed fallback: convert image to persistent DataURL so it NEVER breaks
  return await fileToBase64(file);
}
