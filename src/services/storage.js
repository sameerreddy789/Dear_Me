import { MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES } from '../constants'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`

/**
 * Uploads a file to Cloudinary using an unsigned upload preset.
 * @param {File|Blob} file - The file to upload
 * @param {string} folder - The folder path in Cloudinary (e.g. "images/userId/entryId")
 * @returns {Promise<string>} The secure download URL
 */
async function uploadToCloudinary(file, folder) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', folder)

  const response = await fetch(UPLOAD_URL, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || 'Upload failed')
  }

  const data = await response.json()
  return data.secure_url
}

/**
 * Validates and uploads an image file to Cloudinary.
 * @param {string} userId - The authenticated user's UID.
 * @param {string} entryId - The diary entry ID.
 * @param {File} file - The image file to upload.
 * @returns {Promise<string>} The secure download URL.
 */
export async function uploadImage(userId, entryId, file) {
  if (!file) throw new Error('No file provided')

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Image must be under 5MB')
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Please upload a JPEG, PNG, GIF, or WebP image')
  }

  return uploadToCloudinary(file, `dearme/images/${userId}/${entryId}`)
}

/**
 * Converts a data URL to a Blob and uploads it as a drawing PNG to Cloudinary.
 * @param {string} userId - The authenticated user's UID.
 * @param {string} entryId - The diary entry ID.
 * @param {string} dataURL - The canvas data URL.
 * @returns {Promise<string>} The secure download URL.
 */
export async function uploadDrawing(userId, entryId, dataURL) {
  const response = await fetch(dataURL)
  const blob = await response.blob()

  return uploadToCloudinary(blob, `dearme/drawings/${userId}/${entryId}`)
}
