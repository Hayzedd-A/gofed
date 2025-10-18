import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
  timeout: 10000, // 60 seconds timeout
});

/**
 * Upload an image buffer to Cloudinary.
 * Returns { url, public_id }
 */
export async function saveUploadedFile(file) {
  if (!file || !file.buffer) throw new Error('No file buffer provided');

  const safeName = file.originalname.replace(/\s+/g, '_');
  const filename = `${Date.now()}-${safeName}`;

  try {
    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'uploads',
          public_id: filename,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(file.buffer);
    });

    return { url: result.secure_url, public_id: result.public_id };
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
}

/**
 * Delete a file from Cloudinary
 */
export async function deleteFileSafe(publicId) {
  try {
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (err) {
    console.warn('Failed to delete from Cloudinary:', err.message);
  }
}
