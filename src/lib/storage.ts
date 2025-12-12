import { createSupabaseClient } from './supabase-client'

const BUCKET_NAME = 'Portfolio Images'

/**
 * Upload an image to Supabase Storage
 * @param file - The image file to upload
 * @param folder - Optional folder path within the bucket (e.g., 'projects', 'profiles')
 * @returns The public URL of the uploaded image or null on error
 */
export async function uploadImage(file: File, folder: string = 'projects'): Promise<string | null> {
  try {
    const supabase = createSupabaseClient()
    
    // Generate unique filename with timestamp
    const timestamp = Date.now()
    const fileExt = file.name.split('.').pop()
    const fileName = `${folder}/${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`

    console.log('📤 Uploading image:', fileName)

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('❌ Upload error:', error)
      return null
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path)

    console.log('✅ Image uploaded successfully:', publicUrl)
    return publicUrl

  } catch (error) {
    console.error('❌ Image upload failed:', error)
    return null
  }
}

/**
 * Delete an image from Supabase Storage
 * @param imageUrl - The full public URL of the image to delete
 * @returns true if deletion was successful, false otherwise
 */
export async function deleteImage(imageUrl: string): Promise<boolean> {
  try {
    if (!imageUrl) return false

    const supabase = createSupabaseClient()
    
    // Extract the file path from the URL
    // URL format: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
    const urlParts = imageUrl.split(`/storage/v1/object/public/${BUCKET_NAME}/`)
    if (urlParts.length < 2) {
      console.error('❌ Invalid image URL format:', imageUrl)
      return false
    }

    const filePath = urlParts[1]
    console.log('🗑️ Deleting image:', filePath)

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath])

    if (error) {
      console.error('❌ Delete error:', error)
      return false
    }

    console.log('✅ Image deleted successfully')
    return true

  } catch (error) {
    console.error('❌ Image deletion failed:', error)
    return false
  }
}

/**
 * Replace an existing image with a new one
 * @param oldImageUrl - The URL of the image to replace
 * @param newFile - The new image file
 * @param folder - Optional folder path
 * @returns The public URL of the new image or null on error
 */
export async function replaceImage(
  oldImageUrl: string | null | undefined, 
  newFile: File, 
  folder: string = 'projects'
): Promise<string | null> {
  try {
    // Upload new image first
    const newImageUrl = await uploadImage(newFile, folder)
    
    if (!newImageUrl) {
      return null
    }

    // Delete old image if it exists
    if (oldImageUrl) {
      await deleteImage(oldImageUrl)
    }

    return newImageUrl

  } catch (error) {
    console.error('❌ Image replacement failed:', error)
    return null
  }
}
