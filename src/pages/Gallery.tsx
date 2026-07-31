import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { isSupabaseConfigured, SUPABASE_CONFIG_HELP } from "@/lib/supabase"
import { listGalleryPhotos, type GalleryPhoto } from "@/lib/supabase/storage"
import { cn } from "@/lib/utils"

export default function Gallery() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const fetchPhotos = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setError(SUPABASE_CONFIG_HELP)
      setPhotos([])
      return
    }

    const { photos: fetched, error: fetchError } = await listGalleryPhotos()
    if (fetchError) {
      setError(fetchError.message)
      setPhotos([])
      return
    }

    setPhotos(fetched)
    setError(null)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      await fetchPhotos()
      if (!cancelled) setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [fetchPhotos])

  useEffect(() => {
    if (selectedIndex === null) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSelectedIndex(null)
        return
      }
      if (e.key === "ArrowRight") {
        setSelectedIndex((current) =>
          current === null ? null : Math.min(current + 1, photos.length - 1),
        )
      }
      if (e.key === "ArrowLeft") {
        setSelectedIndex((current) =>
          current === null ? null : Math.max(current - 1, 0),
        )
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [selectedIndex, photos.length])

  const selectedPhoto = selectedIndex !== null ? photos[selectedIndex] : null

  const handleDownloadGallery = async () => {
    // download the gallery as a zip file
    // const zip = new JSZi()
    // photos.forEach(photo => {
    //   zip.file(photo.path, photo.url)
    // })
    // const content = await zip.generateAsync({ type: "blob" })
    // const url = URL.createObjectURL(content)
    // const link = document.createElement("a")
    // link.href = url
    // link.download = "gallery.zip"
    // link.click()
  } 

  async function downloadPhoto(url: string, filename: string) {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
  
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  
    URL.revokeObjectURL(blobUrl);
  }

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold">Galerie photos</h1>
        <p className="max-w-md text-muted-foreground">
          Les souvenirs partagés par les invités.
        </p>
        <Button render={<Link to="/add-photos" />} variant="outline" size="sm">
          Ajouter des photos
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownloadGallery}>
            Télécharger la galerie
        </Button>
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
              className="group relative aspect-square overflow-hidden rounded-lg border border-[#FFDCCD] bg-white focus-visible:ring-2 focus-visible:ring-[#FA009D] focus-visible:outline-none"
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

      {selectedPhoto && selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
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
                setSelectedIndex(selectedIndex - 1)
              }}
              aria-label="Photo précédente"
            >
              ‹
            </button>
          )}

          {selectedIndex < photos.length - 1 && (
            <button
              type="button"
              className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedIndex(selectedIndex + 1)
              }}
              aria-label="Photo suivante"
            >
              ›
            </button>
          )}

          <div className="flex max-h-[85vh] max-w-full flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedPhoto.url}
              alt={`Photo de ${selectedPhoto.author_name}`}
              className={cn("max-h-[75vh] max-w-full rounded-lg object-contain")}
            />
            <div className="rounded-lg bg-black/50 px-4 py-2 text-center text-white">
              <p className="font-medium">{selectedPhoto.author_name}</p>
              {selectedPhoto.last_modified && <p className="text-xs text-white">{new Date(selectedPhoto.last_modified).getHours() + 'h' + new Date(selectedPhoto.last_modified).getMinutes()}</p>}
              <button className="text-xs bg-white text-black px-2 py-1 rounded-md" onClick={()=> downloadPhoto(selectedPhoto.url, selectedPhoto.author_name + ".jpg")}>Télécharger</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
