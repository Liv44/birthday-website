import { useRef, useState, type FormEvent } from "react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { isSupabaseConfigured, SUPABASE_CONFIG_HELP } from "@/lib/supabase"
import { uploadPhoto } from "@/lib/supabase/storage"
import { FileDropzone } from "@/components/ui/file-upload/dropzone"
import { FileList } from "@/components/ui/file-upload/file-list"
import { SendIcon } from "lucide-react"

const UPLOAD_CONCURRENCY = 3

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex
      nextIndex += 1
      results[index] = await fn(items[index], index)
    }
  }

  const workerCount = Math.min(concurrency, items.length)
  await Promise.all(Array.from({ length: workerCount }, () => worker()))
  return results
}

export default function AddPhotos() {
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [authorName, setAuthorName] = useState("")
  const [photos, setPhotos] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function handleAddPhotos(files: FileList | null) {
    if (files) {
      setPhotos((old) => [...old, ...Array.from(files)])
      setSuccess(false)
    }
  }

  async function handleUpload(e: FormEvent) {
    e.preventDefault()
    if (!authorName.trim()) {
      setError("Indique ton prénom ou ton nom.")
      return
    }
    if (photos.length === 0) {
      setError("Ajoute au moins une photo avant d’envoyer.")
      return
    }
    if (!isSupabaseConfigured()) {
      setError(SUPABASE_CONFIG_HELP)
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)
    setProgress({ done: 0, total: photos.length })

    const lastModifiedDate = (photo: File) => {
      return photo.lastModified ? new Date(photo.lastModified).toISOString() : undefined
    }

    const results = await mapWithConcurrency(photos, UPLOAD_CONCURRENCY, async (photo) => {
      const result = await uploadPhoto(photo, {
        authorName: authorName.trim(),
        name: photo.name,
        lastModified: lastModifiedDate(photo),
      })
      setProgress((current) => ({ ...current, done: current.done + 1 }))
      return result
    })

    const remaining = photos.filter((_, index) => results[index].error)
    const failedCount = remaining.length

    setLoading(false)
    setPhotos(remaining)
    if (failedCount > 0) {
      setError(
        failedCount === results.length
          ? "L’envoi a échoué. Réessaie avec une connexion plus stable."
          : `${failedCount} photo${failedCount > 1 ? "s" : ""} n’ont pas pu être envoyées. Réessaie les fichiers restants.`,
      )
      return
    }

    setSuccess(true)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleAddPhotos(e.dataTransfer.files)
  }

  const removeFile = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-8">
      <h1 className="font-display text-3xl font-semibold">Partager des photos</h1>
      <p className="max-w-md text-center text-muted-foreground">
        Ajoute tes photos de la soirée — elles apparaîtront dans la galerie avec ton nom.
      </p>

      <form className="flex w-full max-w-md flex-col gap-4" onSubmit={handleUpload}>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="author-name" className="text-sm font-medium">
            Ton prénom ou nom
          </label>
          <Input
            id="author-name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Ex. Camille"
            disabled={loading}
            required
          />
        </div>

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex flex-col gap-2 w-full">
            <FileDropzone
              cameraInputRef={cameraInputRef}
              handleCameraClick={() => cameraInputRef.current?.click()}
              fileInputRef={inputRef}
              handleBoxClick={() => inputRef.current?.click()}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              handleFileSelect={handleAddPhotos}
            />
            <div className="max-h-96 overflow-y-auto">
              <FileList
                removeFile={removeFile}
                uploadedFiles={photos}
              />
            </div>
          </div>
          <Button type="submit" variant="default" disabled={loading || photos.length === 0}>
            <SendIcon data-icon="inline-start" />
            {loading
              ? `Envoi ${progress.done}/${progress.total}…`
              : "Envoyer"}
          </Button>
        </div>
      </form>

      {error && (
        <p className="max-w-md text-center text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {success && (
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="max-w-md text-sm text-green-600" role="status">
            Photos envoyées avec succès, merci !
          </p>
          <Button render={<Link to="/gallery" />} variant="default" size="lg">
            Voir la galerie
          </Button>
        </div>
      )}
    </div>
  )
}
