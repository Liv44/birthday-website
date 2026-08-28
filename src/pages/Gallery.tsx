import { useCallback, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { isGalleryZipAvailable } from "@/constants/party"
import { isSupabaseConfigured, SUPABASE_CONFIG_HELP } from "@/lib/supabase"
import {
  getFullResolutionUrl,
  listAllGalleryPhotos,
  listGalleryPhotos,
  type GalleryPhoto,
} from "@/lib/supabase/storage"
import { cn } from "@/lib/utils"
import JSZip from "jszip"
import { DownloadIcon, UploadIcon } from "lucide-react"

const EXTENSION_FILE_REGEX = /\.[0-9a-z]+$/i
const PAGE_SIZE = 24

export default function Gallery() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [downloadingZip, setDownloadingZip] = useState(false)

  // URL en pleine résolution de la photo actuellement ouverte en lightbox.
  // Tant qu'elle n'est pas chargée, on affiche la vignette en attendant.
  const [fullResUrl, setFullResUrl] = useState<string | null>(null)
  const [fullResLoading, setFullResLoading] = useState(false)

  const pageRef = useRef(0)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const loadingMoreRef = useRef(false)

  /** Renvoie le nombre de photos récupérées, pour savoir si on peut avancer. */
  const fetchPage = useCallback(async (page: number): Promise<number> => {
    if (!isSupabaseConfigured()) {
      setError(SUPABASE_CONFIG_HELP)
      setHasMore(false)
      return 0
    }

    const offset = page * PAGE_SIZE
    const { photos: fetched, error: fetchError, total } = await listGalleryPhotos({
      offset,
      limit: PAGE_SIZE,
    })

    if (fetchError) {
      setError(fetchError.message)
      setHasMore(false)
      return 0
    }

    setPhotos((prev) => (page === 0 ? fetched : [...prev, ...fetched]))
    setHasMore(total !== null ? offset + fetched.length < total : false)
    setError(null)
    return fetched.length
  }, [])

  const loadMore = useCallback(async (): Promise<number> => {
    // Le ref est synchrone : évite deux chargements simultanés quand la sentinelle
    // et la flèche « suivante » se déclenchent au même moment.
    if (loadingMoreRef.current) return 0
    loadingMoreRef.current = true
    setLoadingMore(true)

    try {
      const count = await fetchPage(pageRef.current + 1)
      if (count > 0) pageRef.current += 1
      return count
    } finally {
      loadingMoreRef.current = false
      setLoadingMore(false)
    }
  }, [fetchPage])

  // chargement initial
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      pageRef.current = 0
      await fetchPage(0)
      if (!cancelled) setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [fetchPage])

  // scroll infini : observe une sentinelle en bas de la grille
  useEffect(() => {
    if (!hasMore || loading) return
    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) void loadMore()
      },
      { rootMargin: "200px" },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [hasMore, loading, loadingMore, loadMore])

  // Sur la dernière photo chargée, on va chercher la page suivante avant d'avancer.
  const goToNext = useCallback(async () => {
    if (selectedIndex === null) return

    if (selectedIndex < photos.length - 1) {
      setSelectedIndex(selectedIndex + 1)
      return
    }

    if (!hasMore) return
    const count = await loadMore()
    if (count > 0) setSelectedIndex(selectedIndex + 1)
  }, [selectedIndex, photos.length, hasMore, loadMore])

  const goToPrevious = useCallback(() => {
    setSelectedIndex((current) => (current === null ? null : Math.max(current - 1, 0)))
  }, [])

  const canGoNext = selectedIndex !== null && (selectedIndex < photos.length - 1 || hasMore)

  useEffect(() => {
    if (selectedIndex === null) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSelectedIndex(null)
        return
      }
      if (e.key === "ArrowRight") void goToNext()
      if (e.key === "ArrowLeft") goToPrevious()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [selectedIndex, goToNext, goToPrevious])

  const selectedPhoto = selectedIndex !== null ? photos[selectedIndex] : null
  const selectedPhotoDate = selectedPhoto?.last_modified
    ? new Date(selectedPhoto?.last_modified).toLocaleDateString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null

  // Charge la pleine résolution uniquement quand une photo est ouverte en grand.
  useEffect(() => {
    if (!selectedPhoto) {
      setFullResUrl(null)
      return
    }

    let cancelled = false
    setFullResUrl(null)
    setFullResLoading(true)

    void getFullResolutionUrl(selectedPhoto.storage_path).then(({ url, error: fetchError }) => {
      if (cancelled) return
      if (fetchError || !url) {
        // en cas d'échec, on reste sur la vignette déjà affichée
        setFullResUrl(null)
      } else {
        setFullResUrl(url)
      }
      setFullResLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [selectedPhoto])

  const handleDownloadGallery = async () => {
    setDownloadingZip(true)
    try {
      const { photos: allPhotos, error: fetchError } = await listAllGalleryPhotos()

      if (fetchError) {
        setError(fetchError.message)
        return
      }

      const zip = new JSZip()

      for (const photo of allPhotos) {
        const response = await fetch(photo.url)
        const blob = await response.blob()

        const fileExtension = photo.storage_path.match(EXTENSION_FILE_REGEX)?.[0]
        const fileName = photo.name ?? `${new Date(photo.created_at).toISOString()}${fileExtension}`

        zip.file(fileName, blob)
      }

      const content = await zip.generateAsync({ type: "blob" })
      const url = URL.createObjectURL(content)
      const link = document.createElement("a")
      link.href = url
      link.download = "gallery26ans-olivia.zip"
      link.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloadingZip(false)
    }
  }

  async function downloadPhoto(url: string, filename: string) {
    const response = await fetch(url)
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = blobUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()

    URL.revokeObjectURL(blobUrl)
  }

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-display text-3xl font-semibold">Galerie photos</h1>
        <p className="max-w-md text-muted-foreground">
          Partagez vos souvenirs de la journée !
        </p>
        <div className="flex md:flex-row flex-col gap-2">
          <Button render={<Link to="/add-photos" />} variant="default" size="lg">
            <UploadIcon data-icon="inline-start" />
            Ajouter des photos
          </Button>
          {isGalleryZipAvailable() && (
            <Button
              variant="default"
              size="lg"
              onClick={handleDownloadGallery}
              disabled={downloadingZip}
            >
              <DownloadIcon data-icon="inline-start" />
              {downloadingZip ? "Préparation du zip…" : "Télécharger la galerie"}
            </Button>
          )}
        </div>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Chargement de la galerie…
        </p>
      )}

      {error && (
        <p className="max-w-md text-center text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && photos.length === 0 && (
        <p className="max-w-md text-center text-sm text-muted-foreground">
          Aucune photo pour l’instant. Sois le·a premier·ère à en partager !
        </p>
      )}

      {photos.length > 0 && (
        <div className="grid w-full max-w-4xl grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 md:gap-3">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className="group relative aspect-square overflow-hidden rounded-lg border border-[#FFDCCD] bg-muted focus-visible:ring-2 focus-visible:ring-[#FA009D] focus-visible:outline-none"
            >
              <img
                src={photo.url}
                alt={`Photo de ${photo.author_name}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-left">
                <p className="truncate text-xs font-medium text-white">{photo.author_name}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {hasMore && !loading && (
        <div ref={sentinelRef} className="h-8 w-full">
          {loadingMore && (
            <p className="text-center text-xs text-muted-foreground">Chargement…</p>
          )}
        </div>
      )}

      {selectedPhoto && selectedIndex !== null && (
        <div
          className="fixed inset-0 z-999 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Photo en grand format"
        >
          <button
            type="button"
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
            onClick={() => setSelectedIndex(null)}
            aria-label="Fermer"
          >
            ×
          </button>

          {selectedIndex > 0 && (
            <button
              type="button"
              className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation()
                goToPrevious()
              }}
              aria-label="Photo précédente"
            >
              ‹
            </button>
          )}

          {canGoNext && (
            <button
              type="button"
              className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-white hover:bg-white/20 disabled:opacity-50"
              onClick={(e) => {
                e.stopPropagation()
                void goToNext()
              }}
              disabled={loadingMore}
              aria-label="Photo suivante"
            >
              {loadingMore && selectedIndex === photos.length - 1 ? "…" : "›"}
            </button>
          )}

          <div
            className="flex max-h-[85vh] max-w-full px-12 md:px-0 flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Affiche la vignette immédiatement (déjà en cache depuis la grille),
                puis remplace par la pleine résolution une fois chargée. */}
            <div className="relative">
              <img
                src={fullResUrl ?? selectedPhoto.url}
                alt={`Photo de ${selectedPhoto.author_name}`}
                className={cn("max-h-[75vh] max-w-full rounded-lg object-contain")}
              />
              {fullResLoading && !fullResUrl && (
                <div className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-1 text-[10px] text-white">
                  Chargement HD…
                </div>
              )}
            </div>
            <div className="rounded-lg bg-black/50 px-4 py-2 text-center text-white flex flex-row w-full max-w-64 justify-between">
              <div className="flex flex-col justify-start items-start">
                <p className="font-medium truncate max-w-42 overflow-hidden text-nowrap">
                  {selectedPhoto.author_name}
                </p>
                {selectedPhoto.last_modified && (
                  <p className="text-xs text-white">{selectedPhotoDate}</p>
                )}
              </div>
              <Button
                onClick={() =>
                  downloadPhoto(
                    fullResUrl ?? selectedPhoto.url,
                    selectedPhoto.author_name + ".jpg",
                  )
                }
                variant={"secondary"}
                size={"icon-lg"}
              >
                <span className="sr-only">Télécharger</span>
                <DownloadIcon />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}