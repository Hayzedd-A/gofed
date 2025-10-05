import { put, del } from '@vercel/blob';

/**
 * Upload an image buffer to Vercel Blob Storage.
 * Returns { url, blob }
 */
export async function saveUploadedFile(file) {
  if (!file || !file.buffer) throw new Error('No file buffer provided');

  const safeName = file.originalname.replace(/\s+/g, '_');
  const filename = `${Date.now()}-${safeName}`;

  // Upload to Vercel Blob
  const blob = await put(`uploads/${filename}`, file.buffer, {
    access: 'public', // makes it publicly accessible via a URL
  });

  return { url: blob.url, filename, blob };
}

/**
 * Delete a file from Vercel Blob Storage
 */
export async function deleteFileSafe(blobUrl) {
  try {
    if (blobUrl) await del(blobUrl);
  } catch (err) {
    console.warn('Failed to delete blob:', err.message);
  }
}
