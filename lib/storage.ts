import { createClient } from '@/lib/supabase/client'

const BUCKET_NAME = 'generations'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
]

export type ImageType = 'recent' | 'younger' | 'output'

export type UploadResult = {
  path: string
  url: string
}

export type UploadError = {
  message: string
  code: 'FILE_TOO_LARGE' | 'INVALID_TYPE' | 'UPLOAD_FAILED' | 'NOT_AUTHENTICATED'
}

/**
 * Validates a file before upload
 */
export const validateFile = (file: File): UploadError | null => {
  if (file.size > MAX_FILE_SIZE) {
    return {
      message: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
      code: 'FILE_TOO_LARGE',
    }
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      message: 'File type not supported. Please use JPEG, PNG, WebP, GIF, or HEIC.',
      code: 'INVALID_TYPE',
    }
  }

  return null
}

/**
 * Generates a unique file path for storage
 * Format: {userId}/{type}_{timestamp}.{ext}
 */
const generateFilePath = (userId: string, type: ImageType, file: File): string => {
  const timestamp = Date.now()
  const extension = file.name.split('.').pop() || 'jpg'
  return `${userId}/${type}_${timestamp}.${extension}`
}

/**
 * Uploads an image to Supabase Storage
 */
export const uploadImage = async (
  file: File,
  userId: string,
  type: ImageType
): Promise<{ success: true; data: UploadResult } | { success: false; error: UploadError }> => {
  // Validate file first
  const validationError = validateFile(file)
  if (validationError) {
    return { success: false, error: validationError }
  }

  const supabase = createClient()
  const filePath = generateFilePath(userId, type, file)

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: {
        message: error.message || 'Failed to upload image',
        code: 'UPLOAD_FAILED',
      },
    }
  }

  const url = getPublicUrl(filePath)

  return {
    success: true,
    data: {
      path: filePath,
      url,
    },
  }
}

/**
 * Gets the public URL for an image in storage
 */
export const getPublicUrl = (path: string): string => {
  const supabase = createClient()
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Deletes an image from storage
 */
export const deleteImage = async (path: string): Promise<boolean> => {
  const supabase = createClient()
  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path])

  if (error) {
    console.error('Delete error:', error)
    return false
  }

  return true
}

/**
 * Deletes multiple images from storage
 */
export const deleteImages = async (paths: string[]): Promise<boolean> => {
  if (paths.length === 0) return true

  const supabase = createClient()
  const { error } = await supabase.storage.from(BUCKET_NAME).remove(paths)

  if (error) {
    console.error('Delete error:', error)
    return false
  }

  return true
}

