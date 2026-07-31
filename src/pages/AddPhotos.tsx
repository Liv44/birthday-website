import { useEffect, useRef, useState, type FormEvent } from "react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { isSupabaseConfigured, SUPABASE_CONFIG_HELP } from "@/lib/supabase"
import { uploadPhoto } from "@/lib/supabase/storage"

export default function AddPhotos() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [authorName, setAuthorName] = useState("")
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

    useEffect(()=> {
        console.log(photos)
    }, [photos])

  function handleAddPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (files) {
      const filesArray = Array.from(files);
      console.log(filesArray)
      setPhotos((old) => [...old, ...filesArray])
      setSuccess(false)
    }
    e.target.value = ""
  }

  function deletePhoto(index: number) {
    setPhotos((current) => current.filter((_, i) => i !== index))
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

    const lastModifiedDate = (photo: File)=> {
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

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-8">
      <h1 className="text-2xl font-semibold">Partager des photos</h1>
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

        <div className="flex flex-wrap items-center justify-center gap-2">
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleAddPhotos}
          />
          <Button type="button" onClick={() => inputRef.current?.click()} disabled={loading}>
            Ajouter des photos
          </Button>
          <Button type="submit" variant="secondary" disabled={loading || photos.length === 0}>
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
          <Button render={<Link to="/gallery" />} variant="outline" size="sm">
            Voir la galerie
          </Button>
        </div>
      )}

      {photos.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {photos.map((photo, index) => (
            <div key={`${photo.name}-${index}`} className="relative">
              <img
                src={URL.createObjectURL(photo)}
                alt={photo.name}
                className="h-20 w-20 rounded-md object-cover"
              />
              <button
                type="button"
                onClick={() => deletePhoto(index)}
                className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-center text-sm text-white"
                aria-label={`Retirer ${photo.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
