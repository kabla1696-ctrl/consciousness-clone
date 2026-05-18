import { supabase } from './supabase-browser'

export const STORAGE_BUCKETS = {
  avatars: 'avatars',
  memories: 'memories',
  attachments: 'attachments',
} as const

export type BucketName = keyof typeof STORAGE_BUCKETS

/**
 * Upload a file to Supabase Storage.
 * Returns the path of the uploaded file on success.
 */
export async function uploadFile(
  bucket: BucketName,
  path: string,
  file: File | Blob,
  options?: { upsert?: boolean; contentType?: string }
): Promise<{ data: { path: string } | null; error: string | null }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: options?.upsert ?? true,
        contentType: options?.contentType ?? file.type,
      })

    if (error) {
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed'
    return { data: null, error: message }
  }
}

/**
 * Get the public URL for a file in Supabase Storage.
 */
export function getPublicUrl(bucket: BucketName, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Delete a file from Supabase Storage.
 */
export async function deleteFile(
  bucket: BucketName,
  paths: string | string[]
): Promise<{ error: string | null }> {
  try {
    const pathList = Array.isArray(paths) ? paths : [paths]
    const { error } = await supabase.storage.from(bucket).remove(pathList)

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Delete failed'
    return { error: message }
  }
}

/**
 * List files in a bucket under a given prefix.
 */
export async function listFiles(
  bucket: BucketName,
  prefix?: string,
  options?: { limit?: number; offset?: number }
): Promise<{ data: { name: string; id: string | null; updated_at: string | null }[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase.storage.from(bucket).list(prefix ?? '', {
      limit: options?.limit ?? 100,
      offset: options?.offset ?? 0,
      sortBy: { column: 'updated_at', order: 'desc' },
    })

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: data?.map(f => ({ name: f.name, id: f.id ?? '', updated_at: f.updated_at ?? '' })) ?? null, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'List failed'
    return { data: null, error: message }
  }
}
