import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Upload a URL (Replicate/IDM-VTON/Runway) to Cloudinary for permanent storage.
 * Falls back to the original URL if Cloudinary is not configured or upload fails.
 */
export async function uploadToPermanentStorage(url: string, folder = 'shootly'): Promise<string> {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.warn('[Cloudinary] Not configured — skipping permanent storage, using original URL')
    return url
  }

  try {
    const result = await cloudinary.uploader.upload(url, {
      folder,
      resource_type: 'auto', // handles both images and videos
      fetch_format: 'auto',
      quality: 'auto:best',
    })
    console.log('[Cloudinary] Uploaded:', result.secure_url)
    return result.secure_url
  } catch (err: any) {
    console.warn('[Cloudinary] Upload failed, using original URL:', err.message)
    return url
  }
}
