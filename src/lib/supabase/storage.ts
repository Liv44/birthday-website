import { supabase } from "@/lib/supabase"
import type { Photo } from "@/types"

export const PHOTOS_BUCKET = "photos"

const SIGNED_URL_TTL_SECONDS = 3600

// Taille des vignettes affichées dans la grille de la galerie.
// Adapte ces valeurs si tes cases de grille changent de taille.
const THUMBNAIL_WIDTH = 400
const THUMBNAIL_HEIGHT = 400
const THUMBNAIL_QUALITY = 70

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

export type ListGalleryPhotosOptions = {
  offset?: number
  limit?: number
}

/** PostgREST 416 : l'offset demandé dépasse le nombre de lignes. Ce n'est pas une panne. */
function isRangeNotSatisfiable(error: { code?: string; message?: string } | null): boolean {
  return (
    error?.code === "PGRST103" ||
    error?.message === "Requested range not satisfiable"
  )
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

  // Préchauffe le cache CDN de la vignette tout de suite après l'upload,
  // sans bloquer la réponse à l'utilisateur qui vient d'uploader. Comme ça,
  // quand un invité ouvrira la galerie plus tard, la vignette 400x400 est
  // déjà générée et servie depuis le cache au lieu d'être calculée à la volée.
  void warmThumbnailCache(path)

  return { data, error: null, path }
}

async function warmThumbnailCache(storagePath: string) {
  try {
    await supabase.storage.from(PHOTOS_BUCKET).createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS, {
      transform: {
        width: THUMBNAIL_WIDTH,
        height: THUMBNAIL_HEIGHT,
        resize: "cover",
        quality: THUMBNAIL_QUALITY,
      },
    })
    // On ignore volontairement le résultat : le seul but de cet appel est de
    // déclencher la génération de la vignette côté serveur pour la mettre en cache.
  } catch {
    // Un échec ici n'est pas grave : la vignette sera simplement générée
    // au premier chargement de la galerie, comme avant cette optimisation.
  }
}

/**
 * Liste paginée des photos pour la grille de la galerie.
 * Les URLs renvoyées pointent vers des vignettes redimensionnées
 * (via le Smart CDN de Supabase) et non vers les fichiers originaux,
 * ce qui réduit fortement le poids chargé par la grille.
 *
 * Nécessite le plan Pro (ou supérieur) de Supabase pour les transformations d'image.
 */
export async function listGalleryPhotos(
  options: ListGalleryPhotosOptions = {},
): Promise<{
  photos: GalleryPhoto[]
  error: Error | null
  total: number | null
}> {
  const { offset = 0, limit = 24 } = options

  const { data: rows, error: listError, count } = await supabase
    .from("photos")
    .select("id, storage_path, author_name, created_at, last_modified, name", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (listError) {
    if (isRangeNotSatisfiable(listError)) {
      return { photos: [], error: null, total: offset }
    }
    return { photos: [], error: listError, total: null }
  }

  const records = (rows ?? []) as Photo[]
  if (records.length === 0) {
    return { photos: [], error: null, total: count ?? 0 }
  }

  // Note : createSignedUrls (pluriel) ne supporte pas l'option `transform` côté
  // supabase-js (limitation connue de la librairie). Seule la version singulier
  // createSignedUrl l'accepte, donc on génère les vignettes en parallèle.
  const signedResults = await Promise.all(
    records.map(async (photo) => {
      const { data, error: signError } = await supabase.storage
        .from(PHOTOS_BUCKET)
        .createSignedUrl(photo.storage_path, SIGNED_URL_TTL_SECONDS, {
          transform: {
            width: THUMBNAIL_WIDTH,
            height: THUMBNAIL_HEIGHT,
            resize: "cover",
            quality: THUMBNAIL_QUALITY,
          },
        })

      if (signError || !data?.signedUrl) {
        return null
      }

      return { ...photo, url: data.signedUrl }
    }),
  )

  const photos = signedResults.filter((photo): photo is GalleryPhoto => photo !== null)

  return { photos, error: null, total: count ?? 0 }
}

/**
 * Récupère l'URL signée en pleine résolution d'une seule photo.
 * À utiliser uniquement quand l'utilisateur ouvre une photo en grand
 * (lightbox), pas pour la grille.
 */
export async function getFullResolutionUrl(
  storagePath: string,
): Promise<{ url: string | null; error: Error | null }> {
  const { data, error } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS)

  if (error) {
    return { url: null, error }
  }

  return { url: data?.signedUrl ?? null, error: null }
}

/**
 * Récupère toutes les photos en pleine résolution, pour le téléchargement
 * en zip. Pagine en interne par lots pour contourner la limite de lignes
 * de Postgrest.
 */
export async function listAllGalleryPhotos(): Promise<{
  photos: GalleryPhoto[]
  error: Error | null
}> {
  const BATCH_SIZE = 100
  const allRecords: Photo[] = []
  let offset = 0

  while (true) {
    const { data: rows, error: listError } = await supabase
      .from("photos")
      .select("id, storage_path, author_name, created_at, last_modified, name")
      .order("created_at", { ascending: false })
      .range(offset, offset + BATCH_SIZE - 1)

    if (listError) {
      if (isRangeNotSatisfiable(listError)) break
      return { photos: [], error: listError }
    }

    const batch = (rows ?? []) as Photo[]
    allRecords.push(...batch)

    if (batch.length < BATCH_SIZE) break
    offset += BATCH_SIZE
  }

  if (allRecords.length === 0) {
    return { photos: [], error: null }
  }

  const paths = allRecords.map((photo) => photo.storage_path)
  // Pas de transform ici : le zip doit contenir les fichiers en pleine qualité.
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

  const photos = allRecords
    .map((photo) => {
      const url = urlByPath.get(photo.storage_path)
      if (!url) return null
      return { ...photo, url }
    })
    .filter((photo): photo is GalleryPhoto => photo !== null)

  return { photos, error: null }
}