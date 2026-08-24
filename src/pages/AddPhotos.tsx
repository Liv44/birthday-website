import { useEffect, useRef, useState, type FormEvent } from "react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { isSupabaseConfigured, SUPABASE_CONFIG_HELP } from "@/lib/supabase"
import { uploadPhoto } from "@/lib/supabase/storage"
import { FileDropzone } from "@/components/ui/file-upload/dropzone"
import { FileList } from "@/components/ui/file-upload/file-list"
import { SendIcon } from "lucide-react"

export default function AddPhotos() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [authorName, setAuthorName] = useState("")
  const [photos, setPhotos] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    console.log(photos)
  }, [photos])

  function handleAddPhotos(files: FileList | null) {
    if (files) {
      const filesArray = Array.from(files);
      console.log(filesArray)
      setPhotos((old) => [...old, ...filesArray])
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

    const lastModifiedDate = (photo: File) => {
      return photo.lastModified ? new Date(photo.lastModified).toISOString() : undefined
    }

    const results = await Promise.all(photos.map((photo) => uploadPhoto(photo, {
      authorName: authorName.trim(),
      name: photo.name,
      lastModified: lastModifiedDate(photo)
    })))
    const failed = results.find((result) => result.error)

    setLoading(false)
    if (failed?.error) {
      setError(failed.error.message)
      return
    }

    setPhotos([])
    setSuccess(true)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    console.log("IICICICI")
    handleAddPhotos(e.dataTransfer.files);
  };

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
            <SendIcon data-icon="inline-start"/>
            {loading ? "Envoi en cours…" : "Envoyer"}
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
