import { supabase } from "@/lib/supabase"
import type { Photo } from "@/types"

export const PHOTOS_BUCKET = "photos"

const SIGNED_URL_TTL_SECONDS = 3600

export type GalleryPhoto = Photo & {
  url: string
  last_modified: string
  created_at: string
  name: string
}

export type PhotoMetadata = {
  authorName: string
  name?: string
  lastModified?: string
}

function buildPhotoPath(file: File): string {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80)
  return `${Date.now()}-${crypto.randomUUID()}-${safeName}`
}

export async function uploadPhoto(file: File, metadata: PhotoMetadata) {
  const path = buildPhotoPath(file)
  const { data, error } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    })

  if (error) {
    return { data, error, path }
  }

  const { error: insertError } = await supabase.from("photos").insert({
    storage_path: path,
    author_name: metadata.authorName.trim(),
    name: metadata.name,
    last_modified: metadata.lastModified,
  })

  if (insertError) {
    await supabase.storage.from(PHOTOS_BUCKET).remove([path])
    return { data: null, error: insertError, path }
  }

  return { data, error: null, path }
}

export async function listGalleryPhotos(): Promise<{
  photos: GalleryPhoto[]
  error: Error | null
}> {
  const { data: rows, error: listError } = await supabase
    .from("photos")
    .select("id, storage_path, author_name, created_at, last_modified, name")
    .order("created_at", { ascending: false })

  if (listError) {
    return { photos: [], error: listError }
  }

  const records = (rows ?? []) as Photo[]
  if (records.length === 0) {
    return { photos: [], error: null }
  }

  const paths = records.map((photo) => photo.storage_path)
  const { data: signed, error: signError } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS)

  if (signError) {
    return { photos: [], error: signError }
  }

  const urlByPath = new Map(
    (signed ?? [])
      .filter((item) => item.signedUrl && item.path)
      .map((item) => [item.path!, item.signedUrl!]),
  )

  const photos = records
    .map((photo) => {
      const url = urlByPath.get(photo.storage_path)
      if (!url) return null
      return { ...photo, url }
    })
    .filter((photo): photo is GalleryPhoto => photo !== null)

  return { photos, error: null }
}
