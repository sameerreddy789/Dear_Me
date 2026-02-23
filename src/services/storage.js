import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'
import { MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES } from '../constants'

/**
 * Validates and uploads an image file to Firebase Storage.
 * @param {string} userId - The authenticated user's UID.
 * @param {string} entryId - The diary entry ID.
 * @param {File} file - The image file to upload.
 * @returns {Promise<string>} The download URL of the uploaded image.
 */
export async function uploadImage(userId, entryId, file) {
  if (!file) {
    throw new Error('No file provided')
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Image must be under 5MB')
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Please upload a JPEG, PNG, GIF, or WebP image')
  }

  const storagePath = `images/${userId}/${entryId}/${file.name}`
  const storageRef = ref(storage, storagePath)

  const snapshot = await uploadBytes(storageRef, file)
  const downloadURL = await getDownloadURL(snapshot.ref)

  return downloadURL
}

/**
 * Converts a data URL to a Blob and uploads it as a drawing PNG.
 * @param {string} userId - The authenticated user's UID.
 * @param {string} entryId - The diary entry ID.
 * @param {string} dataURL - The canvas data URL (e.g. from toDataURL()).
 * @returns {Promise<string>} The download URL of the uploaded drawing.
 */
export async function uploadDrawing(userId, entryId, dataURL) {
  const response = await fetch(dataURL)
  const blob = await response.blob()

  const storagePath = `drawings/${userId}/${entryId}.png`
  const storageRef = ref(storage, storagePath)

  const snapshot = await uploadBytes(storageRef, blob)
  const downloadURL = await getDownloadURL(snapshot.ref)

  return downloadURL
}
